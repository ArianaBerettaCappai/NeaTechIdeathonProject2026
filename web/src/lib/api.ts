// Cliente del backend (App/, Express + Supabase). Las rutas son relativas: en desarrollo las resuelve el proxy de Vite.

export interface UsuarioPublico {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: "vendedor" | "comprador";
}

export interface RespuestaAuth {
  user: UsuarioPublico;
  token: string;
}

export interface RegistroInput {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: "vendedor" | "comprador";
}

export class ErrorApi extends Error {}

async function enviar<T>(ruta: string, cuerpo: unknown): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(ruta, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
  } catch {
    throw new ErrorApi("No se pudo conectar con el servidor. Verificá que el backend esté corriendo en el puerto 3000.");
  }
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    // Un 5xx sin cuerpo JSON suele ser el proxy de Vite sin backend detrás.
    const sinBackend = respuesta.status >= 500 && !datos.message;
    throw new ErrorApi(
      datos.message ??
        (sinBackend
          ? "El servidor no respondió. Verificá que el backend esté corriendo en el puerto 3000."
          : "No se pudo completar la operación.")
    );
  }
  return datos as T;
}

export const iniciarSesion = (email: string, password: string) =>
  enviar<RespuestaAuth>("/auth/login", { email, password });

export const registrarse = (datos: RegistroInput) => enviar<RespuestaAuth>("/auth/register", datos);

// El almacenamiento es opcional: si el navegador lo bloquea, la sesión sigue en memoria.
export function guardarSesion(respuesta: RespuestaAuth): void {
  try {
    localStorage.setItem("vakaRapeToken", respuesta.token);
    localStorage.setItem("vakaRapeUser", JSON.stringify(respuesta.user));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function leerEmailRecordado(): string | null {
  try {
    return sessionStorage.getItem("vakaRapeDemoEmail");
  } catch {
    return null;
  }
}

export function recordarEmail(email: string | null): void {
  try {
    if (email) sessionStorage.setItem("vakaRapeDemoEmail", email);
    else sessionStorage.removeItem("vakaRapeDemoEmail");
  } catch {
    /* almacenamiento no disponible */
  }
}
