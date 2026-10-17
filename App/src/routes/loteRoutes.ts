import { Router } from "express";
import { LoteController } from "../controllers/loteController";

export function buildLoteRouter(loteController: LoteController): Router {
  const router = Router();

  router.post("/", loteController.publicar);

  return router;
}
