"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLoteRouter = buildLoteRouter;
const express_1 = require("express");
function buildLoteRouter(loteController) {
    const router = (0, express_1.Router)();
    router.post("/", loteController.publicar);
    return router;
}
//# sourceMappingURL=loteRoutes.js.map