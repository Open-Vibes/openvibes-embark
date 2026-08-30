import { useEffect, useState } from "react";

/**
 * Tracks a CSS media query, re-reading on change. First paint (and any
 * environment without `matchMedia`) resolves to `false`, then it corrects on
 * mount. Used to pick the hero's layout — a full-bleed backdrop on wide
 * screens, a self-contained scene card on phones — so exactly one canvas
 * mounts (one RAF loop) at the size that fits.
 */
export function useMediaQuery(query: string): boolean {
  const read = (): boolean =>
    typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(query).matches;

  const [matches, setMatches] = useState<boolean>(read);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
