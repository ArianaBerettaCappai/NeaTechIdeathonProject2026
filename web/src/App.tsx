import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AccesoPage } from "./pages/AccesoPage";
import { AnimalPage } from "./pages/AnimalPage";
import { InicioPage } from "./pages/InicioPage";
import { LotePage } from "./pages/LotePage";
import { OfertasPage } from "./pages/OfertasPage";
import { VenderPage } from "./pages/VenderPage";

// Al cambiar de página vuelve arriba, salvo que la navegación apunte a un ancla.
function ScrollAlCambiarDePagina() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollAlCambiarDePagina />
      <Routes>
        <Route path="/" element={<InicioPage />} />
        <Route path="/ofertas" element={<OfertasPage />} />
        <Route path="/ofertas/animal/:animalId" element={<AnimalPage />} />
        <Route path="/ofertas/:loteId" element={<LotePage />} />
        <Route path="/vender" element={<VenderPage />} />
        <Route path="/acceso" element={<AccesoPage />} />
        <Route path="*" element={<NoEncontrada />} />
      </Routes>
    </>
  );
}

function NoEncontrada() {
  return (
    <Layout>
      <section className="section">
        <p className="eyebrow">ERROR 404</p>
        <h2>Esta página no existe</h2>
        <p className="section-intro">Puede que el enlace esté desactualizado. Volvé al inicio o revisá las ofertas.</p>
        <div className="hero-actions">
          <Link className="button button-primary" to="/">Ir al inicio</Link>
          <Link className="button button-outline" to="/ofertas">Ver ofertas</Link>
        </div>
      </section>
    </Layout>
  );
}
