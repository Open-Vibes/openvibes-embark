/**
 * terminal.ts — the CLI section's command menu.
 *
 * This section, alone on the page, uses a SIDE menu rather than a tab row:
 * seven commands of very uneven length ("agentop" next to "agentop member
 * connect") never divide into a tidy row, and the wrapped result read as
 * broken. On a phone the menu collapses behind a button, because a vertical
 * list of seven items above the terminal would push the terminal off-screen.
 */

/** The argument shown in the frame's chrome, per menu entry. */
const ARGS = ["", " setup", " tui", " status", " member list", " central up", " watch"];

export function initTerminalTabs(): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>(".term-tab");
  const panes = document.querySelectorAll<HTMLElement>(".term-pane");
  const argEl = document.getElementById("term-active-arg");
  const menu = document.getElementById("term-tabs");
  const menuBtn = document.getElementById("term-menu-btn");
  const current = document.getElementById("term-menu-current");

  if (!tabs.length || !panes.length) return;

  function select(i: number): void {
    tabs.forEach(t => t.classList.remove("active"));
    panes.forEach(p => p.classList.remove("active"));
    tabs[i]?.classList.add("active");
    panes[i]?.classList.add("active");
    if (argEl) argEl.textContent = ARGS[i] ?? "";
    if (current) current.textContent = `agentop${ARGS[i] ?? ""}`;
    // Picking an entry closes the sheet — leaving it open on a phone would
    // cover the very terminal the choice was made to see.
    menu?.classList.remove("is-open");
    menuBtn?.setAttribute("aria-expanded", "false");
  }

  tabs.forEach((tab, i) => tab.addEventListener("click", () => select(i)));

  menuBtn?.addEventListener("click", () => {
    const open = menu?.classList.toggle("is-open") ?? false;
    menuBtn.setAttribute("aria-expanded", String(open));
  });

  select(0);
}
