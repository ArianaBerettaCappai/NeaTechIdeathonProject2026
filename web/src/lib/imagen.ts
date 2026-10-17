import { ErrorApi } from "./api";

// Imagen de un lote: JPG, PNG o WebP, de hasta 3 MB.
const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANO_MAXIMO = 3 * 1024 * 1024;

export const ACEPTA_IMAGEN = TIPOS_PERMITIDOS.join(",");

// Valida el archivo y lo devuelve como dataURL, listo para enviar al backend.
export async function leerImagen(archivo: File): Promise<string> {
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) throw new ErrorApi("La imagen debe ser JPG, PNG o WebP.");
  if (archivo.size > TAMANO_MAXIMO) throw new ErrorApi("La imagen no puede superar los 3 MB.");
  return new Promise<string>((resolver, rechazar) => {
    const lector = new FileReader();
    lector.onload = () => resolver(lector.result as string);
    lector.onerror = () => rechazar(new ErrorApi("No se pudo leer la imagen."));
    lector.readAsDataURL(archivo);
  });
}
