import Section from "../../components/Section";
import { useI18n } from "../../i18n";

export default function ProblemSection() {
  const { t } = useI18n();
  return (
    <Section
      id="problem"
      eyebrow={t.problem.eyebrow}
      title={t.problem.title}
      lead={t.problem.lead}
      className="bg-surface-1/40"
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {t.problem.items.map((c) => (
          <div key={c.title} className="rounded-2xl border border-line bg-surface-1 p-6">
            <div className="mb-3 h-8 w-8 rounded-lg border border-state-failed/40 bg-state-failed/10 grid place-items-center text-state-failed" aria-hidden="true">
              ✕
            </div>
            <h3 className="font-display text-lg font-semibold text-text">{c.title}</h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
