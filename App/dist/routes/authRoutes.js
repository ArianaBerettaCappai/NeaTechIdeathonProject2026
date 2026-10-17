"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAuthRouter = buildAuthRouter;
const express_1 = require("express");
const requireAuth_1 = require("../middleware/requireAuth");
function buildAuthRouter(authController, userRepository) {
    const router = (0, express_1.Router)();
    router.post("/register", authController.register);
    router.post("/login", authController.login);
    router.get("/me", requireAuth_1.requireAuth, async (req, res) => {
        const user = await userRepository.findById(req.auth.userId);
        if (!user) {
            res.status(404).json({ message: "Usuario no encontrado." });
            return;
        }
        const { passwordHash, ...publicUser } = user;
        res.json(publicUser);
    });
    return router;
}
//# sourceMappingURL=authRoutes.js.map