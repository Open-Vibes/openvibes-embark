import Section from "../../components/Section";
import CopyButton from "../../components/CopyButton";
import TerminalReplay, { type TermLine } from "../../components/TerminalReplay";

const INSTALL = "curl -fsSL https://aipe.openvibes.tech/cli | sh";

const STEPS: { cmd: string; body: string }[] = [
  { cmd: "curl … | sh", body: "Install the standalone aipe binary — no Bun, Node, or npm required." },
  { cmd: "aipe start", body: "Pick your harness and name the workspace. It creates a publishable aipe-<name>/ folder." },
  { cmd: "say hi", body: "Open the folder in your harness and greet the coordinator. It drives onboarding from there." },
];

const REPLAY: TermLine[] = [
  { kind: "prompt", text: "aipe start" },
  { kind: "output", text: "? Choose your agent harness:  ❯ Claude Code" },
  { kind: "output", text: "? Workspace name:  minha-empresa" },
  { kind: "output", text: "aipe: checked which harnesses are available on this machine:" },
  { kind: "ok", text: "aipe:  - OK claude-code claude 2.1.4" },
  { kind: "note", text: "aipe:  - NOTE capabilities: probed, not confirmed — run `aipe capabilities confirm`" },
  { kind: "ok", text: "✓ Created aipe-minha-empresa/" },
  { kind: "note", text: "# open the folder in your harness and just say hi" },
];

export default function GetStarted() {
  return (
    <Section
      id="start"
      eyebrow="Get started"
      title="Install, start, and say hi."
      lead="Three moves to a working coordinator. No marketplace step, nothing installed globally — the integration lives in the workspace folder you create."
      className="bg-surface-1/40"
    >
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-1 px-4 py-3 font-mono text-[13px] text-text">
            <span className="text-faint select-none" aria-hidden="true">$</span>
            <code className="whitespace-nowrap overflow-x-auto">{INSTALL}</code>
            <CopyButton value={INSTALL} label="copy" className="ml-auto shrink-0" />
          </div>

          <ol className="mt-6 space-y-4">
            {STEPS.map((s, i) => (
              <li key={s.cmd} className="flex gap-4">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/12 font-mono text-xs font-semibold text-brand">
                  {i + 1}
                </span>
                <div>
                  <code className="font-mono text-[13px] text-brand">{s.cmd}</code>
                  <p className="text-sm text-muted leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/docs" className="inline-flex items-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong transition-colors">
              Read the docs
            </a>
            <a
              href="https://github.com/blpsoares/aipe"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-text hover:border-brand hover:text-brand transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>

        <TerminalReplay lines={REPLAY} title="aipe start" />
      </div>
    </Section>
  );
}
