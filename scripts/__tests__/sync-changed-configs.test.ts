import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { rmSync, existsSync } from "node:fs";
import { syncWorkflowForPackage } from "../sync-changed-configs";

const TEST_DIR = join(tmpdir(), `embark-sync-changed-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
const PACKAGES_DIR = join(TEST_DIR, "packages");
const WORKFLOWS_DIR = join(TEST_DIR, "workflows");

const completeConfig = {
  deploy: { appDeployment: "netlify", cloudflareUse: true, workflowGen: true },
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
  await mkdir(WORKFLOWS_DIR, { recursive: true });
}

async function teardown() {
  if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true, force: true });
}

async function createPackage(dirName: string, config: Record<string, unknown>) {
  const pkgDir = join(PACKAGES_DIR, dirName);
  await mkdir(pkgDir, { recursive: true });
  await writeFile(join(pkgDir, ".embark.jsonc"), JSON.stringify(config, null, 2));
}

async function createWorkflow(name: string, content: string) {
  await writeFile(join(WORKFLOWS_DIR, `${name}.yml`), content);
}

describe("syncWorkflowForPackage", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("returns false when workflow does not exist", async () => {
    await createPackage("my-app", completeConfig);

    const result = await syncWorkflowForPackage("my-app", PACKAGES_DIR, WORKFLOWS_DIR);
    expect(result).toBe(false);
  });

  it("returns false when config has no deploy info", async () => {
    await createPackage("my-app", { name: "myApp" });
    await createWorkflow("my-app", "old content");

    const result = await syncWorkflowForPackage("my-app", PACKAGES_DIR, WORKFLOWS_DIR);
    expect(result).toBe(false);
  });

  it("updates workflow when subdomain changes", async () => {
    await createPackage("my-app", completeConfig);

    // Create a workflow with wrong subdomain
    await createWorkflow("my-app", "env:\n  SUBDOMAIN: old-subdomain\n");

    const result = await syncWorkflowForPackage("my-app", PACKAGES_DIR, WORKFLOWS_DIR);
    expect(result).toBe(true);

    const content = await readFile(join(WORKFLOWS_DIR, "my-app.yml"), "utf-8");
    expect(content).toContain("SUBDOMAIN: my-app");
    expect(content).not.toContain("old-subdomain");
  });

  it("preserves EMBARK:CUSTOM blocks", async () => {
    await createPackage("my-app", completeConfig);

    // Generate a valid workflow first, then add custom block
    const { buildWorkflowContent } = await import("../generate-workflows");
    const validContent = await buildWorkflowContent(
      "my-app",
      "netlify",
      true,
      "old-sub",
      false,
      false,
    );

    // Insert custom block after a known line
    const lines = validContent.split("\n");
    const checkoutIdx = lines.findIndex((l) => l.includes("uses: actions/checkout@v4"));
    if (checkoutIdx >= 0) {
      lines.splice(checkoutIdx + 1, 0,
        "      # EMBARK:CUSTOM",
        "      - name: Custom Step",
        "        run: echo custom",
        "      # END EMBARK:CUSTOM",
      );
    }
    await createWorkflow("my-app", lines.join("\n"));

    const result = await syncWorkflowForPackage("my-app", PACKAGES_DIR, WORKFLOWS_DIR);
    expect(result).toBe(true);

    const content = await readFile(join(WORKFLOWS_DIR, "my-app.yml"), "utf-8");
    expect(content).toContain("SUBDOMAIN: my-app");
    expect(content).toContain("# EMBARK:CUSTOM");
    expect(content).toContain("Custom Step");
    expect(content).toContain("# END EMBARK:CUSTOM");
  });

  it("returns false when content is already in sync", async () => {
    await createPackage("my-app", completeConfig);

    const { buildWorkflowContent } = await import("../generate-workflows");
    const content = await buildWorkflowContent(
      "my-app",
      "netlify",
      true,
      "my-app",
      false,
      false,
    );
    await createWorkflow("my-app", content);

    const result = await syncWorkflowForPackage("my-app", PACKAGES_DIR, WORKFLOWS_DIR);
    expect(result).toBe(false);
  });
});
