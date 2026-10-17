import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { AuthenticatedRequest, requireAuth } from "../middleware/requireAuth";
import { UserRepository } from "../repositories/UserRepository";

export function buildAuthRouter(
  authController: AuthController,
  userRepository: UserRepository
): Router {
  const router = Router();

  router.post("/register", authController.register);
  router.post("/login", authController.login);

  router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
    const user = await userRepository.findById(req.auth!.userId);
    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado." });
      return;
    }
    const { passwordHash, ...publicUser } = user;
    res.json(publicUser);
  });

  return router;
}
