import { z } from "zod";
import { normalizeCuit } from "../data/senasaMockData";

const cuitStringSchema = z
  .string({
    required_error: "El CUIT es obligatorio.",
    invalid_type_error: "El CUIT debe ser una cadena de texto.",
  })
  .trim()
  .min(1, "El CUIT es obligatorio.")
  .refine(
    (val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length === 11;
    },
    {
      message:
        "El CUIT debe contener exactamente 11 dígitos (ej. 20-99999901-1 o 20999999011).",
    }
  )
  .transform((val) => normalizeCuit(val));

export const senasaSyncSchema = z.object({
  cuit: cuitStringSchema,
});

export const senasaCuitParamSchema = z.object({
  cuit: cuitStringSchema,
});

export const senasaAnimalesQuerySchema = z.object({
  cuit: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return val.replace(/\D/g, "").length === 11;
      },
      {
        message:
          "El parámetro CUIT debe contener 11 dígitos (ej. 20-99999901-1).",
      }
    )
    .transform((val) => (val ? normalizeCuit(val) : undefined)),
});

export type SenasaSyncPayload = z.infer<typeof senasaSyncSchema>;
