export type PublicarLoteInput = {
  titulo: string;
  productorCuit: string;
  animalCodigos: string[];
  precioPorKg: number;
};

export interface LotePublicado {
  id: string;
  titulo: string;
  productorCuit: string;
  precioPorKg: number;
  animales: { animalCodigo: string; pesoKg: number; esAptoUe: boolean }[];
  pesoTotalKg: number;
  montoTotal: number;
  publicadoAt: string;
  imagenUrl: string | null;
}

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

// Un animal es apto para exportar a la UE solo si su estado sanitario es "Aprobado".
export function esAptoUe(estadoSanitario: string): boolean {
  return estadoSanitario === "Aprobado";
}
