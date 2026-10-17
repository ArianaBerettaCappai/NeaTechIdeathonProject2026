import { randomUUID } from "crypto";
import {
  buildMockSyncForCuit,
  CUIT_ALIASES,
  DTES,
  ESTABLECIMIENTOS,
  FRIGORIFICOS,
  normalizeCuit,
  PRODUCTORES,
} from "../data/senasaMockData";
import { esAptoUe, LotePublicado, PublicarLoteInput, RodeoProductor } from "../models/Lote";
import { AnimalSincronizado } from "../models/Senasa";
import { LoteRepository } from "../repositories/LoteRepository";
import { SenasaRepository } from "../repositories/SenasaRepository";
import { AuthError } from "./AuthError";
import { LoteImagenService } from "./LoteImagenService";

export class LoteService {
  constructor(
    private readonly senasaRepository: SenasaRepository,
    private readonly loteRepository: LoteRepository,
    private readonly loteImagenService: LoteImagenService
  ) {}

  async publicarLote(input: PublicarLoteInput): Promise<LotePublicado> {
    const productorCuit = normalizeCuit(input.productorCuit);
    const { animalCodigos, precioPorKg, titulo } = input;

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

    // Si el rodeo todavia no se sincronizo, usamos el rodeo simulado: es el mismo que muestra el dataset.
    const rodeoSincronizado = await this.senasaRepository.findAnimalsByCuit(productorCuit);
    const animalesDelRodeo =
      rodeoSincronizado.length > 0 ? rodeoSincronizado : (buildMockSyncForCuit(productorCuit)?.animales ?? []);
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

    const noExportables = animales
      .map(({ animal }) => ({
        codigo: animal.animalCodigo,
        motivos: this.motivosNoExportable(animal),
      }))
      .filter((a) => a.motivos.length > 0);
    if (noExportables.length > 0) {
      const detalle = noExportables
        .map((a) => `${a.codigo} (${a.motivos.join("; ")})`)
        .join(", ");
      throw new AuthError(
        `Los siguientes animales no son exportables a la UE y fueron rechazados: ${detalle}.`,
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
      titulo,
      productorCuit,
      precioPorKg,
      animales: animalesLote,
      pesoTotalKg,
      montoTotal: pesoTotalKg * precioPorKg,
      publicadoAt: new Date().toISOString(),
      imagenUrl: null,
    };

    return this.loteRepository.guardarLote(lote);
  }

  // Todo el rodeo bajo un CUIT, sin filtrar: cada animal indica si es exportable y, si no, por que.
  async rodeoDe(cuitInput: string): Promise<RodeoProductor> {
    const productorCuit = normalizeCuit(cuitInput);
    const canonical = CUIT_ALIASES[productorCuit] ?? productorCuit;
    const productor = PRODUCTORES.find((p) => p.cuit === canonical);
    if (!productor) {
      throw new AuthError(`No hay un productor registrado con el CUIT ${productorCuit}.`, 404);
    }

    const sincronizado = await this.senasaRepository.findAnimalsByCuit(productorCuit);
    const animales = sincronizado.length > 0 ? sincronizado : (buildMockSyncForCuit(productorCuit)?.animales ?? []);

    return {
      productorCuit,
      productorNombre: productor.nombre,
      animales: animales.map((animal) => {
        const motivosNoExportable = this.motivosNoExportable(animal);
        return {
          animalCodigo: animal.animalCodigo,
          caravana: animal.caravana,
          categoria: animal.categoria,
          raza: animal.raza,
          sexo: animal.sexo,
          pesoKg: animal.pesoKg,
          estadoSanitario: animal.estadoSanitario,
          exportable: motivosNoExportable.length === 0,
          motivosNoExportable,
        };
      }),
    };
  }

  async listarOfertas(): Promise<LotePublicado[]> {
    const [lotes, imagenes] = await Promise.all([
      this.loteRepository.listarLotes(),
      this.loteImagenService.listarImagenes(),
    ]);

    return lotes
      .map((lote) => ({ ...lote, imagenUrl: imagenes[lote.id] ?? null }))
      .sort((a, b) => b.publicadoAt.localeCompare(a.publicadoAt));
  }

  guardarImagen(loteId: string, dataUrl: string): Promise<string> {
    return this.loteImagenService.guardarImagen(loteId, dataUrl);
  }

  listarImagenes(): Promise<Record<string, string>> {
    return this.loteImagenService.listarImagenes();
  }

  // Motivos concretos por los que un animal no puede exportarse a la UE. Vacio = exportable.
  motivosNoExportable(animal: AnimalSincronizado): string[] {
    const motivos: string[] = [];

    if (animal.estadoSanitario !== "Aprobado") {
      motivos.push(
        animal.motivoObservacion ?? `estado sanitario ${animal.estadoSanitario.toLowerCase()}`
      );
    }

    if (animal.geolocalizacionCrianza.zonaDeforestadaPre2020) {
      motivos.push(
        `deforestación registrada antes del corte EUDR en ${animal.geolocalizacionCrianza.establecimientoNombre}`
      );
    }

    const establecimientoCria = ESTABLECIMIENTOS.find(
      (e) => e.renspa === animal.establecimientoNacimientoRenspa
    );
    if (!establecimientoCria?.habilitadoUe) {
      motivos.push(
        `${establecimientoCria?.nombre ?? animal.establecimientoNacimientoRenspa} no está habilitado para exportar a la UE`
      );
    }

    for (const dte of DTES.filter((d) => d.animalesIds.includes(animal.animalCodigo))) {
      if (dte.destinoTipo === "ESTABLECIMIENTO") {
        const destino = ESTABLECIMIENTOS.find((e) => e.renspa === dte.destinoId);
        if (!destino?.habilitadoUe) {
          motivos.push(
            `destino ${destino?.nombre ?? dte.destinoId} (${dte.id}) no está habilitado para exportar a la UE`
          );
        }
      } else {
        const destino = FRIGORIFICOS.find((f) => f.id === dte.destinoId);
        if (!destino?.habilitadoUe) {
          motivos.push(
            `frigorífico ${destino?.nombre ?? dte.destinoId} (${dte.id}) no está habilitado para exportar a la UE`
          );
        }
      }
    }

    return motivos;
  }
}
