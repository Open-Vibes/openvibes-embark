import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const LINKS: { href: string; label: string }[] = [
  { href: "/#problem", label: "Why" },
  { href: "/#company", label: "Company" },
  { href: "/#how", label: "How" },
  { href: "/#laws", label: "Laws" },
  { href: "/#harness", label: "Harnesses" },
  { href: "/#cost", label: "Cost" },
];

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-4 py-3">
      <div className="mx-auto max-w-content rounded-2xl lg:rounded-full border border-line bg-bg/70 backdrop-blur-xl shadow-lg shadow-black/20">
        <div className="flex items-center justify-between gap-4 px-4 sm:px-5 py-2.5">
          <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="AIPe home">
            <span aria-hidden="true" className="text-brand text-lg leading-none">◆</span>
            <span className="font-display font-bold text-text tracking-tight">aipe</span>
          </Link>

          <div className="hidden lg:flex items-center gap-5 text-[13px] font-medium text-muted whitespace-nowrap">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-brand transition-colors">
                {l.label}
              </a>
            ))}
            <Link to="/docs" className="hover:text-brand transition-colors">
              Docs
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://github.com/blpsoares/aipe"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-block text-[13px] font-medium text-muted hover:text-brand transition-colors"
            >
              GitHub
            </a>
            <ThemeToggle />
            <a
              href="/#start"
              className="hidden sm:inline-flex items-center rounded-full bg-brand px-3.5 py-1.5 text-[13px] font-semibold text-white hover:bg-brand-strong transition-colors"
            >
              Get started
            </a>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="lg:hidden flex flex-col gap-1 p-1.5 -mr-1"
            >
              <span className={`block w-4 h-px bg-muted transition-transform ${menuOpen ? "translate-y-[5px] rotate-45" : ""}`} />
              <span className={`block w-4 h-px bg-muted transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block w-4 h-px bg-muted transition-transform ${menuOpen ? "-translate-y-[5px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`lg:hidden fixed left-4 right-4 top-[68px] z-30 max-h-[calc(100vh-88px)] overflow-y-auto rounded-2xl border border-line bg-surface-1 shadow-2xl shadow-black/40 flex flex-col gap-1 px-6 pb-6 pt-4 text-[15px] font-medium text-muted origin-top transition-all duration-200 ease-out ${
          menuOpen ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="py-2 hover:text-brand transition-colors">
            {l.label}
          </a>
        ))}
        <Link to="/docs" onClick={() => setMenuOpen(false)} className="py-2 hover:text-brand transition-colors">
          Docs
        </Link>
        <a
          href="https://github.com/blpsoares/aipe"
          target="_blank"
          rel="noreferrer"
          onClick={() => setMenuOpen(false)}
          className="py-2 hover:text-brand transition-colors"
        >
          GitHub
        </a>
        <a
          href="/#start"
          onClick={() => setMenuOpen(false)}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
        >
          Get started
        </a>
      </div>
    </nav>
  );
}
