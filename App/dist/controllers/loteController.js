"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoteController = void 0;
const zod_1 = require("zod");
const senasaMockData_1 = require("../data/senasaMockData");
const AuthError_1 = require("../services/AuthError");
const publicarLoteSchema = zod_1.z.object({
    productorCuit: zod_1.z
        .string({
        required_error: "El CUIT del productor es obligatorio.",
        invalid_type_error: "El CUIT del productor debe ser una cadena de texto.",
    })
        .trim()
        .refine((val) => val.replace(/\D/g, "").length === 11, {
        message: "El CUIT debe contener exactamente 11 dígitos (ej. 20-99999901-1 o 20999999011).",
    })
        .transform((val) => (0, senasaMockData_1.normalizeCuit)(val)),
    animalCodigos: zod_1.z
        .array(zod_1.z.string().trim().min(1, "El código de animal no puede estar vacío."), {
        required_error: "Debe indicar los códigos de animales del lote.",
        invalid_type_error: "Los códigos de animales deben ser una lista.",
    })
        .min(1, "El lote debe incluir al menos un animal."),
    precioPorKg: zod_1.z
        .number({
        required_error: "El precio por kg es obligatorio.",
        invalid_type_error: "El precio por kg debe ser un número.",
    })
        .finite("El precio por kg debe ser un número finito.")
        .positive("El precio por kg debe ser mayor a 0."),
});
class LoteController {
    loteService;
    constructor(loteService) {
        this.loteService = loteService;
    }
    publicar = async (req, res, next) => {
        try {
            const input = publicarLoteSchema.parse(req.body);
            const lote = await this.loteService.publicarLote(input);
            res.status(201).json(lote);
        }
        catch (error) {
            next(toHttpError(error));
        }
    };
}
exports.LoteController = LoteController;
function toHttpError(error) {
    if (error instanceof Error && error.name === "ZodError") {
        return new AuthError_1.AuthError(error.issues?.[0]?.message ?? "Datos del lote inválidos.", 400);
    }
    return error;
}
//# sourceMappingURL=loteController.js.map