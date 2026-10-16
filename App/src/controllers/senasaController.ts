import { NextFunction, Request, Response } from "express";
import { AuthError } from "../services/AuthError";
import { SenasaService } from "../services/SenasaService";
import {
  senasaAnimalesQuerySchema,
  senasaCuitParamSchema,
  senasaSyncSchema,
} from "./senasaSchemas";

export class SenasaController {
  constructor(private readonly senasaService: SenasaService) {}

  sync = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { cuit } = senasaSyncSchema.parse(req.body);
      const result = await this.senasaService.syncByCuit(cuit);
      res.status(200).json(result);
    } catch (error) {
      next(toHttpError(error));
    }
  };

  getAnimales = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { cuit } = senasaAnimalesQuerySchema.parse(req.query);
      const result = await this.senasaService.getAnimalsByCuit(cuit);
      res.status(200).json(result);
    } catch (error) {
      next(toHttpError(error));
    }
  };

  getAnimalesByProducerCuit = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { cuit } = senasaCuitParamSchema.parse(req.params);
      const result = await this.senasaService.getAnimalsByCuit(cuit);
      res.status(200).json(result);
    } catch (error) {
      next(toHttpError(error));
    }
  };

  listProductores = (
    _req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const productores = this.senasaService.listProductoresMock();
      res.status(200).json({ productores, total: productores.length });
    } catch (error) {
      next(toHttpError(error));
    }
  };

  listEstablecimientos = (
    _req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const establecimientos = this.senasaService.listEstablecimientosMock();
      res
        .status(200)
        .json({ establecimientos, total: establecimientos.length });
    } catch (error) {
      next(toHttpError(error));
    }
  };

  listLotes = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const lotes = this.senasaService.listLotesMock();
      res.status(200).json({ lotes, total: lotes.length });
    } catch (error) {
      next(toHttpError(error));
    }
  };

  getDataset = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataset = this.senasaService.getDatasetOverview();
      res.status(200).json(dataset);
    } catch (error) {
      next(toHttpError(error));
    }
  };
}

function toHttpError(error: unknown): AuthError | unknown {
  if (error instanceof Error && error.name === "ZodError") {
    return new AuthError(
      (error as any).issues?.[0]?.message ?? "Datos de CUIT inválidos.",
      400
    );
  }
  return error;
}
