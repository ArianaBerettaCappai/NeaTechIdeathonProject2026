import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { normalizeCuit } from "../data/senasaMockData";
import { AuthError } from "../services/AuthError";
import { LoteService } from "../services/LoteService";

const publicarLoteSchema = z.object({
  productorCuit: z
    .string({
      required_error: "El CUIT del productor es obligatorio.",
      invalid_type_error: "El CUIT del productor debe ser una cadena de texto.",
    })
    .trim()
    .refine((val) => val.replace(/\D/g, "").length === 11, {
      message:
        "El CUIT debe contener exactamente 11 dígitos (ej. 20-99999901-1 o 20999999011).",
    })
    .transform((val) => normalizeCuit(val)),
  animalCodigos: z
    .array(z.string().trim().min(1, "El código de animal no puede estar vacío."), {
      required_error: "Debe indicar los códigos de animales del lote.",
      invalid_type_error: "Los códigos de animales deben ser una lista.",
    })
    .min(1, "El lote debe incluir al menos un animal."),
  precioPorKg: z
    .number({
      required_error: "El precio por kg es obligatorio.",
      invalid_type_error: "El precio por kg debe ser un número.",
    })
    .finite("El precio por kg debe ser un número finito.")
    .positive("El precio por kg debe ser mayor a 0."),
});

export class LoteController {
  constructor(private readonly loteService: LoteService) {}

  publicar = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const input = publicarLoteSchema.parse(req.body);
      const lote = await this.loteService.publicarLote(input);
      res.status(201).json(lote);
    } catch (error) {
      next(toHttpError(error));
    }
  };
}

function toHttpError(error: unknown): AuthError | unknown {
  if (error instanceof Error && error.name === "ZodError") {
    return new AuthError(
      (error as any).issues?.[0]?.message ?? "Datos del lote inválidos.",
      400
    );
  }
  return error;
}
