import { LOTES } from "../data/ofertas";
import type { AnimalOferta, Lote, Parada } from "../types";

// Regla RF-3: la elegibilidad UE es un booleano simple sobre el estado sanitario.
export const esAptoUE = (animal: AnimalOferta): boolean => animal.estado_sanitario === "Aprobado";
export const pesoTotal = (lote: Lote): number => lote.animales.reduce((total, animal) => total + animal.pesoKg, 0);
export const valorLote = (lote: Lote): number => pesoTotal(lote) * lote.precioKg;
export const alertasDe = (animal: AnimalOferta): Parada[] =>
  animal.paradas.filter((parada) => parada.deforestacion.alerta);

export const buscarLote = (id: string): Lote | undefined => LOTES.find((lote) => lote.id === id);

export function buscarAnimal(id: string): { lote: Lote; animal: AnimalOferta } | undefined {
  for (const lote of LOTES) {
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
