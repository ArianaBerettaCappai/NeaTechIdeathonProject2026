// Tipos compartidos por la portada, las ofertas y el acceso.

export type Nivel = "ok" | "warn" | "bad" | "neutral";

export type Deforestacion =
  | { alerta: false }
  | { alerta: true; hectareas: number; anio: number };

export interface Parada {
  tipo: string;
  establecimiento: string;
  provincia: string;
  lat: number;
  lng: number;
  desde: string;
  hasta: string;
  documento: string;
  deforestacion: Deforestacion;
}

export interface DocumentoSanitario {
  tipo: string;
  documento: string;
  vence: string;
}

export interface AnimalOferta {
  id: string;
  categoria: string;
  sexo: string;
  raza: string;
  nacimiento: string;
  pesoKg: number;
  identificacion: string;
  titular: string;
  estado_sanitario: string;
  sanidad: DocumentoSanitario[];
  paradas: Parada[];
  // Lo que impide exportar al animal a la UE. Vacío = exportable.
  motivosNoExportable: string[];
}

export interface Lote {
  id: string;
  titulo: string;
  productor: string;
  provincia: string;
  publicado: string;
  precioKg: number;
  frigorifico: { nombre: string; lat: number; lng: number };
  animales: AnimalOferta[];
}
