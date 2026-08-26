import { Link } from "react-router-dom";
import { docsByGroup, GROUP_LABEL } from "./loadDocs";
import { useI18n } from "../../i18n";

interface DocsSidebarProps {
  activeSlug: string;
  onNavigate?: () => void;
}

export default function DocsSidebar({ activeSlug, onNavigate }: DocsSidebarProps) {
  const { t } = useI18n();
  const groups = docsByGroup();
  return (
    <nav className="w-56 shrink-0 text-sm" aria-label={t.docs.documentation}>
      {groups.map(({ group, pages }) => (
        <div key={group} className="mb-6">
          <p className="font-mono text-[11px] uppercase tracking-wider text-faint mb-2">{t.docs.groups[group] ?? GROUP_LABEL[group]}</p>
          <ul className="space-y-0.5">
            {pages.map((p) => {
              const active = p.slug === activeSlug;
              return (
                <li key={p.slug}>
                  <Link
                    to={`/docs/${p.slug}`}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`block rounded-md px-2.5 py-1.5 transition-colors ${
                      active
                        ? "bg-brand/12 text-brand font-medium"
                        : "text-muted hover:text-text hover:bg-surface-2"
                    }`}
                  >
                    {p.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
