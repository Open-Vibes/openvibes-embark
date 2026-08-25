import type { CSSProperties } from "react";
import { STATE_META, stateColorVar, type StateKey } from "../domain/states";

interface StateBadgeProps {
  state: StateKey;
  /** Show the descriptive blurb as a native tooltip. */
  title?: boolean;
  size?: "sm" | "md";
  className?: string;
}

/**
 * A journey/dispatch state, rendered as GLYPH + LABEL + color. State is never
 * carried by color alone — the glyph and label make it legible under color
 * vision deficiency and in monochrome.
 */
export default function StateBadge({ state, title = true, size = "md", className = "" }: StateBadgeProps) {
  const meta = STATE_META[state];
  const color = `rgb(var(${stateColorVar(state)}))`;
  const tint = `rgb(var(${stateColorVar(state)}) / 0.14)`;
  const style: CSSProperties = { color, backgroundColor: tint, borderColor: `rgb(var(${stateColorVar(state)}) / 0.4)` };
  const pad = size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-mono font-medium leading-none ${pad} ${className}`}
      style={style}
      title={title ? meta.blurb : undefined}
    >
      <span aria-hidden="true">{meta.glyph}</span>
      <span>{meta.label}</span>
    </span>
  );
}
