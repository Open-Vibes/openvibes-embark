import Section from "../../components/Section";
import { useI18n } from "../../i18n";

/** The code tokens shown on each law card — English in both locales, by index. */
const LAW_TAGS = [
  "aipe dispatch validate",
  "<repo>/.worktrees/<journey>-<slug>/",
  "evidence-required",
  "/review-delivery",
  "dependency-not-landed",
  "session containment",
];

export default function LawsSection() {
  const { t } = useI18n();
  return (
    <Section
      id="laws"
      eyebrow={t.laws.eyebrow}
      title={t.laws.title}
      lead={t.laws.lead}
      className="bg-surface-1/40"
    >
      <div className="grid md:grid-cols-2 gap-4">
        {t.laws.items.map((law, i) => (
          <div key={law.title} className="rounded-2xl border border-line bg-surface-1 p-6">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="font-display text-lg font-semibold text-text">{law.title}</h3>
            </div>
            <code className="mt-3 inline-block max-w-full truncate rounded-md bg-surface-2 border border-line-soft px-2 py-1 font-mono text-[11.5px] text-brand">
              {LAW_TAGS[i]}
            </code>
            <p className="mt-3 text-sm text-muted leading-relaxed">{law.body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
