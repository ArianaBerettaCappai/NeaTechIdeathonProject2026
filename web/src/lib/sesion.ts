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

// Borra la sesión guardada. Si el navegador bloquea el almacenamiento, no hay nada que borrar.
export function cerrarSesion(): void {
  try {
    localStorage.removeItem("vakaRapeToken");
    localStorage.removeItem("vakaRapeUser");
  } catch {
    /* almacenamiento no disponible */
  }
}

// Solo el vendedor (productor) publica ofertas y ve su panel de rodeo.
export const esVendedor = (): boolean => leerUsuario()?.rol === "vendedor" && leerToken() !== null;
