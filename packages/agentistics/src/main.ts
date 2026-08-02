import "./style.css";
import { initIcons } from "./icons";
import { initHeroCanvas } from "./hero";
import { initTerminalTabs } from "./terminal";
import { initArchCanvas } from "./arch";
import { initNav } from "./nav";
import { initReveal } from "./reveal";
import { initHeroCounters } from "./counters";
import { initI18n } from "./i18n";
import { initPreview } from "./preview";
import { initFeatures } from "./features";
import { initLightbox } from "./lightbox";
import { initRelease } from "./release";
import { initVersion } from "./version";

function boot() {
  // Fade in body
  document.body.style.transition = "opacity 0.5s ease";
  document.body.style.opacity = "1";

  // Replace <i data-lucide="..."> with inline SVGs
  initIcons();

  // The real version number in the nav
  initVersion();

  // i18n language toggle
  initI18n();

  // Nav hide/show on scroll
  initNav();

  // Hero background particle stream
  initHeroCanvas();

  // Hero stat counters
  initHeroCounters();

  // Dashboard screenshot showcase
  initPreview();

  // PDF lightbox carousel
  initLightbox();

  // Features accordion
  initFeatures();

  // Scroll-reveal for section elements
  initReveal();

  // Terminal tab switching (immediate — tabs exist in DOM)
  initTerminalTabs();

  // Release section tabs — lazy init when section enters viewport
  lazyInit("release", () => initRelease());

  // Arch 3D neural net
  lazyInit("arch", () => initArchCanvas());
}

function lazyInit(sectionId: string, fn: () => void): void {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fn();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.1 },
  );
  observer.observe(section);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
