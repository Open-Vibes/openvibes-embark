import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { testDir } from "./test-utils";
import { rmSync, existsSync } from "node:fs";
import { normalizePackageJson, normalizeAllPackages } from "../normalize-package-json";

const TEST_DIR = testDir("normalize");
const PACKAGES_DIR = join(TEST_DIR, "packages");

async function setup() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
  await mkdir(PACKAGES_DIR, { recursive: true });
}

async function teardown() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
}

async function createPackage(
  name: string,
  pkgJson: Record<string, unknown>,
  embarkConfig?: Record<string, unknown>,
) {
  const pkgDir = join(PACKAGES_DIR, name);
  await mkdir(pkgDir, { recursive: true });
  await writeFile(join(pkgDir, "package.json"), JSON.stringify(pkgJson, null, 2) + "\n");
  if (embarkConfig) {
    await writeFile(
      join(pkgDir, ".embark.jsonc"),
      `// auto-generated\n${JSON.stringify(embarkConfig, null, 2)}\n`,
    );
  }
}

const completeConfig = {
  deploy: { appDeployment: "gcp", cloudflareUse: false, workflowGen: true },
  name: "myApp",
  title: "My App",
  subdomain: "my-app",
  description: "A great app",
  useSubmodule: false,
};

describe("normalizePackageJson", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("should update name to @embark/<pkgName> if not set", async () => {
    await createPackage("myApp", { name: "myApp" }, completeConfig);
    const pkgDir = join(PACKAGES_DIR, "myApp");

    const changed = await normalizePackageJson(pkgDir, "myApp");
    expect(changed).toBe(true);

    const updated = JSON.parse(await readFile(join(pkgDir, "package.json"), "utf-8"));
    expect(updated.name).toBe("@embark/myApp");
  });

  it("should not update name if already correct", async () => {
    await createPackage("myApp", { name: "@embark/myApp", description: "A great app" }, completeConfig);
    const pkgDir = join(PACKAGES_DIR, "myApp");

    const changed = await normalizePackageJson(pkgDir, "myApp");
    expect(changed).toBe(false);
  });

  it("should sync description from .embark.jsonc", async () => {
    await createPackage("myApp", { name: "@embark/myApp", description: "old desc" }, completeConfig);
    const pkgDir = join(PACKAGES_DIR, "myApp");

    const changed = await normalizePackageJson(pkgDir, "myApp");
    expect(changed).toBe(true);

    const updated = JSON.parse(await readFile(join(pkgDir, "package.json"), "utf-8"));
    expect(updated.description).toBe("A great app");
  });

  it("should return false if package.json does not exist", async () => {
    const pkgDir = join(PACKAGES_DIR, "ghost");
    await mkdir(pkgDir, { recursive: true });
    await writeFile(
      join(pkgDir, ".embark.jsonc"),
      `// auto-generated\n${JSON.stringify(completeConfig, null, 2)}\n`,
    );

    const changed = await normalizePackageJson(pkgDir, "ghost");
    expect(changed).toBe(false);
  });

  it("should return false if .embark.jsonc is missing", async () => {
    await createPackage("noConfig", { name: "noConfig" });
    const pkgDir = join(PACKAGES_DIR, "noConfig");

    const changed = await normalizePackageJson(pkgDir, "noConfig");
    expect(changed).toBe(false);
  });
});

describe("normalizeAllPackages", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("should normalize all packages with complete config", async () => {
    await createPackage("appA", { name: "appA", description: "wrong" }, {
      ...completeConfig,
      name: "appA",
      description: "Correct description",
    });
    await createPackage("appB", { name: "@embark/appB", description: "Correct" }, {
      ...completeConfig,
      name: "appB",
      description: "Correct",
    });

    await normalizeAllPackages(PACKAGES_DIR, TEST_DIR);

    const aJson = JSON.parse(await readFile(join(PACKAGES_DIR, "appA", "package.json"), "utf-8"));
    expect(aJson.name).toBe("@embark/appA");
    expect(aJson.description).toBe("Correct description");

    const bJson = JSON.parse(await readFile(join(PACKAGES_DIR, "appB", "package.json"), "utf-8"));
    expect(bJson.name).toBe("@embark/appB");
  });

  it("should skip packages without complete .embark.jsonc", async () => {
    await createPackage("incomplete", { name: "incomplete" }, { name: "incomplete" });

    await normalizeAllPackages(PACKAGES_DIR, TEST_DIR);

    const pkgJson = JSON.parse(await readFile(join(PACKAGES_DIR, "incomplete", "package.json"), "utf-8"));
    expect(pkgJson.name).toBe("incomplete");
  });

  it("should handle empty packages directory", async () => {
    await normalizeAllPackages(PACKAGES_DIR, TEST_DIR);
    // Should not throw
  });

  it("should handle non-existent packages directory", async () => {
    await normalizeAllPackages(join(TEST_DIR, "nonexistent"), TEST_DIR);
    // Should not throw
  });
});
