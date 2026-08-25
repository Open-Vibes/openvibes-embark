import React, { createContext, useContext, useEffect, useState } from "react";
import en from "./en";
import { readStoredLocale, type Locale } from "./locale";

export type { Locale };
export type Translations = typeof en;

/**
 * English ships in the landing bundle; Portuguese is code-split and loaded on
 * demand — only when `pt` is actually the active locale. That keeps the default
 * (English) initial payload at its baseline size instead of shipping both
 * dictionaries to every visitor. A `pt`-first visitor sees English for the one
 * frame before the small `pt` chunk resolves, then it swaps in.
 */
let ptCache: Translations | null = null;
async function loadPt(): Promise<Translations> {
  if (!ptCache) ptCache = (await import("./pt")).default;
  return ptCache;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: en,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() =>
    readStoredLocale(
      (key) => (typeof window === "undefined" ? null : window.localStorage.getItem(key)),
      typeof navigator === "undefined" ? null : navigator.language,
    ),
  );
  const [pt, setPt] = useState<Translations | null>(ptCache);

  // Load the pt chunk whenever pt becomes the active locale and isn't loaded yet.
  useEffect(() => {
    if (locale !== "pt" || pt) return;
    let alive = true;
    loadPt().then((mod) => {
      if (alive) setPt(mod);
    });
    return () => {
      alive = false;
    };
  }, [locale, pt]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem("locale", next);
    } catch {
      /* storage unavailable — the choice just won't persist */
    }
    if (typeof document !== "undefined") document.documentElement.lang = next;
  };

  const t = locale === "pt" && pt ? pt : en;

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
