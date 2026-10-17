"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const roleMap = {
    vendedor: "vendedor",
    productor: "vendedor",
    comprador: "comprador",
    transportista: "comprador",
    comerciante: "comprador",
};
exports.registerSchema = zod_1.z.object({
    nombre: zod_1.z.string().trim().min(1, "El nombre es obligatorio."),
    apellido: zod_1.z.string().trim().min(1, "El apellido es obligatorio."),
    email: zod_1.z.string().trim().email("El email no es valido."),
    password: zod_1.z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
    rol: zod_1.z.preprocess((val) => (typeof val === "string" ? roleMap[val.trim().toLowerCase()] ?? val : val), zod_1.z.enum(["vendedor", "comprador"], {
        errorMap: () => ({ message: "El rol debe ser 'vendedor' o 'comprador'." }),
    })),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().email("El email no es valido."),
    password: zod_1.z.string().min(1, "La contraseña es obligatoria."),
});
//# sourceMappingURL=authSchemas.js.map