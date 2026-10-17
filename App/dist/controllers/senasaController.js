"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SenasaController = void 0;
const AuthError_1 = require("../services/AuthError");
const senasaSchemas_1 = require("./senasaSchemas");
class SenasaController {
    senasaService;
    constructor(senasaService) {
        this.senasaService = senasaService;
    }
    sync = async (req, res, next) => {
        try {
            const { cuit } = senasaSchemas_1.senasaSyncSchema.parse(req.body);
            const result = await this.senasaService.syncByCuit(cuit);
            res.status(200).json(result);
        }
        catch (error) {
            next(toHttpError(error));
        }
    };
    getAnimales = async (req, res, next) => {
        try {
            const { cuit } = senasaSchemas_1.senasaAnimalesQuerySchema.parse(req.query);
            const result = await this.senasaService.getAnimalsByCuit(cuit);
            res.status(200).json(result);
        }
        catch (error) {
            next(toHttpError(error));
        }
    };
    getAnimalesByProducerCuit = async (req, res, next) => {
        try {
            const { cuit } = senasaSchemas_1.senasaCuitParamSchema.parse(req.params);
            const result = await this.senasaService.getAnimalsByCuit(cuit);
            res.status(200).json(result);
        }
        catch (error) {
            next(toHttpError(error));
        }
    };
    listProductores = (_req, res, next) => {
        try {
            const productores = this.senasaService.listProductoresMock();
            res.status(200).json({ productores, total: productores.length });
        }
        catch (error) {
            next(toHttpError(error));
        }
    };
    listEstablecimientos = (_req, res, next) => {
        try {
            const establecimientos = this.senasaService.listEstablecimientosMock();
            res
                .status(200)
                .json({ establecimientos, total: establecimientos.length });
        }
        catch (error) {
            next(toHttpError(error));
        }
    };
    listLotes = (_req, res, next) => {
        try {
            const lotes = this.senasaService.listLotesMock();
            res.status(200).json({ lotes, total: lotes.length });
        }
        catch (error) {
            next(toHttpError(error));
        }
    };
    getDataset = (_req, res, next) => {
        try {
            const dataset = this.senasaService.getDatasetOverview();
            res.status(200).json(dataset);
        }
        catch (error) {
            next(toHttpError(error));
        }
    };
}
exports.SenasaController = SenasaController;
function toHttpError(error) {
    if (error instanceof Error && error.name === "ZodError") {
        return new AuthError_1.AuthError(error.issues?.[0]?.message ?? "Datos de CUIT inválidos.", 400);
    }
    return error;
}
//# sourceMappingURL=senasaController.js.map