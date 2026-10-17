import { Router } from "express";
import { SenasaController } from "../controllers/senasaController";

export function buildSenasaRouter(senasaController: SenasaController): Router {
  const router = Router();

  router.post("/sync", senasaController.sync);
  router.get("/animales", senasaController.getAnimales);
  router.get(
    "/productores/:cuit/animales",
    senasaController.getAnimalesByProducerCuit
  );
  router.get("/productores", senasaController.listProductores);
  router.get("/establecimientos", senasaController.listEstablecimientos);
  router.get("/lotes", senasaController.listLotes);
  router.get("/dataset", senasaController.getDataset);

  return router;
}
