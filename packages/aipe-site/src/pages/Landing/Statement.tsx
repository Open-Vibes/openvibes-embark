import Reveal from "../../components/Reveal";
import { useI18n } from "../../i18n";

/**
 * A statement band — a deliberate break in the page's rhythm. Every other section
 * is an eyebrow → left-aligned title → lead over a card grid; this is one large,
 * centred line with air around it and no chrome. It is the same type scale and
 * palette (no second visual system) used at a different weight and position, so
 * the scroll breathes instead of marching. It also does work: it sets up the
 * harness section's honest-differentiation argument in one sentence.
 */
export default function Statement() {
  const { t } = useI18n();
  const s = t.statement;
  return (
    <section className="px-5 py-24 sm:px-6 sm:py-32">
      <Reveal>
        <div className="mx-auto max-w-4xl text-center">
          <span aria-hidden="true" className="mx-auto mb-8 block h-px w-16 bg-brand/50" />
          <p className="font-display text-2xl font-semibold leading-snug tracking-tight text-text sm:text-3xl lg:text-[2.4rem] lg:leading-[1.2]">
            {s.lead}
            <span className="text-brand">{s.emphasis}</span>
            {s.trail}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted">{s.sub}</p>
        </div>
      </Reveal>
    </section>
  );
}
