"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const supabaseClient_1 = require("./config/supabaseClient");
const authController_1 = require("./controllers/authController");
const senasaController_1 = require("./controllers/senasaController");
const errorHandler_1 = require("./middleware/errorHandler");
const SupabaseSenasaRepository_1 = require("./repositories/SupabaseSenasaRepository");
const SupabaseUserRepository_1 = require("./repositories/SupabaseUserRepository");
const authRoutes_1 = require("./routes/authRoutes");
const senasaRoutes_1 = require("./routes/senasaRoutes");
const AuthService_1 = require("./services/AuthService");
const SenasaService_1 = require("./services/SenasaService");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Composicion de dependencias: repository concreto -> service -> controller.
    // Cambiar de proveedor de datos solo requiere otra implementacion de UserRepository.
    const userRepository = new SupabaseUserRepository_1.SupabaseUserRepository(supabaseClient_1.supabase);
    const authService = new AuthService_1.AuthService(userRepository, env_1.env.jwtSecret, env_1.env.jwtExpiresIn);
    const authController = new authController_1.AuthController(authService);
    const senasaRepository = new SupabaseSenasaRepository_1.SupabaseSenasaRepository(supabaseClient_1.supabase);
    const senasaService = new SenasaService_1.SenasaService(senasaRepository);
    const senasaController = new senasaController_1.SenasaController(senasaService);
    const senasaRouter = (0, senasaRoutes_1.buildSenasaRouter)(senasaController);
    app.get("/health", (_req, res) => res.json({ status: "ok" }));
    app.use("/auth", (0, authRoutes_1.buildAuthRouter)(authController, userRepository));
    app.use("/senasa", senasaRouter);
    app.use("/api/senasa", senasaRouter);
    const frontendPath = path_1.default.resolve(__dirname, "../../Frontend");
    app.use(express_1.default.static(frontendPath));
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map