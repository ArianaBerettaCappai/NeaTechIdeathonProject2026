"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenasaService = void 0;
const senasaMockData_1 = require("../data/senasaMockData");
const AuthError_1 = require("./AuthError");
class SenasaService {
    senasaRepository;
    constructor(senasaRepository) {
        this.senasaRepository = senasaRepository;
    }
    async syncByCuit(cuitInput) {
        const normalizedCuit = (0, senasaMockData_1.normalizeCuit)(cuitInput);
        const mockResult = (0, senasaMockData_1.buildMockSyncForCuit)(normalizedCuit);
        if (!mockResult) {
            const validCuits = [
                ...senasaMockData_1.PRODUCTORES.map((p) => p.cuit),
                ...Object.keys(senasaMockData_1.CUIT_ALIASES),
            ].join(", ");
            throw new AuthError_1.AuthError(`No se encontraron registros simulados en SENASA para el CUIT ${normalizedCuit}. CUITs disponibles para la demo: ${validCuits}.`, 404);
        }
        const saved = await this.senasaRepository.saveAnimalsForProducer(mockResult.productor, mockResult.establecimientos, mockResult.animales);
        const animales = saved.animales;
        const totalAnimales = animales.length;
        const aptos = animales.filter((a) => a.estadoSanitario === "Aprobado").length;
        const observados = animales.filter((a) => a.estadoSanitario === "Observado").length;
        const conAlertaDeforestacionPre2020 = animales.filter((a) => a.geolocalizacionCrianza.zonaDeforestadaPre2020).length;
        return {
            productor: mockResult.productor,
            establecimientos: mockResult.establecimientos,
            animales,
            resumen: {
                totalAnimales,
                aptos,
                observados,
                conAlertaDeforestacionPre2020,
                flujoDemo: observados > 0 || conAlertaDeforestacionPre2020 > 0
                    ? "negativo_observado"
                    : "positivo",
            },
            persistencia: saved.persistencia,
            syncedAt: mockResult.syncedAt,
        };
    }
    async getAnimalsByCuit(cuitInput) {
        if (!cuitInput || !cuitInput.trim()) {
            const synced = await this.senasaRepository.listAllSyncedAnimals();
            const animales = synced.length > 0 ? synced : senasaMockData_1.ANIMALES_MOCK;
            return {
                animales,
                totalAnimales: animales.length,
                aptos: animales.filter((a) => a.estadoSanitario === "Aprobado").length,
                observados: animales.filter((a) => a.estadoSanitario === "Observado")
                    .length,
                conAlertaDeforestacionPre2020: animales.filter((a) => a.geolocalizacionCrianza.zonaDeforestadaPre2020).length,
            };
        }
        const normalized = (0, senasaMockData_1.normalizeCuit)(cuitInput);
        const canonical = senasaMockData_1.CUIT_ALIASES[normalized] ?? normalized;
        const targetProductor = senasaMockData_1.PRODUCTORES.find((p) => p.cuit === canonical);
        if (!targetProductor) {
            throw new AuthError_1.AuthError(`Productor con CUIT ${normalized} no encontrado en el padrón SENASA simulado.`, 404);
        }
        let animales = await this.senasaRepository.findAnimalsByCuit(normalized);
        if (animales.length === 0) {
            // Si aun no fue sincronizado explicitamente, sincronizamos y persistimos automaticamente
            const syncResult = await this.syncByCuit(normalized);
            animales = syncResult.animales;
        }
        const productor = {
            ...targetProductor,
            cuit: normalized,
        };
        const establecimientos = senasaMockData_1.ESTABLECIMIENTOS.filter((e) => e.productorId === targetProductor.id);
        return {
            cuit: normalized,
            productor,
            establecimientos,
            animales,
            totalAnimales: animales.length,
            aptos: animales.filter((a) => a.estadoSanitario === "Aprobado").length,
            observados: animales.filter((a) => a.estadoSanitario === "Observado")
                .length,
            conAlertaDeforestacionPre2020: animales.filter((a) => a.geolocalizacionCrianza.zonaDeforestadaPre2020).length,
        };
    }
    listProductoresMock() {
        return senasaMockData_1.PRODUCTORES;
    }
    listEstablecimientosMock() {
        return senasaMockData_1.ESTABLECIMIENTOS;
    }
    listLotesMock() {
        return senasaMockData_1.LOTES;
    }
    getDatasetOverview() {
        return {
            productores: senasaMockData_1.PRODUCTORES,
            establecimientos: senasaMockData_1.ESTABLECIMIENTOS,
            frigorificos: senasaMockData_1.FRIGORIFICOS,
            parcelas: senasaMockData_1.PARCELAS,
            animales: senasaMockData_1.ANIMALES_MOCK,
            dtes: senasaMockData_1.DTES,
            lotes: senasaMockData_1.LOTES,
            aliasesCuit: senasaMockData_1.CUIT_ALIASES,
        };
    }
}
exports.SenasaService = SenasaService;
//# sourceMappingURL=SenasaService.js.map