import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import DocsSidebar from "./DocsSidebar";
import DocMarkdown from "./DocMarkdown";
import { docBySlug, firstDocSlug } from "./loadDocs";
import { useI18n } from "../../i18n";

export default function Docs() {
  const { t } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeSlug = slug ?? firstDocSlug;
  const doc = docBySlug.get(activeSlug);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeSlug]);

  if (!doc) return <Navigate to={`/docs/${firstDocSlug}`} replace />;

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-24 lg:pt-28 pb-20">
      <button
        onClick={() => setDrawerOpen(true)}
        className="lg:hidden flex items-center gap-2 font-mono text-[13px] text-muted border border-line rounded-md px-3 py-2 mb-6"
      >
        <span aria-hidden="true">☰</span> {t.docs.documentation}
      </button>

      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-72 max-w-[85vw] bg-bg border-r border-line h-full overflow-y-auto p-6">
            <button
              onClick={() => setDrawerOpen(false)}
              className="font-mono text-[13px] text-muted mb-6"
              aria-label={t.docs.closeMenu}
            >
              ✕ {t.docs.close}
            </button>
            <DocsSidebar activeSlug={activeSlug} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex gap-12">
        <aside className="hidden lg:block sticky top-28 self-start max-h-[calc(100vh-8rem)] overflow-y-auto">
          <DocsSidebar activeSlug={activeSlug} />
        </aside>
        <article className="flex-1 min-w-0">
          <DocMarkdown body={doc.body} docPath={doc.path} />
        </article>
      </div>
    </div>
  );
}
