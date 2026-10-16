import { z } from "zod";

export const registerSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio."),
  apellido: z.string().trim().min(1, "El apellido es obligatorio."),
  email: z.string().trim().email("El email no es valido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  rol: z.enum(["vendedor", "comprador"], {
    errorMap: () => ({ message: "El rol debe ser 'vendedor' o 'comprador'." }),
  }),
});

export const loginSchema = z.object({
  email: z.string().trim().email("El email no es valido."),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export type RegisterPayload = z.infer<typeof registerSchema>;
export type LoginPayload = z.infer<typeof loginSchema>;
