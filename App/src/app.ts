import cors from "cors";
import express, { Express } from "express";
import path from "path";
import { env } from "./config/env";
import { supabase } from "./config/supabaseClient";
import { AuthController } from "./controllers/authController";
import { errorHandler } from "./middleware/errorHandler";
import { SupabaseUserRepository } from "./repositories/SupabaseUserRepository";
import { buildAuthRouter } from "./routes/authRoutes";
import { AuthService } from "./services/AuthService";

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Composicion de dependencias: repository concreto -> service -> controller.
  // Cambiar de proveedor de datos solo requiere otra implementacion de UserRepository.
  const userRepository = new SupabaseUserRepository(supabase);
  const authService = new AuthService(userRepository, env.jwtSecret, env.jwtExpiresIn);
  const authController = new AuthController(authService);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/auth", buildAuthRouter(authController, userRepository));

  const frontendPath = path.resolve(__dirname, "../../Frontend");
  app.use(express.static(frontendPath));

  app.use(errorHandler);

  return app;
}
