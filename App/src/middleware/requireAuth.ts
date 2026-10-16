import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UserRole } from "../models/User";

export interface AuthenticatedRequest extends Request {
  auth?: { userId: string; rol: UserRole };
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    res.status(401).json({ message: "Falta el token de autenticacion." });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as { sub: string; rol: UserRole };
    req.auth = { userId: payload.sub, rol: payload.rol };
    next();
  } catch {
    res.status(401).json({ message: "Token invalido o expirado." });
  }
}
