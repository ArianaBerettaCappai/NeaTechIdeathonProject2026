import { Link } from "react-router-dom";

export function Footer({ variante = "sitio" }: { variante?: "sitio" | "acceso" }) {
  const texto =
    variante === "acceso"
      ? "Acceso de demostración · No ingreses contraseñas reales"
      : "Prototipo demostrativo · Datos simulados";
  return (
    <footer className={`site-footer${variante === "acceso" ? " auth-footer" : ""}`}>
      <Link className="footer-brand" to="/">
        VAKA RAPÉ <strong>Trazabilidad Ganadera NEA</strong>
      </Link>
      <span>{texto}</span>
      <Link to="/">Volver al inicio</Link>
    </footer>
  );
}
