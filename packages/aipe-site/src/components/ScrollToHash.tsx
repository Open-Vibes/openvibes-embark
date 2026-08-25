import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Scroll to the hash target on navigation, or to the top when there is none.
 *
 * A single mount-effect `scrollIntoView` is not enough: on a hard reload of a
 * deep link like `/#harness`, the target's offset is still settling as late
 * content (fonts, the hero scene) lays out, so one early call samples the wrong
 * position and the page lands short of the section. Mirroring pdd-site, we
 * re-check across two animation frames AND a `setTimeout` fallback, so the jump
 * lands once the layout has settled — and we use `behavior:"instant"` so the
 * post-navigation jump is not swallowed by any global `scroll-behavior:smooth`.
 */
export default function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }

    const id = hash.slice(1);
    function scrollToTarget() {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "instant", block: "start" });
    }

    // Two rAFs let the current layout/paint settle before the first attempt;
    // the timeout re-checks after late content (fonts, the hero scene) lands.
    const raf = requestAnimationFrame(() => requestAnimationFrame(scrollToTarget));
    const timer = window.setTimeout(scrollToTarget, 300);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [pathname, hash]);

  return null;
}
