import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { AuthError } from "../services/AuthError";
import { loginSchema, registerSchema } from "./authSchemas";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = registerSchema.parse(req.body);
      const result = await this.authService.register(payload);
      res.status(201).json(result);
    } catch (error) {
      next(toHttpError(error));
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = loginSchema.parse(req.body);
      const result = await this.authService.login(payload);
      res.status(200).json(result);
    } catch (error) {
      next(toHttpError(error));
    }
  };
}

function toHttpError(error: unknown): AuthError | unknown {
  if (error instanceof Error && error.name === "ZodError") {
    return new AuthError((error as any).issues?.[0]?.message ?? "Datos invalidos.", 400);
  }
  return error;
}
