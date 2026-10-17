import type { ReactNode } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function Layout({ children, variante = "sitio" }: { children: ReactNode; variante?: "sitio" | "acceso" }) {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header />
      <main id="contenido">{children}</main>
      <Footer variante={variante} />
    </>
  );
}
