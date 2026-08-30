import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { rmSync, existsSync } from "node:fs";
import {
  getActivePackages,
  cloudflareProjectName,
  netlifyProjectName,
  gcpServiceName,
  workerScriptName,
  findOrphanCloudflareProjects,
  findOrphanNetlifySites,
  findOrphanCloudRunServices,
  findOrphanCloudflareWorkers,
} from "../cleanup-orphan-apps";
import type { ActivePackage } from "../cleanup-orphan-apps";

const TEST_DIR = join(tmpdir(), `embark-cleanup-orphan-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
const PACKAGES_DIR = join(TEST_DIR, "packages");

const completeConfig = {
  deploy: { appDeployment: "cloudflare-pages", cloudflareUse: true, workflowGen: true },
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

async function createPackage(dirName: string, config: Record<string, unknown>) {
  const pkgDir = join(PACKAGES_DIR, dirName);
  await mkdir(pkgDir, { recursive: true });
  await writeFile(join(pkgDir, ".embark.jsonc"), JSON.stringify(config, null, 2));
}

function buildActiveMap(packages: ActivePackage[]): Map<string, ActivePackage> {
  const map = new Map<string, ActivePackage>();
  for (const pkg of packages) {
    map.set(pkg.subdomain || pkg.folderName, pkg);
  }
  return map;
}

// ── Naming patterns ──────────────────────────────────────────

describe("cloudflareProjectName", () => {
  it("returns domainPrefix-subdomain for standard projects", () => {
    expect(cloudflareProjectName("my-app", false, "embark", true)).toBe("embark-my-app");
  });

  it("returns domainPrefix for root domain", () => {
    expect(cloudflareProjectName("", true, "embark", true)).toBe("embark");
  });

  it("returns packageName when no domain setup", () => {
    expect(cloudflareProjectName("my-app", false, "embark", false, "my-app")).toBe("my-app");
  });

  it("replaces dots with dashes", () => {
    expect(cloudflareProjectName("api.v2", false, "embark", true)).toBe("embark-api-v2");
  });
});

describe("netlifyProjectName", () => {
  it("returns subdomain-embark", () => {
    expect(netlifyProjectName("my-app")).toBe("my-app-embark");
  });
});

describe("gcpServiceName", () => {
  it("returns lowercase package name", () => {
    expect(gcpServiceName("MyApp")).toBe("myapp");
  });

  it("returns already lowercase name unchanged", () => {
    expect(gcpServiceName("my-app")).toBe("my-app");
  });
});

// ── getActivePackages ────────────────────────────────────────

describe("getActivePackages", () => {
  beforeEach(setup);
  afterEach(teardown);

  it("returns empty map when no packages exist", async () => {
    const result = await getActivePackages(PACKAGES_DIR);
    expect(result.size).toBe(0);
  });

  it("returns packages with complete config", async () => {
    await createPackage("my-app", completeConfig);

    const result = await getActivePackages(PACKAGES_DIR);
    expect(result.size).toBe(1);
    expect(result.has("my-app")).toBe(true);

    const pkg = result.get("my-app");
    expect(pkg?.folderName).toBe("my-app");
    expect(pkg?.deploy).toBe("cloudflare-pages");
    expect(pkg?.cloudflareUse).toBe(true);
  });

  it("skips packages with incomplete config", async () => {
    const pkgDir = join(PACKAGES_DIR, "incomplete");
    await mkdir(pkgDir, { recursive: true });
    await writeFile(join(pkgDir, ".embark.jsonc"), JSON.stringify({ name: "inc" }));

    const result = await getActivePackages(PACKAGES_DIR);
    expect(result.size).toBe(0);
  });

  it("handles multiple packages", async () => {
    await createPackage("app-a", { ...completeConfig, name: "appA", subdomain: "a" });
    await createPackage("app-b", {
      ...completeConfig,
      name: "appB",
      subdomain: "b",
      deploy: { appDeployment: "netlify", cloudflareUse: false, workflowGen: true },
    });

    const result = await getActivePackages(PACKAGES_DIR);
    expect(result.size).toBe(2);
    expect(result.has("a")).toBe(true);
    expect(result.has("b")).toBe(true);
  });

  it("handles non-existent packages directory", async () => {
    const result = await getActivePackages(join(TEST_DIR, "nonexistent"));
    expect(result.size).toBe(0);
  });
});

// ── findOrphanCloudflareProjects ─────────────────────────────

describe("findOrphanCloudflareProjects", () => {
  it("returns empty when all projects have active packages", () => {
    const active = buildActiveMap([
      { folderName: "my-app", subdomain: "my-app", rootDomain: false, deploy: "cloudflare-pages", cloudflareUse: true },
    ]);

    const orphans = findOrphanCloudflareProjects(
      ["embark-my-app", "unrelated-project"],
      active,
      "embark",
    );

    expect(orphans).toHaveLength(0);
  });

  it("identifies orphan projects matching domain prefix", () => {
    const active = buildActiveMap([
      { folderName: "my-app", subdomain: "my-app", rootDomain: false, deploy: "cloudflare-pages", cloudflareUse: true },
    ]);

    const orphans = findOrphanCloudflareProjects(
      ["embark-my-app", "embark-deleted-app"],
      active,
      "embark",
    );

    expect(orphans).toHaveLength(1);
    expect(orphans[0]?.resource.name).toBe("embark-deleted-app");
    expect(orphans[0]?.subdomain).toBe("deleted-app");
  });

  it("ignores projects not matching domain prefix", () => {
    const active = buildActiveMap([]);

    const orphans = findOrphanCloudflareProjects(
      ["some-other-project", "unrelated"],
      active,
      "embark",
    );

    expect(orphans).toHaveLength(0);
  });

  it("handles root domain project as orphan", () => {
    const active = buildActiveMap([]);

    const orphans = findOrphanCloudflareProjects(
      ["embark"],
      active,
      "embark",
    );

    expect(orphans).toHaveLength(1);
    expect(orphans[0]?.subdomain).toBe("");
  });

  it("does not flag root domain project when active", () => {
    const active = buildActiveMap([
      { folderName: "main-site", subdomain: "", rootDomain: true, deploy: "cloudflare-pages", cloudflareUse: true },
    ]);

    const orphans = findOrphanCloudflareProjects(
      ["embark"],
      active,
      "embark",
    );

    expect(orphans).toHaveLength(0);
  });
});

// ── findOrphanNetlifySites ───────────────────────────────────

describe("findOrphanNetlifySites", () => {
  it("returns empty when all sites have active packages", () => {
    const active = buildActiveMap([
      { folderName: "my-app", subdomain: "my-app", rootDomain: false, deploy: "netlify", cloudflareUse: false },
    ]);

    const orphans = findOrphanNetlifySites(["my-app-embark", "other-site"], active);

    expect(orphans).toHaveLength(0);
  });

  it("identifies orphan sites matching naming pattern", () => {
    const active = buildActiveMap([
      { folderName: "my-app", subdomain: "my-app", rootDomain: false, deploy: "netlify", cloudflareUse: false },
    ]);

    const orphans = findOrphanNetlifySites(
      ["my-app-embark", "deleted-app-embark"],
      active,
    );

    expect(orphans).toHaveLength(1);
    expect(orphans[0]?.resource.name).toBe("deleted-app-embark");
    expect(orphans[0]?.subdomain).toBe("deleted-app");
  });

  it("ignores sites not matching naming pattern", () => {
    const active = buildActiveMap([]);

    const orphans = findOrphanNetlifySites(
      ["some-other-site", "my-blog"],
      active,
    );

    expect(orphans).toHaveLength(0);
  });
});

// ── findOrphanCloudRunServices ───────────────────────────────

describe("findOrphanCloudRunServices", () => {
  it("returns empty when all services have active packages", () => {
    const active = buildActiveMap([
      { folderName: "my-api", subdomain: "my-api", rootDomain: false, deploy: "gcp", cloudflareUse: false },
    ]);

    const orphans = findOrphanCloudRunServices(["my-api"], active);
    expect(orphans).toHaveLength(0);
  });

  it("identifies orphan services", () => {
    const active = buildActiveMap([
      { folderName: "my-api", subdomain: "my-api", rootDomain: false, deploy: "gcp", cloudflareUse: false },
    ]);

    const orphans = findOrphanCloudRunServices(["my-api", "deleted-api"], active);

    expect(orphans).toHaveLength(1);
    expect(orphans[0]?.resource.name).toBe("deleted-api");
  });

  it("returns empty for empty service list", () => {
    const active = buildActiveMap([]);
    const orphans = findOrphanCloudRunServices([], active);
    expect(orphans).toHaveLength(0);
  });
});

// ── workerScriptName ────────────────────────────────────────

describe("workerScriptName", () => {
  it("returns domainPrefix-subdomain for standard workers", () => {
    expect(workerScriptName("my-api", false, "embark", true)).toBe("embark-my-api");
  });

  it("returns domainPrefix for root domain", () => {
    expect(workerScriptName("", true, "embark", true)).toBe("embark");
  });

  it("returns packageName when no domain setup", () => {
    expect(workerScriptName("my-api", false, "embark", false, "my-api")).toBe("my-api");
  });

  it("replaces dots with dashes", () => {
    expect(workerScriptName("api.v2", false, "embark", true)).toBe("embark-api-v2");
  });
});

// ── findOrphanCloudflareWorkers ─────────────────────────────

describe("findOrphanCloudflareWorkers", () => {
  it("returns empty when all workers have active packages", () => {
    const active = buildActiveMap([
      { folderName: "my-api", subdomain: "my-api", rootDomain: false, deploy: "cloudflare-workers", cloudflareUse: true },
    ]);

    const orphans = findOrphanCloudflareWorkers(
      ["embark-my-api", "unrelated-worker"],
      active,
      "embark",
    );

    expect(orphans).toHaveLength(0);
  });

  it("identifies orphan workers matching domain prefix", () => {
    const active = buildActiveMap([
      { folderName: "my-api", subdomain: "my-api", rootDomain: false, deploy: "cloudflare-workers", cloudflareUse: true },
    ]);

    const orphans = findOrphanCloudflareWorkers(
      ["embark-my-api", "embark-deleted-api"],
      active,
      "embark",
    );

    expect(orphans).toHaveLength(1);
    expect(orphans[0]?.resource.name).toBe("embark-deleted-api");
    expect(orphans[0]?.resource.type).toBe("cloudflare-workers");
    expect(orphans[0]?.subdomain).toBe("deleted-api");
  });

  it("ignores workers not matching domain prefix", () => {
    const active = buildActiveMap([]);

    const orphans = findOrphanCloudflareWorkers(
      ["some-other-worker", "unrelated"],
      active,
      "embark",
    );

    expect(orphans).toHaveLength(0);
  });

  it("handles root domain worker as orphan", () => {
    const active = buildActiveMap([]);

    const orphans = findOrphanCloudflareWorkers(
      ["embark"],
      active,
      "embark",
    );

    expect(orphans).toHaveLength(1);
    expect(orphans[0]?.subdomain).toBe("");
  });

  it("does not flag root domain worker when active", () => {
    const active = buildActiveMap([
      { folderName: "main-api", subdomain: "", rootDomain: true, deploy: "cloudflare-workers", cloudflareUse: true },
    ]);

    const orphans = findOrphanCloudflareWorkers(
      ["embark"],
      active,
      "embark",
    );

    expect(orphans).toHaveLength(0);
  });
});
