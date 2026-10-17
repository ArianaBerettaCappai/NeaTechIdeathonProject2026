import express, { Router } from "express";
import { OfertasController } from "../controllers/ofertasController";
import { requireAuth } from "../middleware/requireAuth";
import { requireRol } from "../middleware/requireRol";

export function buildOfertasRouter(ofertasController: OfertasController): Router {
  const router = Router();

  router.get("/", ofertasController.listar);
  router.post("/", requireAuth, requireRol("vendedor"), ofertasController.publicar);

  router.get("/imagenes", ofertasController.listarImagenes);
  // Unica ruta con cuerpo mayor a 100kb: el limite de 4mb aplica solo aca.
  router.post(
    "/:id/imagen",
    requireAuth,
    requireRol("vendedor"),
    express.json({ limit: "4mb" }),
    ofertasController.subirImagen
  );

  return router;
}
