import { ErrorApi } from "./api";
import { leerToken } from "./sesion";

// Contrato del backend (App/) para las ofertas publicadas por vendedores.
export interface AnimalPublicado {
  animalCodigo: string;
  pesoKg: number;
  esAptoUe: boolean;
}

export interface LotePublicado {
  id: string;
  titulo: string;
  productorCuit: string;
  precioPorKg: number;
  animales: AnimalPublicado[];
  pesoTotalKg: number;
  montoTotal: number;
  publicadoAt: string;
  imagenUrl: string | null;
}

// Un animal del rodeo de un CUIT, sea o no exportable.
export interface AnimalRodeo {
  animalCodigo: string;
  caravana: string;
  categoria: string;
  raza: string;
  sexo: "M" | "H";
  pesoKg: number;
  estadoSanitario: string;
  exportable: boolean;
  motivosNoExportable: string[];
}

export interface RodeoProductor {
  productorCuit: string;
  productorNombre: string;
  animales: AnimalRodeo[];
}

export interface NuevaOferta {
  titulo: string;
  productorCuit: string;
  animalCodigos: string[];
  precioPorKg: number;
}

async function pedir<T>(ruta: string, init?: RequestInit): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(ruta, init);
  } catch {
    throw new ErrorApi("No se pudo conectar con el servidor. Verificá que el backend esté corriendo en el puerto 3000.");
  }
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new ErrorApi(datos.message ?? "No se pudo completar la operación.");
  return datos as T;
}

// Las rutas de escritura piden el JWT del vendedor.
function encabezados(): HeadersInit {
  const token = leerToken();
  return { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export const pedirLotesPublicados = (): Promise<LotePublicado[]> =>
  pedir<{ lotes: LotePublicado[] }>("/api/ofertas").then((datos) => datos.lotes);

export const pedirImagenes = (): Promise<Record<string, string>> =>
  pedir<{ imagenes: Record<string, string> }>("/api/ofertas/imagenes").then((datos) => datos.imagenes);

// Todo el rodeo del CUIT (solo vendedores). Incluye los animales no exportables con su motivo.
export const pedirRodeo = (cuit: string): Promise<RodeoProductor> =>
  pedir<RodeoProductor>(`/api/ofertas/rodeo/${encodeURIComponent(cuit)}`, { headers: encabezados() });

export const crearOferta = (oferta: NuevaOferta): Promise<LotePublicado> =>
  pedir<LotePublicado>("/api/ofertas", { method: "POST", headers: encabezados(), body: JSON.stringify(oferta) });

export const subirImagen = (loteId: string, dataUrl: string): Promise<{ imagenUrl: string }> =>
  pedir<{ imagenUrl: string }>(`/api/ofertas/${encodeURIComponent(loteId)}/imagen`, {
    method: "POST",
    headers: encabezados(),
    body: JSON.stringify({ dataUrl }),
  });
