export type EstadoSanitario = "Aprobado" | "Observado";
export type TipoIdentificacion = "RFID" | "ANALOGICA";

export interface Productor {
  id: string;
  cuit: string;
  nombre: string;
  provincia: string;
}

export interface Establecimiento {
  renspa: string;
  productorId: string;
  nombre: string;
  provincia: string;
  departamento: string;
  localidad: string;
  actividad: string;
  supDeclaradaHa: number;
  habilitadoUe: boolean;
  fechaAlta: string;
}

export interface Parcela {
  id: string;
  renspa: string;
  centroLat: number;
  centroLng: number;
  escala: number;
  metodo: "AGRIMENSOR" | "PRODUCTOR_DIBUJO";
  nivelConfianza: "registrado" | "declarado";
  poligono: [number, number][];
  zonaDeforestadaPre2020: boolean;
  fechaCorteEudr: string;
}

export interface GeolocalizacionAnimal {
  latitud: number;
  longitud: number;
  establecimientoRenspa: string;
  establecimientoNombre: string;
  provincia: string;
  departamento: string;
  localidad: string;
  parcelaId: string;
  poligono: [number, number][];
  metodoGeolocalizacion: "AGRIMENSOR" | "PRODUCTOR_DIBUJO";
  confianzaGeolocalizacion: "registrado" | "declarado";
  dentroDePoligono: boolean;
  zonaDeforestadaPre2020: boolean;
  fechaCorteEudr: string;
  nivelRiesgoEudr: "bajo" | "alto_observado";
  detalleAmbiental: string;
}

export interface MovimientoDte {
  id: string;
  origenRenspa: string;
  destinoTipo: "ESTABLECIMIENTO" | "FRIGORIFICO";
  destinoId: string;
  fechaEmision: string;
  fechaCierre: string;
  motivo: string;
  animalesIds: string[];
}

export interface Frigorifico {
  id: string;
  nombre: string;
  codigo: string;
  localidad: string;
  provincia: string;
  habilitadoUe: boolean;
  vigenciaHasta: string;
}

export interface LoteFaena {
  id: string;
  frigorificoId: string;
  fechaFaena: string;
  cantidadAnimales: number;
  producto: string;
  destino: string;
  animalesIds: string[];
}

export interface VacunaAnimal {
  nombre: string;
  fechaAplicacion: string;
  vencimiento: string;
  lote: string;
}

export interface AnimalSincronizado {
  id: string;
  animalCodigo: string;
  productorId: string;
  productorCuit: string;
  caravana: string;
  tipoIdentificacion: TipoIdentificacion;
  sexo: "M" | "H";
  categoria: string;
  raza: string;
  peso: number;
  pesoKg: number;
  estadoSanitario: EstadoSanitario;
  motivoObservacion: string | null;
  fechaNacimiento: string;
  establecimientoNacimientoRenspa: string;
  establecimientoActualRenspa: string;
  fechaIdentificacion: string;
  geolocalizacionCrianza: GeolocalizacionAnimal;
  movimientosIds: string[];
  loteId: string | null;
  vacunas?: VacunaAnimal[];
  syncedAt: string;
}

export interface SenasaSyncResult {
  productor: Productor;
  establecimientos: Establecimiento[];
  animales: AnimalSincronizado[];
  resumen: {
    totalAnimales: number;
    aptos: number;
    observados: number;
    conAlertaDeforestacionPre2020: number;
    flujoDemo: "positivo" | "negativo_observado";
  };
  persistencia: "supabase" | "memory_fallback";
  syncedAt: string;
}
