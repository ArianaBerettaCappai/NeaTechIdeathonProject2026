import { SupabaseClient } from "@supabase/supabase-js";
import { CUIT_ALIASES, normalizeCuit } from "../data/senasaMockData";
import {
  AnimalSincronizado,
  Establecimiento,
  EstadoSanitario,
  GeolocalizacionAnimal,
  Productor,
  TipoIdentificacion,
} from "../models/Senasa";
import {
  SaveProducerAnimalsResult,
  SenasaRepository,
} from "./SenasaRepository";

interface SenasaAnimalRow {
  id: string;
  animal_codigo: string;
  productor_id: string;
  productor_cuit: string;
  caravana: string;
  tipo_identificacion: TipoIdentificacion;
  sexo: "M" | "H";
  categoria: string;
  raza: string;
  peso_kg: number | string;
  estado_sanitario: EstadoSanitario;
  motivo_observacion: string | null;
  fecha_nacimiento: string;
  establecimiento_nacimiento_renspa: string;
  establecimiento_actual_renspa: string;
  fecha_identificacion: string;
  geolocalizacion_crianza: GeolocalizacionAnimal;
  movimientos_ids: string[];
  lote_id: string | null;
  synced_at: string;
}

function rowToAnimal(row: SenasaAnimalRow): AnimalSincronizado {
  const pesoNum = Number(row.peso_kg);
  return {
    id: row.id,
    animalCodigo: row.animal_codigo,
    productorId: row.productor_id,
    productorCuit: row.productor_cuit,
    caravana: row.caravana,
    tipoIdentificacion: row.tipo_identificacion,
    sexo: row.sexo,
    categoria: row.categoria,
    raza: row.raza,
    peso: pesoNum,
    pesoKg: pesoNum,
    estadoSanitario: row.estado_sanitario,
    motivoObservacion: row.motivo_observacion,
    fechaNacimiento: row.fecha_nacimiento,
    establecimientoNacimientoRenspa: row.establecimiento_nacimiento_renspa,
    establecimientoActualRenspa: row.establecimiento_actual_renspa,
    fechaIdentificacion: row.fecha_identificacion,
    geolocalizacionCrianza: row.geolocalizacion_crianza,
    movimientosIds: Array.isArray(row.movimientos_ids)
      ? row.movimientos_ids
      : [],
    loteId: row.lote_id,
    syncedAt: row.synced_at,
  };
}

export class SupabaseSenasaRepository implements SenasaRepository {
  private readonly memoryAnimalsByCuit = new Map<string, AnimalSincronizado[]>();
  private readonly memoryAnimalsByProducerId = new Map<
    string,
    AnimalSincronizado[]
  >();
  private readonly memoryProducersByCuit = new Map<
    string,
    { productor: Productor; establecimientos: Establecimiento[] }
  >();

  constructor(private readonly client: SupabaseClient | null) {}

  private saveToMemory(
    productor: Productor,
    establecimientos: Establecimiento[],
    animales: AnimalSincronizado[]
  ): SaveProducerAnimalsResult {
    const normalizedCuit = normalizeCuit(productor.cuit);
    const canonicalCuit = CUIT_ALIASES[normalizedCuit] ?? normalizedCuit;

    const cloned = animales.map((a) => ({ ...a }));
    this.memoryProducersByCuit.set(normalizedCuit, {
      productor: { ...productor, cuit: normalizedCuit },
      establecimientos: [...establecimientos],
    });
    this.memoryAnimalsByCuit.set(normalizedCuit, cloned);
    if (canonicalCuit !== normalizedCuit && !this.memoryAnimalsByCuit.has(canonicalCuit)) {
      this.memoryAnimalsByCuit.set(
        canonicalCuit,
        cloned.map((a) => ({ ...a, productorCuit: canonicalCuit }))
      );
    }
    this.memoryAnimalsByProducerId.set(productor.id, cloned);

    return {
      animales: cloned,
      persistencia: "memory_fallback",
    };
  }

  async saveAnimalsForProducer(
    productor: Productor,
    establecimientos: Establecimiento[],
    animales: AnimalSincronizado[]
  ): Promise<SaveProducerAnimalsResult> {
    // Siempre guardamos una copia en memoria para lecturas rapidas o fallback
    this.saveToMemory(productor, establecimientos, animales);

    if (!this.client) {
      return {
        animales,
        persistencia: "memory_fallback",
      };
    }

    try {
      const syncedAt = new Date().toISOString();

      const { error: prodError } = await this.client
        .from("senasa_productores")
        .upsert(
          {
            id: productor.id,
            cuit: normalizeCuit(productor.cuit),
            nombre: productor.nombre,
            provincia: productor.provincia,
            establecimientos,
            synced_at: syncedAt,
          },
          { onConflict: "id" }
        );

      if (prodError) {
        return {
          animales,
          persistencia: "memory_fallback",
        };
      }

      if (animales.length === 0) {
        return {
          animales: [],
          persistencia: "supabase",
        };
      }

      const rowsToUpsert = animales.map((a) => ({
        animal_codigo: a.animalCodigo,
        productor_id: productor.id,
        productor_cuit: normalizeCuit(productor.cuit),
        caravana: a.caravana,
        tipo_identificacion: a.tipoIdentificacion,
        sexo: a.sexo,
        categoria: a.categoria,
        raza: a.raza,
        peso_kg: a.pesoKg,
        estado_sanitario: a.estadoSanitario,
        motivo_observacion: a.motivoObservacion,
        fecha_nacimiento: a.fechaNacimiento,
        establecimiento_nacimiento_renspa: a.establecimientoNacimientoRenspa,
        establecimiento_actual_renspa: a.establecimientoActualRenspa,
        fecha_identificacion: a.fechaIdentificacion,
        geolocalizacion_crianza: a.geolocalizacionCrianza,
        movimientos_ids: a.movimientosIds,
        lote_id: a.loteId,
        synced_at: a.syncedAt || syncedAt,
      }));

      const { data, error: animError } = await this.client
        .from("senasa_animales")
        .upsert(rowsToUpsert, { onConflict: "productor_cuit,animal_codigo" })
        .select("*");

      if (animError || !data) {
        return {
          animales,
          persistencia: "memory_fallback",
        };
      }

      const persisted = (data as SenasaAnimalRow[]).map(rowToAnimal);
      this.saveToMemory(productor, establecimientos, persisted);

      return {
        animales: persisted,
        persistencia: "supabase",
      };
    } catch {
      return {
        animales,
        persistencia: "memory_fallback",
      };
    }
  }

  async findAnimalsByCuit(cuit: string): Promise<AnimalSincronizado[]> {
    const normalized = normalizeCuit(cuit);
    const canonical = CUIT_ALIASES[normalized] ?? normalized;

    if (this.client) {
      try {
        const { data, error } = await this.client
          .from("senasa_animales")
          .select("*")
          .in("productor_cuit", [normalized, canonical])
          .order("animal_codigo", { ascending: true });

        if (!error && data && data.length > 0) {
          return (data as SenasaAnimalRow[]).map(rowToAnimal);
        }
      } catch {
        // Fallback a memoria
      }
    }

    const fromExact = this.memoryAnimalsByCuit.get(normalized);
    if (fromExact && fromExact.length > 0) {
      return fromExact;
    }

    const fromCanonical = this.memoryAnimalsByCuit.get(canonical);
    if (fromCanonical && fromCanonical.length > 0) {
      return fromCanonical.map((a) => ({ ...a, productorCuit: normalized }));
    }

    return [];
  }

  async findAnimalsByProducerId(
    productorId: string
  ): Promise<AnimalSincronizado[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from("senasa_animales")
          .select("*")
          .eq("productor_id", productorId)
          .order("animal_codigo", { ascending: true });

        if (!error && data && data.length > 0) {
          return (data as SenasaAnimalRow[]).map(rowToAnimal);
        }
      } catch {
        // Fallback a memoria
      }
    }

    return this.memoryAnimalsByProducerId.get(productorId) ?? [];
  }

  async listAllSyncedAnimals(): Promise<AnimalSincronizado[]> {
    if (this.client) {
      try {
        const { data, error } = await this.client
          .from("senasa_animales")
          .select("*")
          .order("animal_codigo", { ascending: true });

        if (!error && data && data.length > 0) {
          return (data as SenasaAnimalRow[]).map(rowToAnimal);
        }
      } catch {
        // Fallback a memoria
      }
    }

    const byKey = new Map<string, AnimalSincronizado>();
    for (const list of this.memoryAnimalsByCuit.values()) {
      for (const animal of list) {
        byKey.set(`${animal.productorCuit}:${animal.animalCodigo}`, animal);
      }
    }
    return Array.from(byKey.values());
  }
}
