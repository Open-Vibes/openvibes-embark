import { Buffer } from "buffer";
import matter from "gray-matter";

const g = globalThis as typeof globalThis & { Buffer?: typeof Buffer };
if (typeof g.Buffer === "undefined") g.Buffer = Buffer;

export const GROUP_ORDER = ["get-started", "phases", "operation", "laws", "capabilities", "reference"] as const;
export type DocGroup = (typeof GROUP_ORDER)[number];

export const GROUP_LABEL: Record<DocGroup, string> = {
  "get-started": "Get started",
  phases: "The two phases",
  operation: "Operation",
  laws: "Laws & conventions",
  capabilities: "Capabilities",
  reference: "Reference",
};

const GITHUB_BLOB = "https://github.com/blpsoares/aipe/blob/main";

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  group: DocGroup;
  order: number;
  /** Path relative to the docs root, e.g. "laws/parallel-dispatch.md". */
  path: string;
  /** Markdown body with frontmatter stripped. */
  body: string;
}

const rawDocs = import.meta.glob("../../content/docs/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function toDocsRelPath(globKey: string): string {
  const marker = "content/docs/";
  const i = globKey.indexOf(marker);
  return i === -1 ? globKey : globKey.slice(i + marker.length);
}

function isDocGroup(value: unknown): value is DocGroup {
  return typeof value === "string" && (GROUP_ORDER as readonly string[]).includes(value);
}

function parseAll(): DocPage[] {
  const pages: DocPage[] = [];
  for (const [key, raw] of Object.entries(rawDocs)) {
    const path = toDocsRelPath(key);
    const { data, content } = matter(raw);
    const group = data.group;
    const slug = data.slug;
    if (!isDocGroup(group) || typeof slug !== "string" || slug.length === 0) continue;
    pages.push({
      slug,
      title: typeof data.title === "string" ? data.title : slug,
      description: typeof data.description === "string" ? data.description : "",
      group,
      order: typeof data.order === "number" ? data.order : 999,
      path,
      body: content.trim(),
    });
  }
  pages.sort((a, b) => {
    const ga = GROUP_ORDER.indexOf(a.group);
    const gb = GROUP_ORDER.indexOf(b.group);
    if (ga !== gb) return ga - gb;
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });
  return pages;
}

export const docs: DocPage[] = parseAll();
export const docBySlug: Map<string, DocPage> = new Map(docs.map((d) => [d.slug, d]));
const pathToSlug: Map<string, string> = new Map(docs.map((d) => [d.path, d.slug]));

/** First page of the first group — the target of the bare /docs redirect. */
export const firstDocSlug: string = docs[0]?.slug ?? "installation";

export function docsByGroup(): { group: DocGroup; pages: DocPage[] }[] {
  return GROUP_ORDER.map((group) => ({
    group,
    pages: docs.filter((d) => d.group === group),
  })).filter((g) => g.pages.length > 0);
}

function normalizeSegments(parts: string[]): string[] {
  const out: string[] = [];
  for (const part of parts) {
    if (part === "" || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return out;
}

/** Rewrite a relative markdown link to an in-app /docs route or a GitHub blob URL. */
export function resolveDocLink(fromPath: string, href: string): string {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;

  const [rawPath] = href.split("#");
  if (rawPath === undefined || rawPath === "") return href;

  const fromDir = fromPath.includes("/") ? fromPath.slice(0, fromPath.lastIndexOf("/")) : "";
  const baseSegments = ["docs", ...(fromDir ? fromDir.split("/") : [])];
  const repoSegments = normalizeSegments([...baseSegments, ...rawPath.split("/")]);
  const repoRelPath = repoSegments.join("/");

  if (repoRelPath.startsWith("docs/") && repoRelPath.endsWith(".md")) {
    const docsRel = repoRelPath.slice("docs/".length);
    const slug = pathToSlug.get(docsRel);
    if (slug) return `/docs/${slug}`;
  }
  return `${GITHUB_BLOB}/${repoRelPath}`;
}
