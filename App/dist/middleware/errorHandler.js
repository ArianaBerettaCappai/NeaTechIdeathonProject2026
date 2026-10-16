"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const AuthError_1 = require("../services/AuthError");
function errorHandler(error, _req, res, _next) {
    if (error instanceof AuthError_1.AuthError) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor." });
}
//# sourceMappingURL=errorHandler.js.map