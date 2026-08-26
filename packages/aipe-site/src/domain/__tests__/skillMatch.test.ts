import { describe, it, expect } from "bun:test";
import {
  KITS,
  matchKit,
  matchSkills,
  matchSummary,
  type SkillMatchTask,
} from "../skillMatch";

const frontendLarge: SkillMatchTask = { taskType: "frontend", size: "large" };
const copySmall: SkillMatchTask = { taskType: "copy", size: "small" };
const featureLarge: SkillMatchTask = { taskType: "feature", size: "large" };
const refactorMedium: SkillMatchTask = { taskType: "refactor", size: "medium" };

describe("skillMatch — the sdd-lite floor is always on", () => {
  it("sdd-lite matches every task type and size (it is the floor)", () => {
    for (const task of [frontendLarge, copySmall, featureLarge, refactorMedium]) {
      const v = matchKit(KITS["sdd-lite"], task);
      expect(v.matched).toBe(true);
      expect(v.floor).toBe(true);
    }
  });
});

describe("skillMatch — a heavy kit is never dragged onto a trivial task", () => {
  it("a one-line copy change routes to only the floor", () => {
    const summary = matchSummary(copySmall);
    expect(summary.routed).toEqual(["sdd-lite"]);
    expect(summary.matchedCount).toBe(1);
  });

  it("spec-kit is declined for a UI-dominant frontend unit", () => {
    const verdicts = matchSkills(frontendLarge);
    const spec = verdicts.find((v) => v.kit === "spec-kit");
    expect(spec?.matched).toBe(false);
    expect(spec?.reason).toContain("skip-for");
  });

  it("the aipe-site unit (frontend · large) routes to sdd-lite only", () => {
    expect(matchSummary(frontendLarge).routed).toEqual(["sdd-lite"]);
  });
});

describe("skillMatch — heavy kits match the work they are built for", () => {
  it("spec-kit matches a substantial feature", () => {
    const spec = matchSkills(featureLarge).find((v) => v.kit === "spec-kit");
    expect(spec?.matched).toBe(true);
  });

  it("spec-kit declines a size below its minSize", () => {
    const spec = matchSkills({ taskType: "feature", size: "small" }).find((v) => v.kit === "spec-kit");
    expect(spec?.matched).toBe(false);
    expect(spec?.reason).toContain("min-size");
  });

  it("pdd matches a refactor but not a feature", () => {
    expect(matchSkills(refactorMedium).find((v) => v.kit === "pdd")?.matched).toBe(true);
    expect(matchSkills(featureLarge).find((v) => v.kit === "pdd")?.matched).toBe(false);
  });
});

describe("skillMatch — the summary is internally consistent", () => {
  it("routed kits are exactly the matched verdicts, in kit order", () => {
    const summary = matchSummary(featureLarge);
    const matched = summary.verdicts.filter((v) => v.matched).map((v) => v.kit);
    expect(summary.routed).toEqual(matched);
    expect(summary.matchedCount).toBe(matched.length);
  });
});
