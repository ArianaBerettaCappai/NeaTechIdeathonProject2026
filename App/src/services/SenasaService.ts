import {
  ANIMALES_MOCK,
  buildMockSyncForCuit,
  CUIT_ALIASES,
  DTES,
  ESTABLECIMIENTOS,
  FRIGORIFICOS,
  LOTES,
  normalizeCuit,
  PARCELAS,
  PRODUCTORES,
} from "../data/senasaMockData";
import {
  AnimalSincronizado,
  Establecimiento,
  Frigorifico,
  LoteFaena,
  MovimientoDte,
  Parcela,
  Productor,
  SenasaSyncResult,
} from "../models/Senasa";
import { SenasaRepository } from "../repositories/SenasaRepository";
import { AuthError } from "./AuthError";

export interface DatasetOverview {
  productores: Productor[];
  establecimientos: Establecimiento[];
  frigorificos: Frigorifico[];
  parcelas: Parcela[];
  animales: AnimalSincronizado[];
  dtes: MovimientoDte[];
  lotes: LoteFaena[];
  aliasesCuit: Record<string, string>;
}

export class SenasaService {
  constructor(private readonly senasaRepository: SenasaRepository) {}

  async syncByCuit(cuitInput: string): Promise<SenasaSyncResult> {
    const normalizedCuit = normalizeCuit(cuitInput);
    const mockResult = buildMockSyncForCuit(normalizedCuit);

    if (!mockResult) {
      const validCuits = [
        ...PRODUCTORES.map((p) => p.cuit),
        ...Object.keys(CUIT_ALIASES),
      ].join(", ");
      throw new AuthError(
        `No se encontraron registros simulados en SENASA para el CUIT ${normalizedCuit}. CUITs disponibles para la demo: ${validCuits}.`,
        404
      );
    }

    const saved = await this.senasaRepository.saveAnimalsForProducer(
      mockResult.productor,
      mockResult.establecimientos,
      mockResult.animales
    );

    const animales = saved.animales;
    const totalAnimales = animales.length;
    const aptos = animales.filter((a) => a.estadoSanitario === "Aprobado").length;
    const observados = animales.filter(
      (a) => a.estadoSanitario === "Observado"
    ).length;
    const conAlertaDeforestacionPre2020 = animales.filter(
      (a) => a.geolocalizacionCrianza.zonaDeforestadaPre2020
    ).length;

    return {
      productor: mockResult.productor,
      establecimientos: mockResult.establecimientos,
      animales,
      resumen: {
        totalAnimales,
        aptos,
        observados,
        conAlertaDeforestacionPre2020,
        flujoDemo:
          observados > 0 || conAlertaDeforestacionPre2020 > 0
            ? "negativo_observado"
            : "positivo",
      },
      persistencia: saved.persistencia,
      syncedAt: mockResult.syncedAt,
    };
  }

  async getAnimalsByCuit(cuitInput?: string): Promise<{
    cuit?: string;
    productor?: Productor;
    establecimientos?: Establecimiento[];
    animales: AnimalSincronizado[];
    totalAnimales: number;
    aptos: number;
    observados: number;
    conAlertaDeforestacionPre2020: number;
  }> {
    if (!cuitInput || !cuitInput.trim()) {
      const synced = await this.senasaRepository.listAllSyncedAnimals();
      const animales = synced.length > 0 ? synced : ANIMALES_MOCK;
      return {
        animales,
        totalAnimales: animales.length,
        aptos: animales.filter((a) => a.estadoSanitario === "Aprobado").length,
        observados: animales.filter((a) => a.estadoSanitario === "Observado")
          .length,
        conAlertaDeforestacionPre2020: animales.filter(
          (a) => a.geolocalizacionCrianza.zonaDeforestadaPre2020
        ).length,
      };
    }

    const normalized = normalizeCuit(cuitInput);
    const canonical = CUIT_ALIASES[normalized] ?? normalized;
    const targetProductor = PRODUCTORES.find((p) => p.cuit === canonical);

    if (!targetProductor) {
      throw new AuthError(
        `Productor con CUIT ${normalized} no encontrado en el padrón SENASA simulado.`,
        404
      );
    }

    let animales = await this.senasaRepository.findAnimalsByCuit(normalized);
    if (animales.length === 0) {
      // Si aun no fue sincronizado explicitamente, sincronizamos y persistimos automaticamente
      const syncResult = await this.syncByCuit(normalized);
      animales = syncResult.animales;
    }

    const productor: Productor = {
      ...targetProductor,
      cuit: normalized,
    };
    const establecimientos = ESTABLECIMIENTOS.filter(
      (e) => e.productorId === targetProductor.id
    );

    return {
      cuit: normalized,
      productor,
      establecimientos,
      animales,
      totalAnimales: animales.length,
      aptos: animales.filter((a) => a.estadoSanitario === "Aprobado").length,
      observados: animales.filter((a) => a.estadoSanitario === "Observado")
        .length,
      conAlertaDeforestacionPre2020: animales.filter(
        (a) => a.geolocalizacionCrianza.zonaDeforestadaPre2020
      ).length,
    };
  }

  listProductoresMock(): Productor[] {
    return PRODUCTORES;
  }

  listEstablecimientosMock(): Establecimiento[] {
    return ESTABLECIMIENTOS;
  }

  listLotesMock(): LoteFaena[] {
    return LOTES;
  }

  getDatasetOverview(): DatasetOverview {
    return {
      productores: PRODUCTORES,
      establecimientos: ESTABLECIMIENTOS,
      frigorificos: FRIGORIFICOS,
      parcelas: PARCELAS,
      animales: ANIMALES_MOCK,
      dtes: DTES,
      lotes: LOTES,
      aliasesCuit: CUIT_ALIASES,
    };
  }
}
