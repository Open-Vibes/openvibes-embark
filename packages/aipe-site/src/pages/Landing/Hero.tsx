import CopyButton from "../../components/CopyButton";
import ConsoleSplit from "./console/ConsoleSplit";

const INSTALL = "curl -fsSL https://aipe.openvibes.tech/cli | sh";

export default function Hero() {
  return (
    <header className="relative overflow-hidden px-5 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-20">
      {/* Ambient brand wash — decorative, non-blocking */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          background:
            "radial-gradient(60rem 40rem at 70% -10%, rgb(var(--brand) / 0.16), transparent 60%), radial-gradient(50rem 30rem at 0% 20%, rgb(var(--st-delivered) / 0.10), transparent 55%)",
        }}
      />
      <div className="mx-auto max-w-content">
        {/* Promise */}
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-1 px-3 py-1 font-mono text-[12px] text-muted">
            <span className="text-brand" aria-hidden="true">◆</span>
            AI Product Engineer · a Claude Code plugin
          </p>

          <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-bold leading-[1.05] tracking-tight text-text">
            You bring the demand.
            <br />
            <span className="text-brand">It runs the engineering org.</span>
          </h1>

          <p className="mt-5 text-lg text-muted leading-relaxed">
            AIPe turns Claude into a general engineering coordinator and you into the Product
            Engineer. Hand over a demand; it decomposes the work, dispatches a specialist per
            repo <span className="text-text">in parallel</span> — each isolated in its own git
            worktree — and returns PRs, under one dispatch law and an evidence gate.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:items-center">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-1 px-4 py-3 font-mono text-[13px] text-text">
              <span className="text-faint select-none" aria-hidden="true">$</span>
              <code className="whitespace-nowrap overflow-x-auto">{INSTALL}</code>
              <CopyButton value={INSTALL} label="copy" className="ml-auto shrink-0" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <a href="#how" className="font-medium text-brand hover:underline">
              See how it works →
            </a>
            <a href="/docs" className="font-medium text-muted hover:text-text transition-colors">
              Read the docs
            </a>
          </div>
        </div>

        {/* The signature scene — the terminal on the left, what each line means on
            the right, bound line-for-line. Fixed height, so it never shifts the
            page as it plays. */}
        <div className="mt-12 sm:mt-14">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-faint">
            one demand — the terminal, and what every line means
          </p>
          <ConsoleSplit />
        </div>
      </div>
    </header>
  );
}
