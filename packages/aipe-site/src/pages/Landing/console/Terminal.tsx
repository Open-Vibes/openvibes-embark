import type { Beat, DecisionId } from "./sceneModel";
import type { LeftLine } from "./consoleScript";

/**
 * The terminal pane — one of the two independent hero components. It renders the
 * command that is running NOW in full and prominent; earlier commands recede to a
 * single dimmed line each, so the reader's eye lands on the current command, not a
 * scrollback wall. It is pure and presentational: everything arrives via props, it
 * imports no sibling component, and it renders standalone (see Terminal.test.ts).
 */
export interface TerminalProps {
  beats: Beat[];
  /** The shared step index. */
  activeBeat: number;
  /** The decision being emphasised right now (for the cross-highlight with the stage). */
  activeDecision: DecisionId | null;
  header: string;
  /** Localised "now" label shown against the running command. */
  runningLabel: string;
  onHoverDecision?: (decision: DecisionId | null) => void;
  onPickBeat?: (index: number) => void;
}

const TONE_CLASS: Record<NonNullable<LeftLine["tone"]>, string> = {
  ok: "text-state-verified",
  reject: "text-state-failed",
  gated: "text-state-escalated",
  info: "text-muted",
  queued: "text-state-dispatched",
  muted: "text-faint",
};

function Line({ line, dim }: { line: LeftLine; dim?: boolean }) {
  const lead =
    line.kind === "prompt" ? "pe›" : line.kind === "command" ? "$" : line.kind === "reply" ? "" : "";
  const base =
    line.kind === "output"
      ? line.tone
        ? TONE_CLASS[line.tone]
        : "text-muted"
      : line.kind === "reply"
        ? "text-muted"
        : "text-text";
  return (
    <p className={`whitespace-pre-wrap break-words leading-relaxed ${dim ? "text-[11.5px] opacity-45" : "text-[12.5px]"} ${dim ? "text-faint" : base}`}>
      {lead ? (
        <span aria-hidden="true" className={`mr-1.5 select-none ${line.kind === "prompt" ? "text-brand" : "text-faint"}`}>
          {lead}
        </span>
      ) : null}
      {line.text}
    </p>
  );
}

export default function Terminal({
  beats,
  activeBeat,
  activeDecision,
  header,
  runningLabel,
  onHoverDecision,
  onPickBeat,
}: TerminalProps) {
  const terminalBeats = beats.filter((b) => b.side === "terminal" && b.index <= activeBeat);
  const currentIndex = terminalBeats.length - 1;

  return (
    <div className="flex h-[56vh] min-h-[23rem] flex-col border-b border-line-soft lg:h-[74vh] lg:max-h-[48rem] lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2/50 px-3.5 py-2">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-state-failed/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-state-escalated/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-state-verified/60" />
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-wide text-faint">{header}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-surface-2/20 p-3.5 font-mono">
        <ol className="flex flex-col gap-1.5">
          {terminalBeats.map((beat, i) => {
            const isCurrent = i === currentIndex;
            const isActive = beat.decision === activeDecision;
            const lines = beat.commands ?? [];
            return (
              <li key={beat.index}>
                <button
                  type="button"
                  onMouseEnter={() => onHoverDecision?.(beat.decision)}
                  onMouseLeave={() => onHoverDecision?.(null)}
                  onFocus={() => onHoverDecision?.(beat.decision)}
                  onBlur={() => onHoverDecision?.(null)}
                  onClick={() => onPickBeat?.(beat.index)}
                  aria-current={isCurrent ? "step" : undefined}
                  className={`block w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    isCurrent
                      ? isActive
                        ? "border-brand/70 bg-brand/[0.07]"
                        : "border-line-soft bg-surface-1/60"
                      : "border-transparent hover:border-line-soft"
                  }`}
                >
                  {isCurrent ? (
                    <>
                      {lines.map((line, k) => (
                        <Line key={k} line={line} />
                      ))}
                      <p className="mt-0.5 flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-faint">
                        <span aria-hidden="true" className="inline-block h-3 w-[7px] animate-pulse bg-brand" />
                        {runningLabel}
                      </p>
                    </>
                  ) : (
                    // History recedes to a single dimmed line — no scrollback wall.
                    <Line line={lines[0] ?? { kind: "output", text: "" }} dim />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
