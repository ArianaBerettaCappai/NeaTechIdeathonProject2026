import { NextFunction, Response } from "express";
import { UserRole } from "../models/User";
import { AuthenticatedRequest } from "./requireAuth";

// Debe usarse despues de requireAuth.
export function requireRol(rolRequerido: UserRole) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (req.auth?.rol !== rolRequerido) {
      res
        .status(403)
        .json({ message: `Esta acción requiere un usuario con rol ${rolRequerido}.` });
      return;
    }
    next();
  };
}
