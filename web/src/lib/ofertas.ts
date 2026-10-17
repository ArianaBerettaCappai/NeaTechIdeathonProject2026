import type { AnimalOferta, Lote, Parada } from "../types";

// Exportable a la UE: estado sanitario Aprobado y sin ningún motivo de bloqueo (deforestación, campo no habilitado).
export const esAptoUE = (animal: AnimalOferta): boolean =>
  animal.estado_sanitario === "Aprobado" && animal.motivosNoExportable.length === 0;
export const pesoTotal = (lote: Lote): number => lote.animales.reduce((total, animal) => total + animal.pesoKg, 0);
export const valorLote = (lote: Lote): number => pesoTotal(lote) * lote.precioKg;
export const alertasDe = (animal: AnimalOferta): Parada[] =>
  animal.paradas.filter((parada) => parada.deforestacion.alerta);

// Para quien compra: solo los animales exportables a la UE. Un lote sin ninguno no se muestra.
// El vendedor ve el lote completo.
export function visiblesPara(lotes: Lote[], vendedor: boolean): Lote[] {
  if (vendedor) return lotes;
  return lotes.flatMap((lote) => {
    const aptos = lote.animales.filter(esAptoUE);
    return aptos.length ? [{ ...lote, animales: aptos }] : [];
  });
}

export const buscarLote = (lotes: Lote[], id: string): Lote | undefined => lotes.find((lote) => lote.id === id);

export function buscarAnimal(lotes: Lote[], id: string): { lote: Lote; animal: AnimalOferta } | undefined {
  for (const lote of lotes) {
    const animal = lote.animales.find((item) => item.id === id);
    if (animal) return { lote, animal };
  }
  return undefined;
}

// Polígono ilustrativo, no a escala: un radio mínimo para que se vea a escala regional.
export function zonaDeforestada(lat: number, lng: number, hectareas: number): [number, number][] {
  const radioKm = 6 + Math.sqrt(hectareas) * 0.4;
  const puntos: [number, number][] = [];
  for (let i = 0; i < 14; i++) {
    const angulo = (i / 14) * 2 * Math.PI;
    const irregular = 0.72 + 0.28 * Math.abs(Math.sin(i * 2.3 + hectareas));
    const r = radioKm * irregular;
    puntos.push([
      lat + (r * Math.sin(angulo)) / 111,
      lng + (r * Math.cos(angulo)) / (111 * Math.cos((lat * Math.PI) / 180)),
    ]);
  }
  return puntos;
}
