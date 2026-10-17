import { useCallback, useEffect, useState } from "react";
import type { AnimalOferta, Deforestacion, Lote, Parada, ProductorRodeo } from "../types";
import { pedirImagenes, pedirLotesPublicados, type LotePublicado } from "./ofertasApi";

// Datos de SENASA simulados que sirve el backend (App/): GET /api/senasa/dataset.
// Solo se tipan los campos que usa el frontend.
export interface DatasetSenasa {
  productores: { id: string; cuit: string; nombre: string; provincia: string }[];
  establecimientos: { renspa: string; nombre: string; provincia: string; habilitadoUe: boolean }[];
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
    motivoObservacion: string | null;
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

// Lotes de la portada y de las ofertas, más el rodeo completo de cada productor.
export interface DatosOfertas {
  lotes: Lote[];
  productores: ProductorRodeo[];
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

// Convierte el dataset de SENASA en lotes del mock y en el rodeo completo de cada productor.
function adaptarDataset(datos: DatasetSenasa): DatosOfertas {
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

  // Cada tramo se guarda con su RENSPA para poder chequear la habilitación UE del campo.
  const tramosDe = (animal: DatasetSenasa["animales"][number]): { renspa: string; parada: Parada }[] => {
    const tramos = [
      {
        renspa: animal.establecimientoNacimientoRenspa,
        parada: paradaDe("Nacimiento y cría", animal.establecimientoNacimientoRenspa, animal.fechaNacimiento, animal.fechaIdentificacion, animal.caravana),
      },
      ...datos.dtes
        .filter((dte) => dte.destinoTipo === "ESTABLECIMIENTO" && dte.animalesIds.includes(animal.animalCodigo))
        .map((dte) => ({
          renspa: dte.destinoId,
          parada: paradaDe(formatearMotivo(dte.motivo), dte.destinoId, dte.fechaEmision, dte.fechaCierre, dte.id),
        })),
    ];
    return tramos
      .filter((tramo): tramo is { renspa: string; parada: Parada } => tramo.parada !== null)
      .sort((a, b) => a.parada.desde.localeCompare(b.parada.desde));
  };

  // Motivos concretos por los que el animal no puede exportarse a la UE.
  const motivosDe = (animal: DatasetSenasa["animales"][number], tramos: { renspa: string; parada: Parada }[]): string[] => {
    const motivos: string[] = [];
    if (animal.estadoSanitario !== "Aprobado") {
      motivos.push(animal.motivoObservacion ?? `Estado sanitario ${animal.estadoSanitario.toLowerCase()}`);
    }
    for (const { renspa, parada } of tramos) {
      if (parada.deforestacion.alerta) {
        motivos.push(
          `Deforestación registrada antes del corte EUDR en ${parada.establecimiento} (${parada.deforestacion.hectareas} ha)`
        );
      }
      const establecimiento = establecimientoDe(renspa);
      if (establecimiento && !establecimiento.habilitadoUe) {
        motivos.push(`${establecimiento.nombre} no está habilitado para exportar a la UE`);
      }
    }
    return motivos;
  };

  const animalDe = (animal: DatasetSenasa["animales"][number]): AnimalOferta => {
    const tramos = tramosDe(animal);
    return {
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
      paradas: tramos.map((tramo) => tramo.parada),
      motivosNoExportable: motivosDe(animal, tramos),
    };
  };

  const porCodigo = new Map(
    datos.animales.map((animal) => [animal.animalCodigo, { productorId: animal.productorId, animal: animalDe(animal) }] as const)
  );

  const productores: ProductorRodeo[] = datos.productores.map((productor) => ({
    cuit: productor.cuit,
    nombre: productor.nombre,
    provincia: productor.provincia,
    animales: [...porCodigo.values()].filter((entrada) => entrada.productorId === productor.id).map((entrada) => entrada.animal),
  }));

  const lotes: Lote[] = datos.lotes.map((loteFaena) => {
    const entradas = loteFaena.animalesIds.flatMap((codigo) => porCodigo.get(codigo) ?? []);
    const productor = datos.productores.find((p) => p.id === entradas[0]?.productorId);
    const frigorifico = datos.frigorificos.find((f) => f.id === loteFaena.frigorificoId);
    return {
      id: loteFaena.id,
      titulo: loteFaena.producto,
      productor: productor?.nombre ?? "Sin productor",
      productorCuit: productor?.cuit ?? "",
      provincia: productor?.provincia ?? frigorifico?.provincia ?? "",
      publicado: loteFaena.fechaFaena,
      precioKg: PRECIO_KG_PROVISORIO,
      frigorifico: {
        nombre: frigorifico?.nombre ?? "Frigorífico sin nombre",
        ...UBICACION_FRIGORIFICO_PROVISORIA,
      },
      animales: entradas.map((entrada) => entrada.animal),
    };
  });

  return { lotes, productores };
}

const soloDigitos = (cuit: string) => cuit.replace(/\D/g, "");

// Un lote publicado por un vendedor: sus animales salen del dataset, por código.
function adaptarLotePublicado(
  publicado: LotePublicado,
  datos: DatosOfertas,
  animalesPorCodigo: Map<string, AnimalOferta>
): Lote | null {
  const animales = publicado.animales.flatMap(({ animalCodigo }) => animalesPorCodigo.get(animalCodigo) ?? []);
  if (!animales.length) return null;
  const productor = datos.productores.find((p) => soloDigitos(p.cuit) === soloDigitos(publicado.productorCuit));
  return {
    id: publicado.id,
    titulo: publicado.titulo,
    productor: productor?.nombre ?? "Productor sin registrar",
    productorCuit: publicado.productorCuit,
    provincia: productor?.provincia ?? "",
    publicado: publicado.publicadoAt.slice(0, 10), // AAAA-MM-DD, como los lotes del mock
    precioKg: publicado.precioPorKg,
    frigorifico: { nombre: "Frigorífico a definir", ...UBICACION_FRIGORIFICO_PROVISORIA },
    animales,
    imagenUrl: publicado.imagenUrl ?? undefined,
  };
}

async function pedirDataset(): Promise<DatasetSenasa> {
  const respuesta = await fetch("/api/senasa/dataset");
  if (!respuesta.ok) throw new Error("No se pudieron cargar los datos de SENASA.");
  return (await respuesta.json()) as DatasetSenasa;
}

function combinar(dataset: DatasetSenasa, publicados: LotePublicado[], imagenes: Record<string, string>): DatosOfertas {
  const datos = adaptarDataset(dataset);
  const animalesPorCodigo = new Map(
    datos.productores.flatMap((productor) => productor.animales).map((animal) => [animal.id, animal] as const)
  );
  const lotesPublicados = publicados.flatMap((publicado) => adaptarLotePublicado(publicado, datos, animalesPorCodigo) ?? []);
  const lotes = [...datos.lotes, ...lotesPublicados].map((lote) =>
    imagenes[lote.id] ? { ...lote, imagenUrl: imagenes[lote.id] } : lote
  );
  return { lotes, productores: datos.productores };
}

// Una sola pedida al backend por sesión de página: las páginas comparten el mismo resultado.
let pedidoDatos: Promise<DatosOfertas> | undefined;

function cargarDatos(): Promise<DatosOfertas> {
  pedidoDatos ??= Promise.all([
    pedirDataset(),
    pedirLotesPublicados(),
    pedirImagenes().catch((): Record<string, string> => ({})), // las imágenes son opcionales: sin ellas los lotes igual se muestran
  ])
    .then(([dataset, publicados, imagenes]) => combinar(dataset, publicados, imagenes))
    .catch((error: unknown) => {
      pedidoDatos = undefined; // permite reintentar en la próxima visita
      throw error instanceof Error
        ? new Error(`${error.message} Verificá que el backend esté corriendo en el puerto 3000.`)
        : error;
    });
  return pedidoDatos;
}

// Tras publicar una oferta o cambiar una imagen, la próxima lectura vuelve a pedir los datos.
export function invalidarLotes(): void {
  pedidoDatos = undefined;
}

export function useLotes(): { lotes?: Lote[]; productores?: ProductorRodeo[]; error?: string; recargar: () => void } {
  const [version, setVersion] = useState(0);
  const [estado, setEstado] = useState<{ datos?: DatosOfertas; error?: string }>({});

  useEffect(() => {
    let activo = true;
    cargarDatos()
      .then((datos) => activo && setEstado({ datos }))
      .catch((error: Error) => activo && setEstado({ error: error.message }));
    return () => {
      activo = false;
    };
  }, [version]);

  const recargar = useCallback(() => {
    invalidarLotes();
    setVersion((valor) => valor + 1);
  }, []);

  return { lotes: estado.datos?.lotes, productores: estado.datos?.productores, error: estado.error, recargar };
}
