import { NextFunction, Request, Response } from "express";
import { AuthError } from "../services/AuthError";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof AuthError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  // Cuerpo JSON superior al limite de express.json (ver app.ts).
  if ((error as { type?: string })?.type === "entity.too.large") {
    res.status(413).json({ message: "El cuerpo de la solicitud supera el tamaño permitido." });
    return;
  }

  console.error(error);
  res.status(500).json({ message: "Error interno del servidor." });
}
