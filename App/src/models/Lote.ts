export type PublicarLoteInput = {
  productorCuit: string;
  animalCodigos: string[];
  precioPorKg: number;
};

export interface LotePublicado {
  id: string;
  productorCuit: string;
  precioPorKg: number;
  animales: { animalCodigo: string; pesoKg: number; esAptoUe: boolean }[];
  pesoTotalKg: number;
  montoTotal: number;
  publicadoAt: string;
}

// Un animal es apto para exportar a la UE solo si su estado sanitario es "Aprobado".
export function esAptoUe(estadoSanitario: string): boolean {
  return estadoSanitario === "Aprobado";
}
