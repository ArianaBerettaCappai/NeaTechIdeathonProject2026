import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { esVendedor } from "../lib/sesion";

// Cierra el menú móvil al elegir una opción.
export function Header() {
  const [abierto, setAbierto] = useState(false);
  const cerrar = () => setAbierto(false);
  const vendedor = esVendedor();

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="VAKA RAPÉ, inicio" onClick={cerrar}>
          <img className="brand-logo" src="/assets/logo.jpeg" alt="Logo VAKA RAPÉ" />
          <span>
            <strong>VAKA RAPÉ</strong>
            <small>Trazabilidad ganadera · NEA</small>
          </span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={abierto}
          aria-controls="mainNav"
          onClick={() => setAbierto((valor) => !valor)}
        >
          <span aria-hidden="true">☰</span>
          <span className="sr-only">Abrir menú</span>
        </button>
        <nav id="mainNav" className={`main-nav${abierto ? " is-open" : ""}`} aria-label="Navegación principal">
          <NavLink to="/" end onClick={cerrar}>Inicio</NavLink>
          <NavLink to="/ofertas" onClick={cerrar}>Ofertas</NavLink>
          {vendedor && <NavLink to="/vender" onClick={cerrar}>Vender</NavLink>}
          <Link className="nav-auth-button nav-login-button" to="/acceso" onClick={cerrar}>Iniciar sesión</Link>
          <Link className="nav-auth-button" to="/acceso?modo=registro" onClick={cerrar}>Registrarse</Link>
        </nav>
      </div>
    </header>
  );
}
