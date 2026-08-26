export type Locale = "en" | "pt";

function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "pt";
}

/**
 * Resolve the initial locale. A persisted choice always wins (the override the
 * reader set with the header switch). With nothing stored, fall back to the
 * browser's language — anything starting `pt` (pt, pt-BR, pt-PT) opens in
 * Portuguese; everything else opens in English. Pure and total, so it is unit
 * tested: callers pass their own `getItem` and browser language.
 */
export function readStoredLocale(
  getItem: (key: string) => string | null,
  browserLanguage?: string | null,
): Locale {
  const stored = getItem("locale");
  if (isLocale(stored)) return stored;
  if (browserLanguage && browserLanguage.toLowerCase().startsWith("pt")) return "pt";
  return "en";
}
