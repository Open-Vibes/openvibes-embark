import { describe, it, expect } from "bun:test";
import {
  MAX_CONCURRENT,
  SESSION_MAX_CONCURRENT,
  packageKey,
  validateBatch,
  scheduleWaves,
  type DispatchUnit,
} from "../dispatchLaw";

describe("packageKey", () => {
  it("uses repo/package when a package is named", () => {
    expect(packageKey({ repo: "web", package: "aipe-site" })).toBe("web/aipe-site");
  });
  it("falls back to the bare repo for the implicit whole-repo package", () => {
    expect(packageKey({ repo: "web" })).toBe("web");
  });
});

describe("validateBatch — the parallel-dispatch law", () => {
  it("accepts distinct repos running in parallel", () => {
    const r = validateBatch([{ repo: "web" }, { repo: "api" }, { repo: "infra" }]);
    expect(r).toEqual({ ok: true, batch: 3 });
  });

  it("accepts distinct packages of one monorepo in parallel", () => {
    const r = validateBatch([
      { repo: "mono", package: "a" },
      { repo: "mono", package: "b" },
    ]);
    expect(r.ok).toBe(true);
  });

  it("REJECTs two units on the same package (serialize)", () => {
    const r = validateBatch([
      { repo: "mono", package: "a" },
      { repo: "mono", package: "a" },
    ]);
    expect(r).toEqual({ ok: false, reason: "same-package mono/a" });
  });

  it("REJECTs two whole-repo units on the same repo as same-repo", () => {
    const r = validateBatch([{ repo: "web" }, { repo: "web" }]);
    expect(r).toEqual({ ok: false, reason: "same-repo web" });
  });

  it("accepts exactly the concurrency cap of 16", () => {
    const units: DispatchUnit[] = Array.from({ length: MAX_CONCURRENT }, (_, i) => ({ repo: `r${i}` }));
    expect(validateBatch(units)).toEqual({ ok: true, batch: 16 });
  });

  it("REJECTs one over the cap", () => {
    const units: DispatchUnit[] = Array.from({ length: MAX_CONCURRENT + 1 }, (_, i) => ({ repo: `r${i}` }));
    expect(validateBatch(units)).toEqual({ ok: false, reason: "cap-exceeded 17" });
  });

  it("REJECTs more than 4 session-mode units", () => {
    const units: DispatchUnit[] = Array.from({ length: SESSION_MAX_CONCURRENT + 1 }, (_, i) => ({
      repo: `r${i}`,
      mode: "session" as const,
      harness: "claude-code" as const,
    }));
    expect(validateBatch(units)).toEqual({ ok: false, reason: "session-cap-exceeded 5" });
  });

  it("REJECTs a session dispatch to a non-containable harness", () => {
    const r = validateBatch([{ repo: "web", mode: "session", harness: "codex" }]);
    expect(r).toEqual({ ok: false, reason: "harness-not-containable codex" });
  });

  it("allows a session dispatch to a containable harness", () => {
    const r = validateBatch([{ repo: "web", mode: "session", harness: "gemini" }]);
    expect(r.ok).toBe(true);
  });
});

describe("scheduleWaves — serialize on the same package, parallel across packages", () => {
  it("keeps distinct repos in one wave", () => {
    const waves = scheduleWaves([{ repo: "a" }, { repo: "b" }, { repo: "c" }]);
    expect(waves).toHaveLength(1);
    expect(waves[0]?.units).toHaveLength(3);
  });

  it("splits same-package units into consecutive waves", () => {
    const waves = scheduleWaves([
      { repo: "mono", package: "x" },
      { repo: "mono", package: "x" },
      { repo: "mono", package: "x" },
    ]);
    expect(waves).toHaveLength(3);
    expect(waves.every((w) => w.units.length === 1)).toBe(true);
  });

  it("honours the 16-wide ceiling", () => {
    const units: DispatchUnit[] = Array.from({ length: 20 }, (_, i) => ({ repo: `r${i}` }));
    const waves = scheduleWaves(units);
    expect(waves[0]?.units).toHaveLength(16);
    expect(waves[1]?.units).toHaveLength(4);
  });

  it("clamps an over-large requested cap to 16", () => {
    const units: DispatchUnit[] = Array.from({ length: 18 }, (_, i) => ({ repo: `r${i}` }));
    const waves = scheduleWaves(units, 999);
    expect(waves[0]?.units).toHaveLength(16);
  });
});
