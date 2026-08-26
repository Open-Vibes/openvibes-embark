import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line px-5 sm:px-6 py-12">
      <div className="mx-auto max-w-content flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span aria-hidden="true" className="text-brand text-lg leading-none">◆</span>
            <span className="font-display font-bold text-text">aipe</span>
          </div>
          <p className="mt-2 text-sm text-faint max-w-xs">{t.footer.tagline}</p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-faint">{t.footer.product}</span>
            <a href="/#how" className="hover:text-brand transition-colors">{t.footer.howItWorks}</a>
            <a href="/#laws" className="hover:text-brand transition-colors">{t.footer.theLaws}</a>
            <a href="/#cost" className="hover:text-brand transition-colors">{t.footer.costControl}</a>
          </div>
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider text-faint">{t.footer.learn}</span>
            <Link to="/docs" className="hover:text-brand transition-colors">{t.footer.docs}</Link>
            <a href="/#start" className="hover:text-brand transition-colors">{t.footer.getStarted}</a>
            <a href="https://github.com/blpsoares/aipe" target="_blank" rel="noreferrer" className="hover:text-brand transition-colors">
              {t.footer.github}
            </a>
          </div>
        </nav>
      </div>
      <div className="mx-auto max-w-content mt-10 pt-6 border-t border-line-soft flex flex-col sm:flex-row justify-between gap-2 text-xs text-faint">
        <span>{t.footer.umbrella}</span>
        {/* No hardcoded version: this site has no build-time access to the aipe
            repo's release number, so any pinned string rots (and breaks the
            truthfulness gate). Link to the live releases page — current by
            definition. */}
        <a
          href="https://github.com/blpsoares/aipe/releases/latest"
          target="_blank"
          rel="noreferrer"
          className="font-mono hover:text-brand transition-colors"
        >
          {t.footer.latestRelease}
        </a>
      </div>
    </footer>
  );
}
