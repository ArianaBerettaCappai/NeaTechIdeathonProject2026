"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSenasaRouter = buildSenasaRouter;
const express_1 = require("express");
function buildSenasaRouter(senasaController) {
    const router = (0, express_1.Router)();
    router.post("/sync", senasaController.sync);
    router.get("/animales", senasaController.getAnimales);
    router.get("/productores/:cuit/animales", senasaController.getAnimalesByProducerCuit);
    router.get("/productores", senasaController.listProductores);
    router.get("/establecimientos", senasaController.listEstablecimientos);
    router.get("/lotes", senasaController.listLotes);
    router.get("/dataset", senasaController.getDataset);
    return router;
}
//# sourceMappingURL=senasaRoutes.js.map