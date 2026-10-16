import {
  AnimalSincronizado,
  Establecimiento,
  Productor,
} from "../models/Senasa";

export interface SaveProducerAnimalsResult {
  animales: AnimalSincronizado[];
  persistencia: "supabase" | "memory_fallback";
}

export interface SenasaRepository {
  saveAnimalsForProducer(
    productor: Productor,
    establecimientos: Establecimiento[],
    animales: AnimalSincronizado[]
  ): Promise<SaveProducerAnimalsResult>;

  findAnimalsByCuit(cuit: string): Promise<AnimalSincronizado[]>;

  findAnimalsByProducerId(productorId: string): Promise<AnimalSincronizado[]>;

  listAllSyncedAnimals(): Promise<AnimalSincronizado[]>;
}
