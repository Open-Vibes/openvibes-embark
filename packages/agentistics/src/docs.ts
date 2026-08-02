/**
 * docs.ts — the documentation page.
 *
 * Content comes from `generated/docs.ts`, which `scripts/sync-docs.ts` renders
 * from the agentistics repository's own README and docs/. Nothing here restates
 * the documentation; if a page reads wrong, it is wrong in the repository.
 *
 * Routing is by hash (`#security`, `#security--threat-model`) so the whole thing
 * is one static file with no server-side routing to arrange.
 */

import "./style.css";
import { initIcons } from "./icons";
import { initNav } from "./nav";
import { DOCS, DOC_ORDER, type DocPage } from "./generated/docs";

const REPO = "https://github.com/blpsoares/agentistics";

const el = <T extends HTMLElement>(id: string): T | null => document.getElementById(id) as T | null;

/** `#page` or `#page--anchor` — the double dash keeps a page id and a heading id
 *  in one hash without either needing to be escaped. */
function parseHash(): { page: string; anchor: string | null } {
  const raw = location.hash.replace(/^#/, "");
  if (!raw) return { page: DOC_ORDER[0]!, anchor: null };
  const [page, anchor] = raw.split("--");
  return {
    page: page && DOCS[page] ? page : DOC_ORDER[0]!,
    anchor: anchor ?? null,
  };
}

function buildSidebar(active: string): void {
  const nav = el("docs-nav");
  if (!nav) return;

  const groups: { name: string; pages: DocPage[] }[] = [];
  for (const id of DOC_ORDER) {
    const page = DOCS[id];
    if (!page) continue; // a doc the sync skipped because it is not in the checkout
    const group = groups.find(g => g.name === page.group) ?? (groups.push({ name: page.group, pages: [] }), groups[groups.length - 1]!);
    group.pages.push(page);
  }

  nav.innerHTML = groups
    .map(
      g => `<div class="docs-nav-group">
              <div class="docs-nav-group-title">${g.name}</div>
              ${g.pages
                .map(
                  p =>
                    `<a href="#${p.id}" class="docs-nav-link${p.id === active ? " is-active" : ""}" data-page="${p.id}">${p.title}</a>`,
                )
                .join("")}
            </div>`,
    )
    .join("");
}

function buildToc(page: DocPage): void {
  const toc = el("docs-toc");
  if (!toc) return;
  // h1 is the page title, already shown as the document heading — a table of
  // contents whose first entry is the title of the thing you are reading is noise.
  const items = page.headings.filter(h => h.level >= 2);
  toc.innerHTML = items.length
    ? items
        .map(
          h =>
            `<a href="#${page.id}--${h.id}" class="docs-toc-link lvl-${h.level}" data-anchor="${h.id}">${h.text}</a>`,
        )
        .join("")
    : `<span class="docs-toc-empty">—</span>`;
}

/** Anchor scrolling has to clear the fixed nav, so it cannot be left to the
 *  browser's native hash jump (which puts the heading under the bar). */
function scrollToAnchor(anchor: string | null): void {
  if (!anchor) {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    return;
  }
  const target = document.getElementById(anchor);
  if (!target) return;
  const top = target.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top, behavior: "smooth" });
}

function render(): void {
  const { page: id, anchor } = parseHash();
  const page = DOCS[id];
  const content = el("docs-content");
  if (!page || !content) return;

  content.innerHTML = page.html;
  buildSidebar(id);
  buildToc(page);

  const edit = el<HTMLAnchorElement>("docs-edit");
  if (edit) edit.href = `${REPO}/blob/main/${page.file}`;

  document.title = `${page.title} — Agentistics docs`;

  // Heading ids are unique per PAGE, not per site, so they are addressed through
  // the `page--anchor` form; give each heading a copyable link to itself.
  content.querySelectorAll<HTMLElement>("h2[id], h3[id]").forEach(h => {
    const a = document.createElement("a");
    a.className = "docs-anchor";
    a.href = `#${id}--${h.id}`;
    a.textContent = "#";
    a.setAttribute("aria-label", `Link to ${h.textContent ?? ""}`);
    h.appendChild(a);
  });

  addCopyButtons(content);
  requestAnimationFrame(() => scrollToAnchor(anchor));
  closeSidebar();
  syncTocOnScroll(page);
}

/** Every fenced block in these docs is a command someone is about to run. */
function addCopyButtons(root: HTMLElement): void {
  root.querySelectorAll("pre").forEach(pre => {
    const btn = document.createElement("button");
    btn.className = "docs-copy";
    btn.type = "button";
    btn.textContent = "Copy";
    btn.addEventListener("click", () => {
      const text = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
      void navigator.clipboard.writeText(text).then(
        () => {
          btn.textContent = "Copied";
          setTimeout(() => (btn.textContent = "Copy"), 1600);
        },
        () => (btn.textContent = "Press ⌘C"),
      );
    });
    pre.appendChild(btn);
  });
}

let tocObserver: IntersectionObserver | null = null;
function syncTocOnScroll(page: DocPage): void {
  tocObserver?.disconnect();
  const links = new Map<string, HTMLElement>();
  document.querySelectorAll<HTMLElement>(".docs-toc-link").forEach(a => {
    const anchor = a.dataset.anchor;
    if (anchor) links.set(anchor, a);
  });
  if (!links.size) return;

  tocObserver = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach(a => a.classList.remove("is-active"));
        links.get(entry.target.id)?.classList.add("is-active");
      }
    },
    // Only the band just under the nav counts as "current", so the highlight
    // tracks what you are reading rather than everything on screen.
    { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
  );
  page.headings
    .filter(h => h.level >= 2)
    .forEach(h => {
      const node = document.getElementById(h.id);
      if (node) tocObserver!.observe(node);
    });
}

/* ------------------------------------------------------------------- search */

interface Hit { page: DocPage; heading?: { id: string; text: string } }

function search(query: string): Hit[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const hits: Hit[] = [];
  for (const id of DOC_ORDER) {
    const page = DOCS[id];
    if (!page) continue;
    if (page.title.toLowerCase().includes(q)) hits.push({ page });
    for (const h of page.headings) {
      if (h.text.toLowerCase().includes(q)) hits.push({ page, heading: h });
    }
  }
  return hits.slice(0, 24);
}

function initSearch(): void {
  const input = el<HTMLInputElement>("docs-search");
  const nav = el("docs-nav");
  if (!input || !nav) return;

  input.addEventListener("input", () => {
    const q = input.value;
    if (q.trim().length < 2) {
      render();
      return;
    }
    const hits = search(q);
    nav.innerHTML = hits.length
      ? `<div class="docs-nav-group"><div class="docs-nav-group-title">${hits.length} result${hits.length === 1 ? "" : "s"}</div>` +
        hits
          .map(
            h =>
              `<a href="#${h.page.id}${h.heading ? `--${h.heading.id}` : ""}" class="docs-nav-link">` +
              `${h.heading ? h.heading.text : h.page.title}` +
              `<em class="docs-hit-page">${h.page.title}</em></a>`,
          )
          .join("") +
        `</div>`
      : `<div class="docs-nav-group"><div class="docs-nav-group-title">No results</div></div>`;
  });

  // `/` focuses search, the shortcut every docs site has; Escape gives the page back.
  document.addEventListener("keydown", e => {
    if (e.key === "/" && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    } else if (e.key === "Escape" && document.activeElement === input) {
      input.value = "";
      input.blur();
      render();
    }
  });
}

/* ------------------------------------------------------------- mobile sidebar */

function closeSidebar(): void {
  el("docs-sidebar")?.classList.remove("is-open");
  el("docs-menu-btn")?.setAttribute("aria-expanded", "false");
}

function initSidebarToggle(): void {
  const btn = el("docs-menu-btn");
  const sidebar = el("docs-sidebar");
  if (!btn || !sidebar) return;
  btn.addEventListener("click", () => {
    const open = sidebar.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(open));
  });
}

/* --------------------------------------------------------------------- boot */

function boot(): void {
  document.body.style.transition = "opacity 0.4s ease";
  document.body.style.opacity = "1";
  initIcons();
  initNav();
  initSearch();
  initSidebarToggle();
  render();
  window.addEventListener("hashchange", render);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
