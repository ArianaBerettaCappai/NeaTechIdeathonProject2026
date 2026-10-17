import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";
import { env } from "./config/env";
import { supabase } from "./config/supabaseClient";
import { AuthController } from "./controllers/authController";
import { LoteController } from "./controllers/loteController";
import { OfertasController } from "./controllers/ofertasController";
import { SenasaController } from "./controllers/senasaController";
import { errorHandler } from "./middleware/errorHandler";
import { SupabaseLoteRepository } from "./repositories/SupabaseLoteRepository";
import { SupabaseSenasaRepository } from "./repositories/SupabaseSenasaRepository";
import { SupabaseUserRepository } from "./repositories/SupabaseUserRepository";
import { buildAuthRouter } from "./routes/authRoutes";
import { buildLoteRouter } from "./routes/loteRoutes";
import { buildOfertasRouter } from "./routes/ofertasRoutes";
import { buildSenasaRouter } from "./routes/senasaRoutes";
import { AuthService } from "./services/AuthService";
import { LoteImagenService, UPLOADS_DIR } from "./services/LoteImagenService";
import { LoteService } from "./services/LoteService";
import { SenasaService } from "./services/SenasaService";

const jsonParser = express.json();

// La subida de imagenes tiene su propio parser (4mb) en su ruta; el resto conserva el limite por defecto.
function esSubidaDeImagen(req: Request): boolean {
  return req.method === "POST" && /^\/api\/ofertas\/[^/]+\/imagen$/.test(req.path);
}

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use((req: Request, res: Response, next: NextFunction) =>
    esSubidaDeImagen(req) ? next() : jsonParser(req, res, next)
  );

  // Composicion de dependencias: repository concreto -> service -> controller.
  // Cambiar de proveedor de datos solo requiere otra implementacion de UserRepository.
  const userRepository = new SupabaseUserRepository(supabase);
  const authService = new AuthService(userRepository, env.jwtSecret, env.jwtExpiresIn);
  const authController = new AuthController(authService);

  const senasaRepository = new SupabaseSenasaRepository(supabase);
  const senasaService = new SenasaService(senasaRepository);
  const senasaController = new SenasaController(senasaService);
  const senasaRouter = buildSenasaRouter(senasaController);

  const loteRepository = new SupabaseLoteRepository(supabase);
  const loteImagenService = new LoteImagenService();
  const loteService = new LoteService(senasaRepository, loteRepository, loteImagenService);
  const loteController = new LoteController(loteService);
  const loteRouter = buildLoteRouter(loteController);
  const ofertasController = new OfertasController(loteService);

  app.get("/health", (_req, res) => res.json({ status: "ok" }));
  app.use("/auth", buildAuthRouter(authController, userRepository));
  app.use("/senasa", senasaRouter);
  app.use("/api/senasa", senasaRouter);
  app.use("/api/senasa/lotes", loteRouter);
  app.use("/api/ofertas", buildOfertasRouter(ofertasController));
  app.use("/uploads", express.static(UPLOADS_DIR));

  app.use(errorHandler);

  return app;
}
