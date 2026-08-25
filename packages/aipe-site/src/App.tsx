import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { I18nProvider } from "./i18n";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ScrollToHash from "./components/ScrollToHash";
import Landing from "./pages/Landing/Landing";

// Docs pull in the markdown stack (react-markdown + rehype-highlight + gray-matter).
// Lazy-load the whole route so none of it lands in the landing bundle — keeps the
// initial JS for the marketing page small and LCP fast.
const Docs = lazy(() => import("./pages/Docs/Docs"));

// The bare /docs redirect targets the first doc (get-started/installation, order 1)
// as a constant so the redirect doesn't force the docs chunk to load eagerly.
const FIRST_DOC = "installation";

function DocsFallback() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-28 pb-20 text-muted font-mono text-sm">Loading docs…</div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <ScrollToHash />
        <Nav />
        <main id="top">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/docs" element={<Navigate to={`/docs/${FIRST_DOC}`} replace />} />
            <Route
              path="/docs/:slug"
              element={
                <Suspense fallback={<DocsFallback />}>
                  <Docs />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </I18nProvider>
  );
}
