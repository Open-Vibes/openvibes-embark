import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { testDir } from "./test-utils";
import { rmSync, existsSync } from "node:fs";
import { buildAppsEntries, updateAppsJsonc } from "../update-apps-jsonc";

const TEST_DIR = testDir("apps-jsonc");
const PACKAGES_DIR = join(TEST_DIR, "packages");

const completeConfig = {
  deploy: { appDeployment: "gcp", cloudflareUse: false, workflowGen: true },
  name: "myApp",
  title: "My App",
  subdomain: "my-app",
  description: "A great app",
  rootDomain: false,
  useSubmodule: false,
};

async function setup() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
  await mkdir(PACKAGES_DIR, { recursive: true });
}

async function teardown() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
}

async function createPackage(dirName: string, embarkConfig: Record<string, unknown>) {
  const pkgDir = join(PACKAGES_DIR, dirName);
  await mkdir(pkgDir, { recursive: true });
  await writeFile(
    join(pkgDir, ".embark.jsonc"),
    `// auto-generated\n${JSON.stringify(embarkConfig, null, 2)}\n`,
  );
  await writeFile(
    join(pkgDir, "package.json"),
    JSON.stringify({ name: `@embark/${dirName}` }, null, 2) + "\n",
  );
}

describe("buildAppsEntries", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("returns entry with folderName for package with complete config", async () => {
    await createPackage("my-app", completeConfig);

    const apps = await buildAppsEntries(PACKAGES_DIR);

    expect(apps).toHaveLength(1);
    expect(apps[0]).toEqual({
      name: "myApp",
      folderName: "my-app",
      rootDomain: false,
      subdomain: "my-app",
      appDeployment: "gcp",
      cloudflareUse: false,
    });
  });

  it("returns empty array when no packages exist", async () => {
    const apps = await buildAppsEntries(PACKAGES_DIR);
    expect(apps).toEqual([]);
  });

  it("handles rootDomain: true", async () => {
    await createPackage("root-app", {
      ...completeConfig,
      name: "rootApp",
      rootDomain: true,
      subdomain: "",
    });

    const apps = await buildAppsEntries(PACKAGES_DIR);

    expect(apps[0]?.rootDomain).toBe(true);
    expect(apps[0]?.name).toBe("rootApp");
    expect(apps[0]?.folderName).toBe("root-app");
  });

  it("defaults rootDomain to false when not set", async () => {
    const configWithoutRootDomain = { ...completeConfig };
    // @ts-expect-error — intentionally removing field for test
    delete configWithoutRootDomain.rootDomain;
    await createPackage("my-app", configWithoutRootDomain);

    const apps = await buildAppsEntries(PACKAGES_DIR);

    expect(apps[0]?.rootDomain).toBe(false);
  });

  it("skips packages without complete .embark.jsonc", async () => {
    const pkgDir = join(PACKAGES_DIR, "incomplete");
    await mkdir(pkgDir, { recursive: true });
    await writeFile(
      join(pkgDir, ".embark.jsonc"),
      JSON.stringify({ name: "incomplete" }, null, 2),
    );

    const apps = await buildAppsEntries(PACKAGES_DIR);
    expect(apps).toHaveLength(0);
  });

  it("returns entries sorted by name", async () => {
    await createPackage("zoo-app", { ...completeConfig, name: "zooApp", subdomain: "zoo" });
    await createPackage("alpha-app", { ...completeConfig, name: "alphaApp", subdomain: "alpha" });

    const apps = await buildAppsEntries(PACKAGES_DIR);

    expect(apps[0]?.name).toBe("alphaApp");
    expect(apps[1]?.name).toBe("zooApp");
  });

  it("handles non-existent packages directory", async () => {
    const apps = await buildAppsEntries(join(TEST_DIR, "nonexistent"));
    expect(apps).toEqual([]);
  });
});

describe("updateAppsJsonc", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("creates apps.jsonc when it does not exist", async () => {
    await createPackage("my-app", completeConfig);

    const changed = await updateAppsJsonc(PACKAGES_DIR, TEST_DIR);
    expect(changed).toBe(true);

    const content = await readFile(join(TEST_DIR, "apps.jsonc"), "utf-8");
    const parsed = JSON.parse(content);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual({
      name: "myApp",
      folderName: "my-app",
      rootDomain: false,
      subdomain: "my-app",
      appDeployment: "gcp",
      cloudflareUse: false,
    });
  });

  it("returns false when apps.jsonc is already up to date", async () => {
    await createPackage("my-app", completeConfig);

    await updateAppsJsonc(PACKAGES_DIR, TEST_DIR);
    const changed = await updateAppsJsonc(PACKAGES_DIR, TEST_DIR);

    expect(changed).toBe(false);
  });

  it("adds new packages without removing deleted ones", async () => {
    await createPackage("my-app", completeConfig);
    await updateAppsJsonc(PACKAGES_DIR, TEST_DIR);

    // Add new package but keep old one in the filesystem first to simulate state
    await createPackage("other-app", { ...completeConfig, name: "otherApp", subdomain: "other" });
    const changed = await updateAppsJsonc(PACKAGES_DIR, TEST_DIR);
    expect(changed).toBe(true);

    const content = await readFile(join(TEST_DIR, "apps.jsonc"), "utf-8");
    const parsed = JSON.parse(content);
    expect(parsed).toHaveLength(2);
  });

  it("removes entries for deleted packages", async () => {
    // Start with two packages
    await createPackage("my-app", completeConfig);
    await createPackage("other-app", { ...completeConfig, name: "otherApp", subdomain: "other" });
    await updateAppsJsonc(PACKAGES_DIR, TEST_DIR);

    // Simulate deletion: remove other-app from filesystem but keep my-app
    rmSync(join(PACKAGES_DIR, "other-app"), { recursive: true, force: true });

    const changed = await updateAppsJsonc(PACKAGES_DIR, TEST_DIR);
    expect(changed).toBe(true);

    const content = await readFile(join(TEST_DIR, "apps.jsonc"), "utf-8");
    const parsed = JSON.parse(content);
    // Only the remaining package should be present
    expect(parsed).toHaveLength(1);
    expect(parsed[0].folderName).toBe("my-app");
  });

  it("creates empty array when no packages exist and no prior file", async () => {
    const changed = await updateAppsJsonc(PACKAGES_DIR, TEST_DIR);
    expect(changed).toBe(true);

    const content = await readFile(join(TEST_DIR, "apps.jsonc"), "utf-8");
    expect(JSON.parse(content)).toEqual([]);
  });

  it("generates valid JSON output", async () => {
    await createPackage("my-app", completeConfig);

    await updateAppsJsonc(PACKAGES_DIR, TEST_DIR);

    const content = await readFile(join(TEST_DIR, "apps.jsonc"), "utf-8");
    expect(() => JSON.parse(content)).not.toThrow();
  });
});
