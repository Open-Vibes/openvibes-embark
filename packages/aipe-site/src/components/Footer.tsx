import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-line px-5 sm:px-6 py-12">
      <div className="mx-auto max-w-content flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-brand text-lg leading-none">◆</span>
            <span className="font-display font-bold text-text">aipe</span>
          </div>
          <p className="mt-2 text-sm text-faint max-w-xs">
            The AI Product Engineer — a Claude Code plugin that coordinates specialists across your repos.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-faint">Product</span>
            <a href="/#how" className="hover:text-brand transition-colors">How it works</a>
            <a href="/#laws" className="hover:text-brand transition-colors">The laws</a>
            <a href="/#cost" className="hover:text-brand transition-colors">Cost control</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-faint">Learn</span>
            <Link to="/docs" className="hover:text-brand transition-colors">Docs</Link>
            <a href="/#start" className="hover:text-brand transition-colors">Get started</a>
            <a href="https://github.com/blpsoares/aipe" target="_blank" rel="noreferrer" className="hover:text-brand transition-colors">
              GitHub
            </a>
          </div>
        </nav>
      </div>
      <div className="mx-auto max-w-content mt-10 pt-6 border-t border-line-soft flex flex-col sm:flex-row justify-between gap-2 text-xs text-faint">
        <span>openvibes.tech — the open-source umbrella</span>
        <span className="font-mono">aipe v0.3.1</span>
      </div>
    </footer>
  );
}
