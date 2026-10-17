export const moneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "USD" });
export const numero = new Intl.NumberFormat("es-AR");

// Convierte una fecha ISO (AAAA-MM-DD) a DD/MM/AAAA sin pasar por Date (evita corrimientos de zona horaria).
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Sin fecha";
  const parts = iso.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : iso;
}
