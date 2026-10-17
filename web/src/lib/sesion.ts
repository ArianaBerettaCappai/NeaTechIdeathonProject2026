import type { UsuarioPublico } from "./api";

// La sesión la guarda guardarSesion() (lib/api.ts). Si el navegador bloquea el almacenamiento, no hay sesión.
export function leerToken(): string | null {
  try {
    return localStorage.getItem("vakaRapeToken");
  } catch {
    return null;
  }
}

export function leerUsuario(): UsuarioPublico | null {
  try {
    const crudo = localStorage.getItem("vakaRapeUser");
    return crudo ? (JSON.parse(crudo) as UsuarioPublico) : null;
  } catch {
    return null;
  }
}

// Solo el vendedor (productor) publica ofertas y ve su panel de rodeo.
export const esVendedor = (): boolean => leerUsuario()?.rol === "vendedor" && leerToken() !== null;
