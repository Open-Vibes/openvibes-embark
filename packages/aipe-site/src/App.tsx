import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import ScrollToHash from "./components/ScrollToHash";
import Landing from "./pages/Landing/Landing";
import Docs from "./pages/Docs/Docs";
import { firstDocSlug } from "./pages/Docs/loadDocs";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToHash />
      <Nav />
      <main id="top">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/docs" element={<Navigate to={`/docs/${firstDocSlug}`} replace />} />
          <Route path="/docs/:slug" element={<Docs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
