import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { resolveDocLink } from "./loadDocs";

interface DocMarkdownProps {
  body: string;
  docPath: string;
}

function hastText(node: unknown): string {
  const n = node as { type?: string; value?: string; children?: unknown[] } | null;
  if (!n) return "";
  if (n.type === "text") return n.value ?? "";
  if (Array.isArray(n.children)) return n.children.map(hastText).join("");
  return "";
}

function CodeBlockPre({ node, children }: { node?: unknown; children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const text = hastText(node);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="relative group my-5">
      <pre className="bg-surface-1 border border-line rounded-lg p-4 pr-16 font-mono text-[12.5px] text-text overflow-x-auto">
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 font-mono text-[10px] uppercase tracking-wide text-muted border border-line rounded px-2 py-1 bg-bg/80 hover:text-brand hover:border-brand transition-colors"
      >
        {copied ? "copied" : "copy"}
      </button>
    </div>
  );
}

function buildComponents(docPath: string): Components {
  return {
    h1: ({ children }) => <h1 className="font-display text-3xl font-semibold text-text mb-5 mt-1 leading-tight">{children}</h1>,
    h2: ({ children }) => <h2 className="font-display text-2xl font-semibold text-text mt-10 mb-4">{children}</h2>,
    h3: ({ children }) => <h3 className="font-display text-xl font-semibold text-text mt-8 mb-3">{children}</h3>,
    h4: ({ children }) => <h4 className="font-semibold text-text mt-6 mb-2">{children}</h4>,
    p: ({ children }) => <p className="text-muted text-[15px] leading-relaxed my-4">{children}</p>,
    ul: ({ children }) => <ul className="list-disc pl-6 my-4 space-y-1.5 text-muted text-[15px] leading-relaxed">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal pl-6 my-4 space-y-1.5 text-muted text-[15px] leading-relaxed">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => <strong className="text-text font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    hr: () => <hr className="border-t border-line my-8" />,
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-brand pl-4 my-5 text-text text-[14px] [&>p]:text-text">{children}</blockquote>
    ),
    a: ({ href, children }) => {
      const resolved = resolveDocLink(docPath, href ?? "");
      if (resolved.startsWith("/docs/")) {
        return (
          <Link to={resolved} className="text-brand hover:underline">
            {children}
          </Link>
        );
      }
      const external = /^https?:/i.test(resolved);
      return (
        <a href={resolved} className="text-brand hover:underline" {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
          {children}
        </a>
      );
    },
    table: ({ children }) => (
      <div className="overflow-x-auto my-5 border border-line rounded-lg">
        <table className="w-full text-left text-[13px] text-muted border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-surface-2">{children}</thead>,
    th: ({ children }) => <th className="border-b border-line px-3 py-2 font-semibold text-text align-top">{children}</th>,
    td: ({ children }) => <td className="border-b border-line-soft px-3 py-2 align-top">{children}</td>,
    img: ({ src, alt }) => <img src={typeof src === "string" ? src : undefined} alt={alt} className="max-w-full my-4 rounded-lg" />,
    pre: CodeBlockPre,
    code: ({ className, children }) => {
      const isBlock = /\blanguage-/.test(className ?? "");
      if (isBlock) return <code className={className}>{children}</code>;
      return (
        <code className="font-mono text-[12.5px] text-brand bg-surface-2 px-1.5 py-0.5 rounded border border-line-soft">{children}</code>
      );
    },
  };
}

export default function DocMarkdown({ body, docPath }: DocMarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
      components={buildComponents(docPath)}
    >
      {body}
    </ReactMarkdown>
  );
}
