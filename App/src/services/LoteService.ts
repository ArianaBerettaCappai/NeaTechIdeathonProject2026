import { randomUUID } from "crypto";
import { normalizeCuit } from "../data/senasaMockData";
import { esAptoUe, LotePublicado, PublicarLoteInput } from "../models/Lote";
import { LoteRepository } from "../repositories/LoteRepository";
import { SenasaRepository } from "../repositories/SenasaRepository";
import { AuthError } from "./AuthError";

export class LoteService {
  constructor(
    private readonly senasaRepository: SenasaRepository,
    private readonly loteRepository: LoteRepository
  ) {}

  async publicarLote(input: PublicarLoteInput): Promise<LotePublicado> {
    const productorCuit = normalizeCuit(input.productorCuit);
    const { animalCodigos, precioPorKg } = input;

    if (!Number.isFinite(precioPorKg) || precioPorKg <= 0) {
      throw new AuthError("El precio por kg debe ser un número mayor a 0.", 400);
    }

    if (animalCodigos.length === 0) {
      throw new AuthError("El lote debe incluir al menos un animal.", 400);
    }

    const duplicados = [
      ...new Set(animalCodigos.filter((c, i) => animalCodigos.indexOf(c) !== i)),
    ];
    if (duplicados.length > 0) {
      throw new AuthError(
        `Hay animales repetidos en el lote: ${duplicados.join(", ")}.`,
        400
      );
    }

    const animalesDelRodeo = await this.senasaRepository.findAnimalsByCuit(productorCuit);
    const animalesPorCodigo = new Map(
      animalesDelRodeo.map((a) => [a.animalCodigo, a])
    );

    const noPertenecen = animalCodigos.filter((c) => !animalesPorCodigo.has(c));
    if (noPertenecen.length > 0) {
      throw new AuthError(
        `Los siguientes animales no pertenecen al rodeo del productor ${productorCuit}: ${noPertenecen.join(", ")}.`,
        422
      );
    }

    const animales = animalCodigos.map((codigo) => {
      const animal = animalesPorCodigo.get(codigo)!;
      return { animal, esApto: esAptoUe(animal.estadoSanitario) };
    });

    const noAptos = animales.filter((a) => !a.esApto).map((a) => a.animal.animalCodigo);
    if (noAptos.length > 0) {
      throw new AuthError(
        `Los siguientes animales no tienen estado sanitario Aprobado y fueron rechazados: ${noAptos.join(", ")}.`,
        422
      );
    }

    const animalesLote = animales.map(({ animal, esApto }) => ({
      animalCodigo: animal.animalCodigo,
      pesoKg: animal.pesoKg,
      esAptoUe: esApto,
    }));
    const pesoTotalKg = animalesLote.reduce((total, a) => total + a.pesoKg, 0);

    const lote: LotePublicado = {
      id: randomUUID(),
      productorCuit,
      precioPorKg,
      animales: animalesLote,
      pesoTotalKg,
      montoTotal: pesoTotalKg * precioPorKg,
      publicadoAt: new Date().toISOString(),
    };

    return this.loteRepository.guardarLote(lote);
  }
}
