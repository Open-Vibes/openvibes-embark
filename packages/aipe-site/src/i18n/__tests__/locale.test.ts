import { describe, it, expect } from "bun:test";
import { readStoredLocale } from "../locale";

describe("readStoredLocale — a persisted choice always wins", () => {
  it("returns the stored locale when it is a valid value", () => {
    const getItem = (key: string) => (key === "locale" ? "pt" : null);
    expect(readStoredLocale(getItem, "en-US")).toBe("pt");
  });

  it("the stored override beats the browser language", () => {
    const getItem = (key: string) => (key === "locale" ? "en" : null);
    expect(readStoredLocale(getItem, "pt-BR")).toBe("en");
  });
});

describe("readStoredLocale — browser-language detection when nothing is stored", () => {
  it("detects Portuguese from pt-BR", () => {
    expect(readStoredLocale(() => null, "pt-BR")).toBe("pt");
  });

  it("detects Portuguese from a bare pt", () => {
    expect(readStoredLocale(() => null, "pt")).toBe("pt");
  });

  it("falls back to English for a non-pt browser language", () => {
    expect(readStoredLocale(() => null, "en-GB")).toBe("en");
    expect(readStoredLocale(() => null, "fr-FR")).toBe("en");
  });

  it("falls back to English when there is no browser language", () => {
    expect(readStoredLocale(() => null, null)).toBe("en");
    expect(readStoredLocale(() => null)).toBe("en");
  });
});

describe("readStoredLocale — an invalid stored value is ignored", () => {
  it("falls through to browser detection when the stored value is not a locale", () => {
    expect(readStoredLocale(() => "fr", "pt-BR")).toBe("pt");
    expect(readStoredLocale(() => "fr", "en-US")).toBe("en");
  });
});
