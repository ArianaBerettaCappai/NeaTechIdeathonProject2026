"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthError_1 = require("../services/AuthError");
const authSchemas_1 = require("./authSchemas");
class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    register = async (req, res, next) => {
        try {
            const payload = authSchemas_1.registerSchema.parse(req.body);
            const result = await this.authService.register(payload);
            res.status(201).json(result);
        }
        catch (error) {
            next(toHttpError(error));
        }
    };
    login = async (req, res, next) => {
        try {
            const payload = authSchemas_1.loginSchema.parse(req.body);
            const result = await this.authService.login(payload);
            res.status(200).json(result);
        }
        catch (error) {
            next(toHttpError(error));
        }
    };
}
exports.AuthController = AuthController;
function toHttpError(error) {
    if (error instanceof Error && error.name === "ZodError") {
        return new AuthError_1.AuthError(error.issues?.[0]?.message ?? "Datos invalidos.", 400);
    }
    return error;
}
//# sourceMappingURL=authController.js.map