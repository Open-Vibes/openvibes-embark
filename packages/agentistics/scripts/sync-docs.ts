/**
 * sync-docs.ts — pull the agentistics documentation into this site.
 *
 * The docs page is fed by the PROJECT's own markdown (its README plus docs/*.md)
 * rather than by a hand-written copy, so the site cannot drift from the
 * repository the way a duplicated page always eventually does.
 *
 * The rendered output is COMMITTED (`src/generated/docs.ts`). That is deliberate:
 * the site must build on a machine that does not have the agentistics checkout —
 * a CI runner, or anyone cloning only this repo. Re-run this script whenever the
 * project's docs change; the diff it produces is the review.
 *
 * Usage:
 *   AGENTISTICS_REPO=/path/to/agentistics bun run scripts/sync-docs.ts
 *
 * Defaults to ~/agentistics, then ../../../agentistics relative to this package.
 */

import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { marked } from "marked";

const CANDIDATES = [
  process.env.AGENTISTICS_REPO,
  join(homedir(), "agentistics"),
  join(import.meta.dirname, "..", "..", "..", "..", "agentistics"),
].filter((p): p is string => !!p);

/** The pages the site publishes, in the order the sidebar lists them. The README
 *  leads because it is the one document that answers "what is this". */
const PAGES: { id: string; file: string; title: string; group: string }[] = [
  { id: "overview", file: "README.md", title: "Overview", group: "Start here" },
  { id: "cli", file: "docs/cli.md", title: "CLI reference", group: "Start here" },
  { id: "metrics", file: "docs/metrics.md", title: "Metrics & pricing", group: "Start here" },
  { id: "data-sources", file: "docs/data-sources.md", title: "Data sources", group: "Start here" },
  { id: "harness-contract", file: "docs/harness-contract.md", title: "Harness contract", group: "Harnesses" },
  { id: "architecture", file: "docs/architecture.md", title: "Architecture", group: "Team Mode" },
  { id: "deploy", file: "docs/DEPLOY.md", title: "Deploying a central", group: "Team Mode" },
  { id: "github-actions", file: "docs/github-actions.md", title: "GitHub Actions", group: "Team Mode" },
  { id: "security", file: "docs/security.md", title: "Security model", group: "Security" },
  { id: "exposure", file: "docs/exposure.md", title: "Exposing a central", group: "Security" },
  { id: "mcp", file: "docs/mcp.md", title: "MCP server", group: "Integrations" },
  { id: "nay", file: "docs/nay.md", title: "Nay chat", group: "Integrations" },
  { id: "opentelemetry", file: "docs/opentelemetry.md", title: "OpenTelemetry", group: "Integrations" },
];

interface Heading { id: string; text: string; level: number }

async function findRepo(): Promise<string> {
  for (const dir of CANDIDATES) {
    if (await stat(join(dir, "README.md")).then(() => true).catch(() => false)) return dir;
  }
  throw new Error(
    `agentistics checkout not found. Tried:\n  ${CANDIDATES.join("\n  ")}\n` +
      `Set AGENTISTICS_REPO=/path/to/agentistics`,
  );
}

const slug = (text: string): string =>
  text.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);

/** Rewrites the links a repository document makes to its own files, which mean
 *  nothing on a website: a link to another page we publish becomes an in-site
 *  hash, and one to a file we do not becomes a link into GitHub rather than a
 *  404. Anchors and external URLs are left exactly as written. */
function rewriteLink(href: string, repoUrl: string): string {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  const clean = href.replace(/^\.\//, "").split("#")[0]!;
  const anchor = href.includes("#") ? "#" + href.split("#")[1] : "";
  const page = PAGES.find(p => p.file === clean);
  if (page) return `#${page.id}${anchor ? anchor.replace("#", "--") : ""}`;
  return `${repoUrl}/blob/main/${clean}${anchor}`;
}

/** The recordings under `docs/media/` are copied into this site's own public/
 *  directory (see the copy step in the release workflow), so they are served
 *  from here: pointing them at `raw/main` would break the docs page for every
 *  recording that has not been merged yet, and would make the site depend on
 *  GitHub being reachable to show its own screenshots. Anything else relative
 *  really does live only in the repository, so it keeps pointing there. */
function rewriteImage(src: string, repoUrl: string): string {
  if (/^https?:/.test(src)) return src;
  const clean = src.replace(/^\.\//, "");
  const media = clean.match(/^docs\/media\/(.+)$/);
  if (media) return `/release/gifs/${media[1]}`;
  return `${repoUrl}/raw/main/${clean}`;
}

async function render(repo: string, repoUrl: string, file: string): Promise<{ html: string; headings: Heading[] }> {
  const md = await readFile(join(repo, file), "utf8");
  const headings: Heading[] = [];
  const seen = new Set<string>();

  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }) => {
    const text = tokens.map(t => ("raw" in t ? t.raw : "")).join("").replace(/<[^>]+>/g, "").trim();
    let id = slug(text) || `h${headings.length}`;
    while (seen.has(id)) id += "-x";
    seen.add(id);
    if (depth <= 3 && text) headings.push({ id, text, level: depth });
    return `<h${depth} id="${id}">${text}</h${depth}>\n`;
  };
  renderer.link = ({ href, title, tokens }) => {
    const out = rewriteLink(href ?? "", repoUrl);
    const external = /^https?:/.test(out);
    const label = tokens.map(t => ("raw" in t ? t.raw : "")).join("");
    return `<a href="${out}"${title ? ` title="${title}"` : ""}` +
      `${external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`;
  };
  renderer.image = ({ href, title, text }) =>
    `<img src="${rewriteImage(href ?? "", repoUrl)}" alt="${text ?? ""}"` +
    `${title ? ` title="${title}"` : ""} loading="lazy" />`;

  // The project's markdown contains raw HTML (the centred badge blocks, the
  // <img> media). It is our own repository, so it is rendered as written — but
  // marked passes raw HTML straight through WITHOUT calling the renderers above,
  // so the src/href rewriting has to be applied to it separately. Missing this
  // is silent: the page builds and every hand-written <img> 404s.
  let html = await marked.parse(md, { renderer, gfm: true, breaks: false, async: true });
  html = html.replace(
    /(<img\b[^>]*?\ssrc=")([^"]+)(")/gi,
    (_m, pre: string, src: string, post: string) => pre + rewriteImage(src, repoUrl) + post,
  );
  html = html.replace(
    /(<a\b[^>]*?\shref=")([^"]+)(")/gi,
    (_m, pre: string, href: string, post: string) => pre + rewriteLink(href, repoUrl) + post,
  );
  return { html, headings };
}

async function run(): Promise<void> {
  const repo = await findRepo();
  const repoUrl = "https://github.com/blpsoares/agentistics";
  console.log(`reading ${repo}`);

  const docs: Record<string, unknown> = {};
  for (const page of PAGES) {
    const exists = await stat(join(repo, page.file)).then(() => true).catch(() => false);
    if (!exists) {
      console.warn(`  skipped ${page.file} (not in the checkout)`);
      continue;
    }
    const { html, headings } = await render(repo, repoUrl, page.file);
    docs[page.id] = { ...page, html, headings };
    console.log(`  ${page.id.padEnd(18)} ${headings.length} headings`);
  }

  const out = join(import.meta.dirname, "..", "src", "generated");
  await mkdir(out, { recursive: true });
  await writeFile(
    join(out, "docs.ts"),
    `// GENERATED by scripts/sync-docs.ts — do not edit by hand.\n` +
      `// Source: ${repoUrl} (README.md + docs/*.md)\n\n` +
      `export interface DocHeading { id: string; text: string; level: number }\n` +
      `export interface DocPage {\n` +
      `  id: string; file: string; title: string; group: string;\n` +
      `  html: string; headings: DocHeading[]\n}\n\n` +
      `export const DOC_ORDER: string[] = ${JSON.stringify(PAGES.map(p => p.id))}\n\n` +
      `export const DOCS: Record<string, DocPage> = ${JSON.stringify(docs, null, 2)}\n`,
  );
  console.log(`\nwrote src/generated/docs.ts (${Object.keys(docs).length} pages)`);
}

await run();
