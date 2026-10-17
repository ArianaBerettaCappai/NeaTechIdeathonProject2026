"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const env_1 = require("./config/env");
const supabaseClient_1 = require("./config/supabaseClient");
const authController_1 = require("./controllers/authController");
const errorHandler_1 = require("./middleware/errorHandler");
const SupabaseUserRepository_1 = require("./repositories/SupabaseUserRepository");
const authRoutes_1 = require("./routes/authRoutes");
const AuthService_1 = require("./services/AuthService");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Composicion de dependencias: repository concreto -> service -> controller.
    // Cambiar de proveedor de datos solo requiere otra implementacion de UserRepository.
    const userRepository = new SupabaseUserRepository_1.SupabaseUserRepository(supabaseClient_1.supabase);
    const authService = new AuthService_1.AuthService(userRepository, env_1.env.jwtSecret, env_1.env.jwtExpiresIn);
    const authController = new authController_1.AuthController(authService);
    app.get("/health", (_req, res) => res.json({ status: "ok" }));
    app.use("/auth", (0, authRoutes_1.buildAuthRouter)(authController, userRepository));
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map