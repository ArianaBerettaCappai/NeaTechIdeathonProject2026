import type { Deforestacion, Lote, Parada } from "../types";

// Datos simulados. Las coordenadas de establecimientos salen de datos/registros_renspa_senasa_demo.csv.
// Las alertas de deforestación son SIMULADAS: reemplazar por una fuente satelital real antes de usarlas en serio.

function parada(
  tipo: string,
  lugar: Lugar,
  desde: string,
  hasta: string,
  documento: string,
  hectareasDeforestadas: number | null
): Parada {
  const deforestacion: Deforestacion = hectareasDeforestadas
    ? { alerta: true, hectareas: hectareasDeforestadas, anio: Number(desde.slice(0, 4)) }
    : { alerta: false };
  return {
    tipo,
    establecimiento: lugar.establecimiento,
    provincia: lugar.provincia,
    lat: lugar.lat,
    lng: lugar.lng,
    desde,
    hasta,
    documento,
    deforestacion,
  };
}

interface Lugar {
  establecimiento: string;
  provincia: string;
  lat: number;
  lng: number;
}

const BELLA_VISTA: Lugar = { establecimiento: "Establecimiento Bella Vista", provincia: "Corrientes", lat: -27.821291, lng: -58.08546 };
const DOCE_DE_OCTUBRE: Lugar = { establecimiento: "Establecimiento 12 de Octubre", provincia: "Chaco", lat: -26.565875, lng: -59.43027 };
const BERON: Lugar = { establecimiento: "Establecimiento Berón de Astrada", provincia: "Corrientes", lat: -28.395027, lng: -58.277081 };
const DOS_DE_ABRIL: Lugar = { establecimiento: "Establecimiento 2 de Abril", provincia: "Chaco", lat: -25.695426, lng: -60.253266 };
const BERMEJO: Lugar = { establecimiento: "Establecimiento Bermejo", provincia: "Formosa", lat: -26.000996, lng: -59.108911 };
const DOCE_ENGORDE: Lugar = { establecimiento: "Establecimiento 12 de Octubre", provincia: "Chaco", lat: -26.632669, lng: -61.724385 };
const VEINTICINCO_CRIA: Lugar = { establecimiento: "Establecimiento 25 de Mayo", provincia: "Misiones", lat: -27.127908, lng: -54.344897 };
const APOSTOLES: Lugar = { establecimiento: "Establecimiento Apóstoles", provincia: "Misiones", lat: -25.576112, lng: -55.970606 };
const VEINTICINCO_ENGORDE: Lugar = { establecimiento: "Establecimiento 25 de Mayo", provincia: "Misiones", lat: -26.957738, lng: -54.475975 };

const CAPITAL_FRIGORIFICO = { nombre: "Frigorífico Capital", lat: -27.619968, lng: -59.131006 };

export const LOTES: Lote[] = [
  {
    id: "LV-0142",
    titulo: "Novillos Angus en terminación",
    productor: "Productor López",
    provincia: "Corrientes",
    publicado: "2026-10-02",
    precioKg: 3.45,
    frigorifico: CAPITAL_FRIGORIFICO,
    animales: [
      {
        id: "AR-000201",
        categoria: "Novillo",
        sexo: "Macho",
        raza: "Aberdeen Angus",
        nacimiento: "2024-03-10",
        pesoKg: 438,
        identificacion: "electrónica",
        titular: "Productor López",
        estado_sanitario: "Aprobado",
        sanidad: [{ tipo: "Vacunación aftosa", documento: "CUIG/SENASA-2026-0481", vence: "2027-01-15" }],
        paradas: [
          parada("Cría", BELLA_VISTA, "2024-03-10", "2025-04-02", "DT-e 0101", null),
          parada("Recría", DOCE_DE_OCTUBRE, "2025-04-03", "2026-02-15", "DT-e 0118", 46),
          parada("Engorde", BERON, "2026-02-16", "2026-09-30", "DT-e 0126", null),
        ],
      },
      {
        id: "AR-000202",
        categoria: "Novillo",
        sexo: "Macho",
        raza: "Aberdeen Angus",
        nacimiento: "2024-04-02",
        pesoKg: 452,
        identificacion: "analógica (CUIG)",
        titular: "Productor López",
        estado_sanitario: "Aprobado",
        sanidad: [{ tipo: "Vacunación aftosa", documento: "CUIG/SENASA-2026-0482", vence: "2027-01-15" }],
        paradas: [
          parada("Cría", BELLA_VISTA, "2024-04-02", "2025-04-20", "DT-e 0102", null),
          parada("Recría", DOCE_DE_OCTUBRE, "2025-04-21", "2026-02-28", "DT-e 0119", 12),
          parada("Engorde", BERON, "2026-03-01", "2026-09-28", "DT-e 0127", null),
        ],
      },
      {
        id: "AR-000203",
        categoria: "Novillo",
        sexo: "Macho",
        raza: "Aberdeen Angus",
        nacimiento: "2024-02-18",
        pesoKg: 429,
        identificacion: "electrónica",
        titular: "Productor López",
        estado_sanitario: "Aprobado",
        sanidad: [{ tipo: "Vacunación aftosa", documento: "CUIG/SENASA-2026-0483", vence: "2027-01-15" }],
        paradas: [
          parada("Cría", BELLA_VISTA, "2024-02-18", "2025-03-30", "DT-e 0103", null),
          parada("Recría", DOS_DE_ABRIL, "2025-03-31", "2026-02-10", "DT-e 0120", 88),
          parada("Engorde", BERON, "2026-02-11", "2026-09-29", "DT-e 0128", 31),
        ],
      },
    ],
  },
  {
    id: "LV-0143",
    titulo: "Vaquillonas Hereford de recría",
    productor: "Productor Gómez",
    provincia: "Chaco",
    publicado: "2026-10-09",
    precioKg: 3.2,
    frigorifico: { nombre: "Frigorífico Formosa", lat: -24.365795, lng: -62.043876 },
    animales: [
      {
        id: "AR-000210",
        categoria: "Vaquillona",
        sexo: "Hembra",
        raza: "Hereford",
        nacimiento: "2024-05-20",
        pesoKg: 341,
        identificacion: "electrónica",
        titular: "Productor Gómez",
        estado_sanitario: "Aprobado",
        sanidad: [{ tipo: "Vacunación aftosa", documento: "CUIG/SENASA-2026-0590", vence: "2027-02-02" }],
        paradas: [
          parada("Cría", DOS_DE_ABRIL, "2024-05-20", "2025-06-01", "DT-e 0201", null),
          parada("Recría", BERMEJO, "2025-06-02", "2026-03-10", "DT-e 0214", 120),
          parada("Engorde", DOCE_ENGORDE, "2026-03-11", "2026-09-20", "DT-e 0230", null),
        ],
      },
      {
        id: "AR-000211",
        categoria: "Vaquillona",
        sexo: "Hembra",
        raza: "Hereford",
        nacimiento: "2024-06-03",
        pesoKg: 352,
        identificacion: "analógica (CUIG)",
        titular: "Productor Gómez",
        estado_sanitario: "Aprobado",
        sanidad: [{ tipo: "Vacunación aftosa", documento: "CUIG/SENASA-2026-0591", vence: "2027-02-02" }],
        paradas: [
          parada("Cría", DOS_DE_ABRIL, "2024-06-03", "2025-06-18", "DT-e 0202", null),
          parada("Recría", BERMEJO, "2025-06-19", "2026-03-02", "DT-e 0215", null),
          parada("Engorde", DOCE_ENGORDE, "2026-03-03", "2026-09-18", "DT-e 0231", 27),
        ],
      },
      {
        id: "AR-000212",
        categoria: "Vaquillona",
        sexo: "Hembra",
        raza: "Hereford",
        nacimiento: "2024-07-14",
        pesoKg: 329,
        identificacion: "electrónica",
        titular: "Productor Gómez",
        estado_sanitario: "Aprobado",
        sanidad: [{ tipo: "Vacunación aftosa", documento: "CUIG/SENASA-2026-0592", vence: "2027-02-02" }],
        paradas: [
          parada("Cría", DOS_DE_ABRIL, "2024-07-14", "2025-07-29", "DT-e 0203", null),
          parada("Recría", BERMEJO, "2025-07-30", "2026-03-21", "DT-e 0216", null),
          parada("Engorde", DOCE_ENGORDE, "2026-03-22", "2026-09-22", "DT-e 0232", null),
        ],
      },
    ],
  },
  {
    id: "LV-0144",
    titulo: "Terneros Angus colorado",
    productor: "Productor Benítez",
    provincia: "Misiones",
    publicado: "2026-10-14",
    precioKg: 3.6,
    frigorifico: CAPITAL_FRIGORIFICO,
    animales: [
      {
        id: "AR-000220",
        categoria: "Ternero",
        sexo: "Macho",
        raza: "Angus colorado",
        nacimiento: "2025-08-05",
        pesoKg: 201,
        identificacion: "electrónica",
        titular: "Productor Benítez",
        estado_sanitario: "Aprobado",
        sanidad: [{ tipo: "Vacunación aftosa", documento: "CUIG/SENASA-2026-0712", vence: "2027-03-10" }],
        paradas: [
          parada("Cría", VEINTICINCO_CRIA, "2025-08-05", "2026-03-20", "DT-e 0301", null),
          parada("Recría", APOSTOLES, "2026-03-21", "2026-08-30", "DT-e 0310", 64),
          parada("Engorde", VEINTICINCO_ENGORDE, "2026-08-31", "2026-10-08", "DT-e 0322", null),
        ],
      },
      {
        id: "AR-000221",
        categoria: "Ternero",
        sexo: "Macho",
        raza: "Angus colorado",
        nacimiento: "2025-08-19",
        pesoKg: 196,
        identificacion: "analógica (CUIG)",
        titular: "Productor Benítez",
        estado_sanitario: "Aprobado",
        sanidad: [{ tipo: "Vacunación aftosa", documento: "CUIG/SENASA-2026-0713", vence: "2027-03-10" }],
        paradas: [
          parada("Cría", VEINTICINCO_CRIA, "2025-08-19", "2026-03-24", "DT-e 0302", null),
          parada("Recría", APOSTOLES, "2026-03-25", "2026-09-01", "DT-e 0311", null),
          parada("Engorde", VEINTICINCO_ENGORDE, "2026-09-02", "2026-10-08", "DT-e 0323", 9),
        ],
      },
      {
        id: "AR-000222",
        categoria: "Ternero",
        sexo: "Macho",
        raza: "Angus colorado",
        nacimiento: "2025-09-02",
        pesoKg: 188,
        identificacion: "electrónica",
        titular: "Productor Benítez",
        estado_sanitario: "Aprobado",
        sanidad: [{ tipo: "Vacunación aftosa", documento: "CUIG/SENASA-2026-0714", vence: "2027-03-10" }],
        paradas: [
          parada("Cría", VEINTICINCO_CRIA, "2025-09-02", "2026-03-28", "DT-e 0303", null),
          parada("Recría", APOSTOLES, "2026-03-29", "2026-09-05", "DT-e 0312", 150),
          parada("Engorde", VEINTICINCO_ENGORDE, "2026-09-06", "2026-10-08", "DT-e 0324", null),
        ],
      },
    ],
  },
];
