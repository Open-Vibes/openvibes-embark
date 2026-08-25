import Section from "../../components/Section";
import { useI18n } from "../../i18n";

/** Per-role accent tokens — design, not copy; matched to roles by index. */
const ACCENTS = ["--brand", "--st-dispatched", "--st-verified"];

export default function CompanySection() {
  const { t } = useI18n();
  const roles = t.company.roles;
  return (
    <Section
      id="company"
      eyebrow={t.company.eyebrow}
      title={t.company.title}
      lead={t.company.lead}
    >
      <div className="grid md:grid-cols-3 gap-4">
        {roles.map((r, i) => (
          <div key={r.role} className="relative rounded-2xl border border-line bg-surface-1 p-6">
            <div className="flex items-center gap-3">
              <span
                className="grid h-9 w-9 place-items-center rounded-lg font-mono text-sm font-semibold"
                style={{ color: `rgb(var(${ACCENTS[i]}))`, backgroundColor: `rgb(var(${ACCENTS[i]}) / 0.14)` }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <h3 className="font-display text-lg font-semibold text-text">{r.role}</h3>
            </div>
            <p className="mt-4 text-sm font-medium text-text">{r.who}</p>
            <p className="mt-1.5 text-sm text-muted leading-relaxed">{r.does}</p>
            {i < roles.length - 1 && (
              <span aria-hidden="true" className="hidden md:block absolute top-1/2 -right-2.5 text-faint">→</span>
            )}
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-faint max-w-2xl">
        {t.company.note1}
        <code className="font-mono text-muted">aipe</code>
        {t.company.note2}
      </p>
    </Section>
  );
}
