/**
 * Skill-match routing — which framework kit a task is routed to, exactly as
 * `aipe skill match` decides it. Traceable to
 * src/content/docs/capabilities/toolbox.md and the aipe repo's `aipe skill`
 * surface: each framework carries routing metadata (`taskTypes`, `skipFor`,
 * `minSize`), so a heavy spec-driven kit is never dragged onto a trivial task.
 *
 * Kits shipped today: `sdd-lite` (the always-on reliability floor — a short spec
 * + plan), `spec-kit` (a heavy spec-driven kit for a substantial feature or
 * refactor), and `pdd` (parity-driven development, for pinning legacy behaviour
 * through a refactor). The pricer here enumerates and routes; it never chooses
 * for you — the coordinator reads the MATCH/SKIP lines and picks.
 */

/** The task-type vocabulary `aipe skill match --task-type` accepts. */
export type TaskType = "frontend" | "feature" | "refactor" | "styling" | "copy" | "docs" | "test";
export type TaskSize = "small" | "medium" | "large";

export type KitId = "sdd-lite" | "spec-kit" | "pdd";

export interface KitRouting {
  id: KitId;
  /** One-line purpose, traceable to toolbox.md. */
  blurb: string;
  /** Task types this kit is built for. */
  taskTypes: readonly TaskType[];
  /** Task types this kit must never be dragged onto. */
  skipFor: readonly TaskType[];
  /** The smallest size worth this kit's overhead. */
  minSize: TaskSize;
  /** The always-on floor matches unconditionally and never has to justify itself. */
  floor: boolean;
}

/** Deterministic display/evaluation order: the floor first, then the heavy kits. */
export const KIT_ORDER: readonly KitId[] = ["sdd-lite", "spec-kit", "pdd"];

export const SIZE_RANK: Record<TaskSize, number> = { small: 1, medium: 2, large: 3 };

export const KITS: Record<KitId, KitRouting> = {
  "sdd-lite": {
    id: "sdd-lite",
    blurb: "A short spec + plan — the reliability floor on every task.",
    taskTypes: ["frontend", "feature", "refactor", "styling", "copy", "docs", "test"],
    skipFor: [],
    minSize: "small",
    floor: true,
  },
  "spec-kit": {
    id: "spec-kit",
    blurb: "A heavy spec-driven kit for a substantial, logic-dense feature or refactor.",
    taskTypes: ["feature", "refactor"],
    skipFor: ["copy", "styling", "docs", "frontend"],
    minSize: "medium",
    floor: false,
  },
  pdd: {
    id: "pdd",
    blurb: "Parity-driven development — pins legacy behaviour through a refactor.",
    taskTypes: ["refactor"],
    skipFor: ["copy", "styling"],
    minSize: "medium",
    floor: false,
  },
};

export interface SkillMatchTask {
  taskType: TaskType;
  size: TaskSize;
}

export interface KitVerdict {
  kit: KitId;
  matched: boolean;
  /** The MATCH/SKIP reason the CLI would print for this kit. */
  reason: string;
  floor: boolean;
}

/**
 * Adjudicate one kit against a task. Deterministic check order so the reason is
 * stable: the floor first (unconditional), then skipFor, then task-type fit,
 * then the size threshold.
 */
export function matchKit(kit: KitRouting, task: SkillMatchTask): KitVerdict {
  if (kit.floor) {
    return { kit: kit.id, matched: true, reason: "floor", floor: true };
  }
  if (kit.skipFor.includes(task.taskType)) {
    return { kit: kit.id, matched: false, reason: `skip-for ${task.taskType}`, floor: false };
  }
  if (!kit.taskTypes.includes(task.taskType)) {
    return {
      kit: kit.id,
      matched: false,
      reason: `task-type ${task.taskType} ∉ {${kit.taskTypes.join("|")}}`,
      floor: false,
    };
  }
  if (SIZE_RANK[task.size] < SIZE_RANK[kit.minSize]) {
    return { kit: kit.id, matched: false, reason: `min-size ${kit.minSize} (task ${task.size})`, floor: false };
  }
  return { kit: kit.id, matched: true, reason: `task-type ${task.taskType} · size ≥ ${kit.minSize}`, floor: false };
}

/** Route a task across every shipped kit, in kit order. */
export function matchSkills(task: SkillMatchTask): KitVerdict[] {
  return KIT_ORDER.map((id) => matchKit(KITS[id], task));
}

export interface MatchSummary {
  verdicts: KitVerdict[];
  matchedCount: number;
  /** The kits the task actually routes to, in kit order. */
  routed: KitId[];
}

/** The `matched=N of M` summary and the routed kits — what the coordinator reads. */
export function matchSummary(task: SkillMatchTask): MatchSummary {
  const verdicts = matchSkills(task);
  const routed = verdicts.filter((v) => v.matched).map((v) => v.kit);
  return { verdicts, matchedCount: routed.length, routed };
}
