import {
  HARNESS_CONTAINMENT,
  READER_BUCKETS,
  bucketFor,
  type HarnessContainment,
  type ReaderBucket,
} from "../../../domain/harnessCompat";
import { useI18n } from "../../../i18n";

/**
 * Ten harnesses, three states — but grouped into four reader-facing buckets so
 * "no adapter yet" (backlog) and "proven non-containable" (a real limit) never
 * read as the same kind of gap. See `bucketFor` for the rule.
 */
const BUCKET_STYLE: Record<ReaderBucket, { glyph: string; text: string; border: string; bg: string }> = {
  shipped: {
    glyph: "✓",
    text: "text-state-verified",
    border: "border-state-verified/30",
    bg: "bg-state-verified/10",
  },
  "proven-limit": {
    glyph: "✕",
    text: "text-state-failed",
    border: "border-state-failed/30",
    bg: "bg-state-failed/10",
  },
  backlog: {
    glyph: "○",
    text: "text-state-running",
    border: "border-state-running/30",
    bg: "bg-state-running/10",
  },
  "open-question": {
    glyph: "?",
    text: "text-state-escalated",
    border: "border-state-escalated/30",
    bg: "bg-state-escalated/10",
  },
};

function sourceHostname(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function HarnessCard({ harness }: { harness: HarnessContainment }) {
  const { t } = useI18n();
  const c = t.harnessCompat;
  const bucket = bucketFor(harness);
  const style = BUCKET_STYLE[bucket];

  return (
    <article className={`rounded-xl border ${style.border} bg-surface-1 p-5`}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-text">{harness.id}</span>
          <span className="text-xs text-faint">{harness.label}</span>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${style.text} ${style.bg}`}
        >
          <span aria-hidden="true">{style.glyph}</span>
          {harness.state}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">{harness.headline}</p>

      <p className="mt-3 font-mono text-[11px] text-faint">
        {harness.adapterId !== null ? c.adapterShipped : c.adapterNone}
      </p>

      {harness.caveat ? (
        <p className="mt-3 rounded-lg border border-line-soft bg-surface-2/60 px-3 py-2 text-xs leading-relaxed text-muted">
          <span className="font-semibold text-text">{c.caveatLabel}: </span>
          {harness.caveat}
        </p>
      ) : null}

      <div className="mt-4 space-y-2 border-t border-line-soft pt-3">
        <p className="font-mono text-[10px] uppercase tracking-wide text-faint">{c.sourceLabel}</p>
        {harness.sources.map((source) => (
          <div key={source.url + source.quote} className="text-xs leading-relaxed">
            <blockquote className="border-l-2 border-line-soft pl-2.5 text-muted">“{source.quote}”</blockquote>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-faint">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-brand hover:text-brand-strong hover:underline"
              >
                {c.readSource} → {sourceHostname(source.url)}
              </a>
              <span aria-hidden="true">·</span>
              <span>
                {c.accessedLabel} {source.accessed}
              </span>
            </p>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function CompatibilityLedger() {
  const { t } = useI18n();
  const c = t.harnessCompat;

  return (
    <div>
      <div className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand mb-3">{c.eyebrow}</p>
        <h3 className="font-display text-2xl sm:text-3xl font-semibold text-text leading-tight max-w-2xl">
          {c.title}
        </h3>
        <p className="mt-4 text-base text-muted leading-relaxed max-w-2xl">{c.lead}</p>
      </div>

      <div className="space-y-10">
        {READER_BUCKETS.map((bucket) => {
          const harnesses = HARNESS_CONTAINMENT.filter((h) => bucketFor(h) === bucket);
          if (harnesses.length === 0) return null;
          const style = BUCKET_STYLE[bucket];
          const group = c.groups[bucket];
          return (
            <div key={bucket}>
              <div className="flex items-baseline gap-2.5">
                <span aria-hidden="true" className={`font-mono text-sm ${style.text}`}>
                  {style.glyph}
                </span>
                <h4 className={`font-display text-lg font-semibold ${style.text}`}>{group.label}</h4>
              </div>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{group.body}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {harnesses.map((harness) => (
                  <HarnessCard key={harness.id} harness={harness} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
