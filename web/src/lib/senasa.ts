import { useEffect, useState } from "react";
import type { AnimalOferta, Deforestacion, Lote, Parada } from "../types";

// Datos de SENASA simulados que sirve el backend (App/): GET /api/senasa/dataset.
// Solo se tipan los campos que usa el frontend.
export interface DatasetSenasa {
  productores: { id: string; nombre: string; provincia: string }[];
  establecimientos: { renspa: string; nombre: string; provincia: string }[];
  frigorificos: { id: string; nombre: string; localidad: string; provincia: string }[];
  parcelas: {
    renspa: string;
    centroLat: number;
    centroLng: number;
    poligono: [number, number][];
    zonaDeforestadaPre2020: boolean;
    fechaCorteEudr: string;
  }[];
  animales: {
    animalCodigo: string;
    productorId: string;
    caravana: string;
    sexo: "M" | "H";
    categoria: string;
    raza: string;
    pesoKg: number;
    estadoSanitario: string;
    fechaNacimiento: string;
    fechaIdentificacion: string;
    establecimientoNacimientoRenspa: string;
  }[];
  dtes: {
    id: string;
    destinoTipo: "ESTABLECIMIENTO" | "FRIGORIFICO";
    destinoId: string;
    fechaEmision: string;
    fechaCierre: string;
    motivo: string;
    animalesIds: string[];
  }[];
  lotes: {
    id: string;
    frigorificoId: string;
    fechaFaena: string;
    producto: string;
    animalesIds: string[];
  }[];
}

// El mock de SENASA no trae precio ni coordenadas del frigorífico. Estos valores son provisorios
// hasta que existan en la fuente de datos.
const PRECIO_KG_PROVISORIO = 3.45;
const UBICACION_FRIGORIFICO_PROVISORIA = { lat: -29.1433, lng: -59.265 }; // Goya, Corrientes (aprox.)

const CUADRO_SEXO: Record<string, string> = { M: "Macho", H: "Hembra" };

const KM_POR_GRADO_LAT = 111;

// Superficie aproximada de un polígono [lat, lng], en hectáreas (proyección local simple).
function superficieHa(poligono: [number, number][]): number {
  if (poligono.length < 3) return 0;
  const kmPorGradoLng = KM_POR_GRADO_LAT * Math.cos((poligono[0][0] * Math.PI) / 180);
  const puntos = poligono.map(([lat, lng]) => [lng * kmPorGradoLng, lat * KM_POR_GRADO_LAT] as const);
  let doble = 0;
  for (let i = 0; i < puntos.length; i++) {
    const [x1, y1] = puntos[i];
    const [x2, y2] = puntos[(i + 1) % puntos.length];
    doble += x1 * y2 - x2 * y1;
  }
  return (Math.abs(doble) / 2) * 100; // km² → ha
}

const formatearMotivo = (motivo: string): string => {
  const texto = motivo.replace(/_/g, " ").toLowerCase();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

// Convierte el dataset de SENASA en la forma de lotes que usan las páginas de ofertas.
export function adaptarDataset(datos: DatasetSenasa): Lote[] {
  const parcelaDe = (renspa: string) => datos.parcelas.find((parcela) => parcela.renspa === renspa);
  const establecimientoDe = (renspa: string) => datos.establecimientos.find((est) => est.renspa === renspa);

  // Un tramo del recorrido: el establecimiento donde estuvo el animal, con su alerta de deforestación.
  const paradaDe = (
    tipo: string,
    renspa: string,
    desde: string,
    hasta: string,
    documento: string
  ): Parada | null => {
    const parcela = parcelaDe(renspa);
    const establecimiento = establecimientoDe(renspa);
    if (!parcela || !establecimiento) return null;
    const deforestacion: Deforestacion = parcela.zonaDeforestadaPre2020
      ? {
          alerta: true,
          hectareas: Math.round(superficieHa(parcela.poligono)),
          anio: Number(parcela.fechaCorteEudr.slice(0, 4)), // año del corte EUDR
        }
      : { alerta: false };
    return {
      tipo,
      establecimiento: establecimiento.nombre,
      provincia: establecimiento.provincia,
      lat: parcela.centroLat,
      lng: parcela.centroLng,
      desde,
      hasta,
      documento,
      deforestacion,
    };
  };

  const paradasDe = (animal: DatasetSenasa["animales"][number]): Parada[] => {
    const nacimiento = paradaDe(
      "Nacimiento y cría",
      animal.establecimientoNacimientoRenspa,
      animal.fechaNacimiento,
      animal.fechaIdentificacion,
      animal.caravana
    );
    const movimientos = datos.dtes
      .filter((dte) => dte.destinoTipo === "ESTABLECIMIENTO" && dte.animalesIds.includes(animal.animalCodigo))
      .map((dte) => paradaDe(formatearMotivo(dte.motivo), dte.destinoId, dte.fechaEmision, dte.fechaCierre, dte.id));
    return [nacimiento, ...movimientos]
      .filter((parada): parada is Parada => parada !== null)
      .sort((a, b) => a.desde.localeCompare(b.desde));
  };

  return datos.lotes.map((loteFaena) => {
    const animalesLote = loteFaena.animalesIds
      .map((codigo) => datos.animales.find((animal) => animal.animalCodigo === codigo))
      .filter((animal): animal is DatasetSenasa["animales"][number] => animal !== undefined);
    const productor = datos.productores.find((p) => p.id === animalesLote[0]?.productorId);
    const frigorifico = datos.frigorificos.find((f) => f.id === loteFaena.frigorificoId);

    const animales: AnimalOferta[] = animalesLote.map((animal) => ({
      id: animal.animalCodigo,
      categoria: animal.categoria,
      sexo: CUADRO_SEXO[animal.sexo] ?? animal.sexo,
      raza: animal.raza,
      nacimiento: animal.fechaNacimiento,
      pesoKg: animal.pesoKg,
      identificacion: animal.caravana,
      titular: datos.productores.find((p) => p.id === animal.productorId)?.nombre ?? "Sin titular",
      estado_sanitario: animal.estadoSanitario,
      sanidad: [], // el mock no trae documentos sanitarios
      paradas: paradasDe(animal),
    }));

    return {
      id: loteFaena.id,
      titulo: loteFaena.producto,
      productor: productor?.nombre ?? "Sin productor",
      provincia: productor?.provincia ?? frigorifico?.provincia ?? "",
      publicado: loteFaena.fechaFaena,
      precioKg: PRECIO_KG_PROVISORIO,
      frigorifico: {
        nombre: frigorifico?.nombre ?? "Frigorífico sin nombre",
        ...UBICACION_FRIGORIFICO_PROVISORIA,
      },
      animales,
    };
  });
}

// Una sola pedida al backend por sesión de página: las páginas comparten el mismo resultado.
let pedidoLotes: Promise<Lote[]> | undefined;

export function cargarLotes(): Promise<Lote[]> {
  pedidoLotes ??= fetch("/api/senasa/dataset")
    .then(async (respuesta) => {
      if (!respuesta.ok) throw new Error("No se pudieron cargar los datos de SENASA.");
      return adaptarDataset((await respuesta.json()) as DatasetSenasa);
    })
    .catch((error: unknown) => {
      pedidoLotes = undefined; // permite reintentar en la próxima visita
      throw error instanceof Error
        ? new Error(`${error.message} Verificá que el backend esté corriendo en el puerto 3000.`)
        : error;
    });
  return pedidoLotes;
}

export function useLotes(): { lotes?: Lote[]; error?: string } {
  const [estado, setEstado] = useState<{ lotes?: Lote[]; error?: string }>({});

  useEffect(() => {
    let activo = true;
    cargarLotes()
      .then((lotes) => activo && setEstado({ lotes }))
      .catch((error: Error) => activo && setEstado({ error: error.message }));
    return () => {
      activo = false;
    };
  }, []);

  return estado;
}
