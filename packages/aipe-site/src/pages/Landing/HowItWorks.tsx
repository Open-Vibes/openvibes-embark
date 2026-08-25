import Section from "../../components/Section";
import { useI18n } from "../../i18n";

/** The command / step tokens are code — English in both locales, matched by index. */
const ONBOARDING_CMDS = ["/context-brain", "/make-workspace", "/relationship", "/hire-specialists"];
const OPERATION_STEPS = ["journey", "decompose", "waves", "dispatch", "PR", "escalate"];

export default function HowItWorks() {
  const { t } = useI18n();
  const { onboarding, operation } = t.how;
  return (
    <Section id="how" eyebrow={t.how.eyebrow} title={t.how.title} lead={t.how.lead}>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Onboarding */}
        <div className="rounded-2xl border border-line bg-surface-1 p-6 sm:p-7">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-xl font-semibold text-text">{onboarding.heading}</h3>
            <span className="font-mono text-xs text-faint">{onboarding.meta}</span>
          </div>
          <p className="mt-1 text-sm text-muted">{onboarding.sub}</p>
          <ol className="mt-5 space-y-4">
            {onboarding.steps.map((s, i) => (
              <li key={ONBOARDING_CMDS[i]} className="flex gap-4">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line bg-surface-2 font-mono text-xs text-brand">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <code className="font-mono text-[13px] text-brand">{ONBOARDING_CMDS[i]}</code>
                  <p className="text-sm font-medium text-text">{s.title}</p>
                  <p className="text-sm text-muted leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Operation */}
        <div className="rounded-2xl border border-line bg-surface-1 p-6 sm:p-7">
          <div className="flex items-baseline justify-between">
            <h3 className="font-display text-xl font-semibold text-text">{operation.heading}</h3>
            <span className="font-mono text-xs text-faint">{operation.meta}</span>
          </div>
          <p className="mt-1 text-sm text-muted">{operation.sub}</p>
          <ol className="mt-5 space-y-2.5">
            {operation.steps.map((s, i) => (
              <li key={OPERATION_STEPS[i]} className="flex gap-3 items-start">
                <code className="mt-0.5 shrink-0 rounded-md bg-brand/12 px-2 py-1 font-mono text-[12px] font-semibold text-brand">
                  {OPERATION_STEPS[i]}
                </code>
                <p className="text-sm text-muted leading-relaxed">{s.body}</p>
                {i < operation.steps.length - 1 && <span aria-hidden="true" className="sr-only">then</span>}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Section>
  );
}
