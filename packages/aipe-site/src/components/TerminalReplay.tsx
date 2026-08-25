import { useEffect, useState } from "react";
import { useReducedMotion } from "../lib/useReducedMotion";
import { useInView } from "../lib/useInView";

export interface TermLine {
  kind: "prompt" | "output" | "ok" | "note";
  text: string;
}

interface TerminalReplayProps {
  lines: TermLine[];
  title?: string;
  /** ms between lines. */
  speed?: number;
  className?: string;
}

const KIND_CLASS: Record<TermLine["kind"], string> = {
  prompt: "text-text",
  output: "text-muted",
  ok: "text-state-verified",
  note: "text-faint",
};

/**
 * A looping terminal replay. Honours reduced-motion by rendering every line at
 * once (no empty box, no animation), and only plays while on screen.
 */
export default function TerminalReplay({ lines, title = "terminal", speed = 550, className = "" }: TerminalReplayProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const [shown, setShown] = useState(reduced ? lines.length : 0);

  useEffect(() => {
    if (reduced) {
      setShown(lines.length);
      return;
    }
    if (!inView) return;
    if (shown >= lines.length) {
      const hold = window.setTimeout(() => setShown(0), 2600);
      return () => window.clearTimeout(hold);
    }
    const t = window.setTimeout(() => setShown((n) => n + 1), speed);
    return () => window.clearTimeout(t);
  }, [shown, inView, reduced, lines.length, speed]);

  return (
    <div ref={ref} className={`overflow-hidden rounded-xl border border-line bg-surface-1 ${className}`}>
      <div className="flex items-center gap-2 border-b border-line-soft px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-state-failed/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-state-running/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-state-verified/70" />
        </span>
        <span className="font-mono text-[11px] text-faint">{title}</span>
      </div>
      <div className="p-4 font-mono text-[12.5px] leading-relaxed min-h-[13rem]">
        {lines.slice(0, shown).map((line, i) => (
          <div key={i} className={`whitespace-pre-wrap ${KIND_CLASS[line.kind]}`}>
            {line.kind === "prompt" ? <span className="text-brand select-none">$ </span> : null}
            {line.text}
          </div>
        ))}
        {!reduced && shown < lines.length && (
          <span className="inline-block h-4 w-2 translate-y-0.5 bg-brand animate-pulse-soft" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
