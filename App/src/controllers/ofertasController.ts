import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AuthError } from "../services/AuthError";
import { LoteService } from "../services/LoteService";
import { publicarLoteSchema } from "./loteController";

const publicarOfertaSchema = publicarLoteSchema.extend({
  titulo: z
    .string({
      required_error: "El título de la oferta es obligatorio.",
      invalid_type_error: "El título de la oferta debe ser una cadena de texto.",
    })
    .trim()
    .min(1, "El título de la oferta no puede estar vacío.")
    .max(120, "El título no puede superar los 120 caracteres."),
});

const imagenLoteSchema = z.object({
  dataUrl: z
    .string({
      required_error: "La imagen es obligatoria.",
      invalid_type_error: "La imagen debe enviarse como texto (data URL).",
    })
    .min(1, "La imagen es obligatoria."),
});

export class OfertasController {
  constructor(private readonly loteService: LoteService) {}

  listar = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lotes = await this.loteService.listarOfertas();
      res.status(200).json({ lotes });
    } catch (error) {
      next(error);
    }
  };

  publicar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = publicarOfertaSchema.parse(req.body);
      const lote = await this.loteService.publicarLote(input);
      res.status(201).json(lote);
    } catch (error) {
      next(toHttpError(error));
    }
  };

  subirImagen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { dataUrl } = imagenLoteSchema.parse(req.body);
      const imagenUrl = await this.loteService.guardarImagen(req.params.id, dataUrl);
      res.status(200).json({ imagenUrl });
    } catch (error) {
      next(toHttpError(error));
    }
  };

  listarImagenes = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const imagenes = await this.loteService.listarImagenes();
      res.status(200).json({ imagenes });
    } catch (error) {
      next(error);
    }
  };
}

function toHttpError(error: unknown): AuthError | unknown {
  if (error instanceof Error && error.name === "ZodError") {
    return new AuthError(
      (error as any).issues?.[0]?.message ?? "Datos de la oferta inválidos.",
      400
    );
  }
  return error;
}
