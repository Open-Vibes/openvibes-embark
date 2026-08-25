import { useState } from "react";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

/** Copy-to-clipboard button with transient confirmation. */
export default function CopyButton({ value, label = "copy", className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — no-op */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : `Copy ${label}`}
      className={`font-mono text-[11px] uppercase tracking-wide text-muted border border-line px-2 py-1 rounded-md bg-surface-1 hover:text-brand hover:border-brand transition-colors ${className}`}
    >
      {copied ? "copied ✓" : label}
    </button>
  );
}
