/**
 * preview.ts — the Dashboard section's tabbed media.
 *
 * One recording per tab, addressed by `data-tab-media` rather than by DOM order,
 * so adding or reordering a tab cannot silently pair a label with the wrong
 * screenshot. The URL chrome above the frame follows the tab, because a central
 * and a machine are served on different ports and showing one address for both
 * is the kind of small lie that costs a support conversation.
 */

/** The address bar to show per tab — index matches `data-tab`. */
const TAB_URLS = [
  "localhost:47292",
  "localhost:48080",
  "localhost:47292",
  "localhost:47292",
  "localhost:47292",
  "localhost:47292",
  "localhost:47292",
];

export function initPreview(): void {
  const section = document.getElementById("preview");
  if (!section) return;

  const tabBtns = section.querySelectorAll<HTMLButtonElement>(".preview-tab");
  const media = section.querySelectorAll<HTMLImageElement>("[data-tab-media]");
  const frame = section.querySelector<HTMLElement>(".preview-frame");
  const urlEl = section.querySelector<HTMLElement>(".preview-url");

  if (!tabBtns.length || !media.length) return;

  function activate(idx: number): void {
    tabBtns.forEach((b, i) => b.classList.toggle("active", i === idx));
    media.forEach(img => img.classList.toggle("active", Number(img.dataset.tabMedia) === idx));

    // The phone recording is portrait; letting it fill a landscape frame would
    // scale it to something nobody could read.
    frame?.classList.toggle("is-mobile-shot", idx === media.length - 1);

    if (urlEl) {
      const dot = urlEl.querySelector(".preview-url-dot")?.outerHTML ?? "";
      urlEl.innerHTML = `${dot} ${TAB_URLS[idx] ?? TAB_URLS[0]}`;
    }
  }

  tabBtns.forEach((btn, i) => btn.addEventListener("click", () => activate(i)));

  if (frame) {
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            frame.classList.add("visible");
            obs.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );
    obs.observe(frame);
  }

  // Warm the other tabs' recordings so switching does not show an empty frame.
  media.forEach(img => {
    if (img.classList.contains("active")) return;
    const warm = new Image();
    warm.src = img.src;
  });
}
