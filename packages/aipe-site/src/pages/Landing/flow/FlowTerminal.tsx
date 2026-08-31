import { useEffect, useRef } from "react";
import type { FlowLine, FlowLineTone } from "./flowModel";

/**
 * The terminal log — the bottom pane of the stacked scene. It is the LOG of what
 * the floor just dispatched: each revealed line is the command/output that caused
 * the state change above it. Purely presentational and non-interactive — no
 * buttons, no handlers, nothing responds to a click. It auto-scrolls to the
 * newest line (a read-only convenience, not a control).
 *
 * Illustration, not telemetry — it never talks to a real `aipe serve`.
 */

const TONE_CLASS: Record<FlowLineTone, string> = {
  prompt: "text-text",
  info: "text-muted",
  ok: "text-state-verified",
  work: "text-state-running",
  delivered: "text-state-delivered",
  verified: "text-state-verified",
  failed: "text-state-failed",
  merged: "text-state-merged",
};

export interface FlowTerminalProps {
  header: string;
  lines: FlowLine[];
  reduced?: boolean;
}

export default function FlowTerminal({ header, lines, reduced }: FlowTerminalProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Follow the newest line. Under reduced motion, jump (no smooth scroll).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [lines.length, reduced]);

  return (
    <div className="flex flex-col border-t border-line-soft" aria-hidden="true">
      <div className="flex items-center gap-2 border-b border-line-soft bg-surface-2/50 px-3.5 py-2">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-state-failed/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-state-escalated/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-state-verified/60" />
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-wide text-faint">{header}</span>
      </div>

      <div
        ref={scrollRef}
        className="h-[9.5rem] min-h-0 overflow-y-auto bg-surface-2/20 px-3.5 py-3 font-mono sm:h-[11rem]"
      >
        <ol className="flex flex-col gap-1">
          {lines.map((line, i) => {
            const lead = line.tone === "prompt" ? "pe›" : "";
            return (
              <li
                key={i}
                className={`whitespace-pre-wrap break-words text-[11.5px] leading-relaxed sm:text-[12px] ${TONE_CLASS[line.tone]}`}
              >
                {lead ? <span className="mr-1.5 select-none text-brand">{lead}</span> : null}
                {line.text}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
