import { useI18n } from "../i18n";

/** EN/PT segmented switch. Persists via the provider; visible on mobile too. */
export default function LangToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const seg =
    "px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand";
  return (
    <div className={`flex items-center rounded-full border border-line bg-surface-1 p-0.5 ${className}`} aria-label={t.langToggle.label}>
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`${seg} ${locale === "en" ? "bg-brand text-white" : "text-muted hover:text-text"}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("pt")}
        aria-pressed={locale === "pt"}
        className={`${seg} ${locale === "pt" ? "bg-brand text-white" : "text-muted hover:text-text"}`}
      >
        PT
      </button>
    </div>
  );
}
