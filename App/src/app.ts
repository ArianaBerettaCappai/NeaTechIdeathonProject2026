import cors from "cors";
import express, { Express } from "express";
import path from "path";
import { env } from "./config/env";
import { supabase } from "./config/supabaseClient";
import { AuthController } from "./controllers/authController";
import { SenasaController } from "./controllers/senasaController";
import { errorHandler } from "./middleware/errorHandler";
import { SupabaseSenasaRepository } from "./repositories/SupabaseSenasaRepository";
import { SupabaseUserRepository } from "./repositories/SupabaseUserRepository";
import { buildAuthRouter } from "./routes/authRoutes";
import { buildSenasaRouter } from "./routes/senasaRoutes";
import { AuthService } from "./services/AuthService";
import { SenasaService } from "./services/SenasaService";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Composicion de dependencias: repository concreto -> service -> controller.
  // Cambiar de proveedor de datos solo requiere otra implementacion de UserRepository.
  const userRepository = new SupabaseUserRepository(supabase);
  const authService = new AuthService(userRepository, env.jwtSecret, env.jwtExpiresIn);
  const authController = new AuthController(authService);

  const senasaRepository = new SupabaseSenasaRepository(supabase);
  const senasaService = new SenasaService(senasaRepository);
  const senasaController = new SenasaController(senasaService);
  const senasaRouter = buildSenasaRouter(senasaController);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/auth", buildAuthRouter(authController, userRepository));
  app.use("/senasa", senasaRouter);
  app.use("/api/senasa", senasaRouter);

  const frontendPath = path.resolve(__dirname, "../../Frontend");
  app.use(express.static(frontendPath));

  app.use(errorHandler);

  return app;
}

