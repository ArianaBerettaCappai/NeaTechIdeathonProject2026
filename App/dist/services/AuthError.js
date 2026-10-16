"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthError = void 0;
class AuthError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = "AuthError";
    }
}
exports.AuthError = AuthError;
//# sourceMappingURL=AuthError.js.map