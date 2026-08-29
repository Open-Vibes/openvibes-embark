import Section from "../../components/Section";
import CopyButton from "../../components/CopyButton";
import TerminalReplay, { type TermLine } from "../../components/TerminalReplay";
import { useI18n } from "../../i18n";

const INSTALL = "curl -fsSL https://aipe.openvibes.tech/cli | sh";

/** The command tokens per step — code, English in both locales, matched by index. */
const STEP_CMDS = ["curl … | sh", "aipe start", "say hi"];

/**
 * The `aipe start` transcript is real CLI output — the prompts, harness probe and
 * paths are what the tool literally prints, so they stay English in both locales
 * (same command/speech rule as the console; see consoleScript.ts). The one
 * authored line is the trailing `#` comment: a comment is narration, so it comes
 * from i18n and translates. `replayComment` is filled in per locale below.
 */
const REPLAY: readonly Omit<TermLine, "text">[] = [
  { kind: "prompt" },
  { kind: "output" },
  { kind: "output" },
  { kind: "output" },
  { kind: "ok" },
  { kind: "note" },
  { kind: "ok" },
  { kind: "note" }, // ← replayComment (narration, localised)
];

const REPLAY_LITERAL: readonly (string | null)[] = [
  "aipe start",
  "? Choose your agent harness:  ❯ Claude Code · Codex · Gemini CLI · GitHub Copilot · generic",
  "? Workspace name:  minha-empresa",
  "aipe: checked which harnesses are available on this machine:",
  "aipe:  - OK claude-code claude 2.1.4",
  "aipe:  - NOTE capabilities: probed, not confirmed — run `aipe capabilities confirm`",
  "✓ Created aipe-minha-empresa/",
  null, // the localised `#` comment, sourced from i18n
];

export default function GetStarted() {
  const { t } = useI18n();
  const replay: TermLine[] = REPLAY.map((line, i) => ({
    ...line,
    text: REPLAY_LITERAL[i] ?? t.getStarted.replayComment,
  }));
  return (
    <Section
      id="start"
      eyebrow={t.getStarted.eyebrow}
      title={t.getStarted.title}
      lead={t.getStarted.lead}
      className="bg-surface-1/40"
    >
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-1 px-4 py-3 font-mono text-[13px] text-text">
            <span className="text-faint select-none" aria-hidden="true">$</span>
            <code className="whitespace-nowrap overflow-x-auto">{INSTALL}</code>
            <CopyButton value={INSTALL} label={t.getStarted.copy} copiedLabel={t.getStarted.copied} className="ml-auto shrink-0" />
          </div>

          <ol className="mt-6 space-y-4">
            {t.getStarted.steps.map((s, i) => (
              <li key={STEP_CMDS[i]} className="flex gap-4">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/12 font-mono text-xs font-semibold text-brand">
                  {i + 1}
                </span>
                <div>
                  <code className="font-mono text-[13px] text-brand">{STEP_CMDS[i]}</code>
                  <p className="text-sm text-muted leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="/docs" className="inline-flex items-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong transition-colors">
              {t.getStarted.readDocs}
            </a>
            <a
              href="https://github.com/blpsoares/aipe"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-line px-4 py-2 text-sm font-semibold text-text hover:border-brand hover:text-brand transition-colors"
            >
              {t.getStarted.viewGithub}
            </a>
          </div>
        </div>

        <TerminalReplay lines={replay} title="aipe start" />
      </div>
    </Section>
  );
}
