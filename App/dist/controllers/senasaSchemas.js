"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.senasaAnimalesQuerySchema = exports.senasaCuitParamSchema = exports.senasaSyncSchema = void 0;
const zod_1 = require("zod");
const senasaMockData_1 = require("../data/senasaMockData");
const cuitStringSchema = zod_1.z
    .string({
    required_error: "El CUIT es obligatorio.",
    invalid_type_error: "El CUIT debe ser una cadena de texto.",
})
    .trim()
    .min(1, "El CUIT es obligatorio.")
    .refine((val) => {
    const digits = val.replace(/\D/g, "");
    return digits.length === 11;
}, {
    message: "El CUIT debe contener exactamente 11 dígitos (ej. 20-99999901-1 o 20999999011).",
})
    .transform((val) => (0, senasaMockData_1.normalizeCuit)(val));
exports.senasaSyncSchema = zod_1.z.object({
    cuit: cuitStringSchema,
});
exports.senasaCuitParamSchema = zod_1.z.object({
    cuit: cuitStringSchema,
});
exports.senasaAnimalesQuerySchema = zod_1.z.object({
    cuit: zod_1.z
        .string()
        .trim()
        .optional()
        .refine((val) => {
        if (!val)
            return true;
        return val.replace(/\D/g, "").length === 11;
    }, {
        message: "El parámetro CUIT debe contener 11 dígitos (ej. 20-99999901-1).",
    })
        .transform((val) => (val ? (0, senasaMockData_1.normalizeCuit)(val) : undefined)),
});
//# sourceMappingURL=senasaSchemas.js.map