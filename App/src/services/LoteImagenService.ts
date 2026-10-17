import fs from "fs/promises";
import path from "path";
import { AuthError } from "./AuthError";

// Carpeta publica de uploads: App/uploads (servida en /uploads por express.static).
export const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");
const LOTES_DIR = path.join(UPLOADS_DIR, "lotes");
const URL_BASE = "/uploads/lotes";

const MAX_BYTES = 3 * 1024 * 1024;
const DATA_URL_REGEX = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;
const EXTENSIONES: Record<string, string> = { jpeg: "jpg", png: "png", webp: "webp" };
const EXTENSIONES_VALIDAS = new Set(Object.values(EXTENSIONES));
const LOTE_ID_REGEX = /^[A-Za-z0-9_-]{1,64}$/;

export class LoteImagenService {
  async guardarImagen(loteId: string, dataUrl: string): Promise<string> {
    if (!LOTE_ID_REGEX.test(loteId)) {
      throw new AuthError("El identificador del lote no es válido.", 400);
    }

    const match = DATA_URL_REGEX.exec(dataUrl);
    if (!match) {
      throw new AuthError(
        "La imagen debe enviarse como data URL base64 en formato JPEG, PNG o WebP.",
        400
      );
    }

    const [, formato, base64] = match;
    const buffer = Buffer.from(base64, "base64");
    if (buffer.length > MAX_BYTES) {
      throw new AuthError("La imagen supera el tamaño máximo de 3 MB.", 413);
    }
    if (buffer.length === 0 || !contenidoCoincideConFormato(buffer, formato)) {
      throw new AuthError("El contenido de la imagen no coincide con su formato.", 400);
    }

    const archivo = `${loteId}.${EXTENSIONES[formato]}`;

    await fs.mkdir(LOTES_DIR, { recursive: true });
    // Reemplaza la imagen anterior, aunque tuviera otra extension.
    await this.eliminarImagenes(loteId);
    await fs.writeFile(path.join(LOTES_DIR, archivo), buffer);

    return `${URL_BASE}/${archivo}`;
  }

  async listarImagenes(): Promise<Record<string, string>> {
    let archivos: string[];
    try {
      archivos = await fs.readdir(LOTES_DIR);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return {};
      }
      throw error;
    }

    const imagenes: Record<string, string> = {};
    for (const archivo of archivos) {
      const { name, ext } = path.parse(archivo);
      if (EXTENSIONES_VALIDAS.has(ext.slice(1)) && LOTE_ID_REGEX.test(name)) {
        imagenes[name] = `${URL_BASE}/${archivo}`;
      }
    }
    return imagenes;
  }

  private async eliminarImagenes(loteId: string): Promise<void> {
    let archivos: string[];
    try {
      archivos = await fs.readdir(LOTES_DIR);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return;
      }
      throw error;
    }
    await Promise.all(
      archivos
        .filter((archivo) => path.parse(archivo).name === loteId)
        .map((archivo) => fs.rm(path.join(LOTES_DIR, archivo), { force: true }))
    );
  }
}

// Verifica los bytes magicos para no servir como imagen un archivo de otro tipo.
function contenidoCoincideConFormato(buffer: Buffer, formato: string): boolean {
  switch (formato) {
    case "png":
      return buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    case "jpeg":
      return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    case "webp":
      return (
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
      );
    default:
      return false;
  }
}
