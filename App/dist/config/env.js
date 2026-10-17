"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
function optionalEnv(name, defaultValue = "") {
    const value = process.env[name]?.trim();
    return value ? value : defaultValue;
}
exports.env = {
    supabaseUrl: optionalEnv("SUPABASE_URL"),
    supabaseServiceRoleKey: optionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
    jwtSecret: optionalEnv("JWT_SECRET", "legajo-dev-jwt-secret-2026"),
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
    port: Number(process.env.PORT ?? 3000),
};
//# sourceMappingURL=env.js.map