import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { testDir } from "./test-utils";
import { rmSync, existsSync } from "node:fs";
import { buildPackageScripts, updateRootScripts } from "../update-root-scripts";

const TEST_DIR = testDir("root-scripts");
const PACKAGES_DIR = join(TEST_DIR, "packages");

const completeConfig = {
  deploy: { appDeployment: "gcp", cloudflareUse: false, workflowGen: true },
  name: "myApp",
  title: "My App",
  subdomain: "my-app",
  description: "A great app",
  useSubmodule: false,
};

async function setup() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
  await mkdir(PACKAGES_DIR, { recursive: true });
}

async function teardown() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
}

async function createPackage(
  dirName: string,
  embarkConfig: Record<string, unknown>,
) {
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

async function createRootPackageJson(scripts: Record<string, string>) {
  await writeFile(
    join(TEST_DIR, "package.json"),
    JSON.stringify({ name: "root", scripts }, null, 2) + "\n",
  );
}

describe("buildPackageScripts", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("returns script for package with complete config", async () => {
    await createPackage("my-app", { ...completeConfig, name: "myApp" });

    const scripts = await buildPackageScripts(PACKAGES_DIR);

    expect(scripts["myApp"]).toBe("bun run --filter @embark/my-app dev");
  });

  it("returns empty object when no packages exist", async () => {
    const scripts = await buildPackageScripts(PACKAGES_DIR);
    expect(scripts).toEqual({});
  });

  it("skips packages without complete .embark.jsonc", async () => {
    const pkgDir = join(PACKAGES_DIR, "incomplete");
    await mkdir(pkgDir, { recursive: true });
    await writeFile(
      join(pkgDir, ".embark.jsonc"),
      JSON.stringify({ name: "incomplete" }, null, 2),
    );

    const scripts = await buildPackageScripts(PACKAGES_DIR);
    expect(Object.keys(scripts)).toHaveLength(0);
  });

  it("returns scripts for multiple packages", async () => {
    await createPackage("app-a", { ...completeConfig, name: "appA", subdomain: "app-a" });
    await createPackage("app-b", { ...completeConfig, name: "appB", subdomain: "app-b" });

    const scripts = await buildPackageScripts(PACKAGES_DIR);

    expect(scripts["appA"]).toBe("bun run --filter @embark/app-a dev");
    expect(scripts["appB"]).toBe("bun run --filter @embark/app-b dev");
  });

  it("handles non-existent packages directory", async () => {
    const scripts = await buildPackageScripts(join(TEST_DIR, "nonexistent"));
    expect(scripts).toEqual({});
  });
});

describe("updateRootScripts", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("adds package scripts to root package.json", async () => {
    await createPackage("my-app", { ...completeConfig, name: "myApp" });
    await createRootPackageJson({ test: "bun test" });

    const changed = await updateRootScripts(PACKAGES_DIR, TEST_DIR);
    expect(changed).toBe(true);

    const pkgJson = JSON.parse(await readFile(join(TEST_DIR, "package.json"), "utf-8"));
    expect(pkgJson.scripts["myApp"]).toBe("bun run --filter @embark/my-app dev");
    expect(pkgJson.scripts["test"]).toBe("bun test");
  });

  it("returns false when scripts are already up to date", async () => {
    await createPackage("my-app", { ...completeConfig, name: "myApp" });
    await createRootPackageJson({
      test: "bun test",
      myApp: "bun run --filter @embark/my-app dev",
    });

    const changed = await updateRootScripts(PACKAGES_DIR, TEST_DIR);
    expect(changed).toBe(false);
  });

  it("removes stale package scripts for deleted packages", async () => {
    await createRootPackageJson({
      test: "bun test",
      oldApp: "bun run --filter @embark/old-app dev",
    });

    const changed = await updateRootScripts(PACKAGES_DIR, TEST_DIR);
    expect(changed).toBe(true);

    const pkgJson = JSON.parse(await readFile(join(TEST_DIR, "package.json"), "utf-8"));
    expect(pkgJson.scripts["oldApp"]).toBeUndefined();
    expect(pkgJson.scripts["test"]).toBe("bun test");
  });

  it("returns false when root package.json does not exist", async () => {
    const changed = await updateRootScripts(PACKAGES_DIR, join(TEST_DIR, "nonexistent"));
    expect(changed).toBe(false);
  });

  it("preserves non-package scripts", async () => {
    await createPackage("my-app", { ...completeConfig, name: "myApp" });
    await createRootPackageJson({
      prepare: "husky",
      test: "bun test",
      "new-package": "bun scripts/create-package.ts",
    });

    await updateRootScripts(PACKAGES_DIR, TEST_DIR);

    const pkgJson = JSON.parse(await readFile(join(TEST_DIR, "package.json"), "utf-8"));
    expect(pkgJson.scripts["prepare"]).toBe("husky");
    expect(pkgJson.scripts["test"]).toBe("bun test");
    expect(pkgJson.scripts["new-package"]).toBe("bun scripts/create-package.ts");
  });
});
