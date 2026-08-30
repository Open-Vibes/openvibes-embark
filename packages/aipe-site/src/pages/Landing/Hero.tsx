import CopyButton from "../../components/CopyButton";
import HeroCanvas from "./hero/HeroCanvas";
import { useI18n, type Translations } from "../../i18n";
import { useMediaQuery } from "../../lib/useMediaQuery";

const INSTALL = "curl -fsSL https://aipe.openvibes.tech/cli | sh";

/**
 * The hero. The headline is plain DOM text so it paints immediately (the LCP
 * element); `HeroCanvas` transcribes AIPe's real flow — demand → coordinator →
 * multi-harness fan-out → QA (with a rejection loop) → repos.
 *
 * That pipeline is horizontal and dense, so it lives in two framings:
 *  - Wide (≥ sm): a full-bleed BACKDROP behind the copy, under a contrast scrim;
 *    the legend at the foot names its beats.
 *  - Narrow: behind a phone's paragraph the pipeline is unreadable and its legend
 *    falls below the fold. So on phones the scene gets its own self-contained CARD
 *    it can fill, with the legend as its caption, and the copy sits on a clean
 *    background — then the install command stays above the fold and the prose
 *    follows. Exactly one canvas mounts (the split is at Tailwind's `sm`, 640px).
 */
export default function Hero() {
  const { t } = useI18n();
  const wide = useMediaQuery("(min-width: 640px)");

  const bodyText = (
    <>
      {t.hero.bodyBefore}
      <span className="text-text">{t.hero.bodyEmphasis}</span>
      {t.hero.bodyAfter}
    </>
  );

  // The install command and the two links are identical in both orderings.
  const installBlock = (
    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-1/80 px-4 py-3 font-mono text-[13px] text-text backdrop-blur-sm">
        <span className="select-none text-faint" aria-hidden="true">$</span>
        <code className="overflow-x-auto whitespace-nowrap">{INSTALL}</code>
        <CopyButton value={INSTALL} label={t.hero.copy} copiedLabel={t.hero.copied} className="ml-auto shrink-0" />
      </div>
    </div>
  );

  const ctaLinks = (
    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <a href="#how" className="font-medium text-brand hover:underline">
        {t.hero.seeHow}
      </a>
      <a href="/docs" className="font-medium text-muted transition-colors hover:text-text">
        {t.hero.readDocs}
      </a>
    </div>
  );

  return (
    <header className="relative flex min-h-[88vh] items-center overflow-hidden px-5 pb-16 pt-28 sm:px-6 sm:pt-32">
      {/* Wide only: the scene as a full-bleed backdrop, plus a contrast scrim. */}
      {wide && (
        <>
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <HeroCanvas />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(100deg, rgb(var(--bg)) 0%, rgb(var(--bg) / 0.9) 30%, rgb(var(--bg) / 0.45) 50%, transparent 66%), linear-gradient(to bottom, rgb(var(--bg) / 0.55) 0%, transparent 20%, transparent 80%, rgb(var(--bg) / 0.55) 100%)",
            }}
          />
        </>
      )}

      <div className="mx-auto w-full max-w-content">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-1/80 px-3 py-1 font-mono text-[12px] text-muted backdrop-blur-sm">
            <span className="text-brand" aria-hidden="true">◆</span>
            {t.hero.eyebrow}
          </p>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-text sm:text-5xl lg:text-[3.4rem]">
            {t.hero.headlineLine1}
            <br />
            <span className="text-brand">{t.hero.headlineLine2}</span>
          </h1>

          {wide ? (
            <>
              <p className="mt-5 text-lg leading-relaxed text-muted">{bodyText}</p>
              {installBlock}
              {ctaLinks}
              {/* The legend sits at the foot of the copy, naming the backdrop. */}
              <SceneLegend t={t} className="mt-10" />
            </>
          ) : (
            <>
              {/* On a phone the scene gets its own card, right under the headline it
                  illustrates, so the pipeline is legible — then the install command
                  stays above the fold and the prose explanation follows. */}
              <figure className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface-1/60">
                <div className="relative h-48 w-full">
                  <HeroCanvas />
                </div>
                <figcaption className="border-t border-line-soft px-4 py-3">
                  <SceneLegend t={t} />
                </figcaption>
              </figure>
              {installBlock}
              {ctaLinks}
              <p className="mt-8 text-lg leading-relaxed text-muted">{bodyText}</p>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** Names the beats the pipeline depicts, so the motion reads as documentation. */
function SceneLegend({ t, className }: { t: Translations; className?: string }) {
  return (
    <ul className={`flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-faint ${className ?? ""}`}>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="inline-block h-2.5 w-2.5 rounded-full bg-brand shadow-[0_0_10px_2px] shadow-brand/50" />
        {t.hero.scene.coordinator}
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-brand-strong" />
        {t.hero.scene.harnesses}
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-state-failed" />
        {t.hero.scene.reject}
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="inline-block h-2 w-2 rotate-45 bg-state-verified" />
        {t.hero.scene.repos}
      </li>
    </ul>
  );
}
