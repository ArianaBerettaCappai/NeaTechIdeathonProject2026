import { NewUser, User } from "../models/User";

// Puerto del repository pattern: la capa de servicios depende de esta interfaz,
// no de Supabase. Permite cambiar de proveedor de datos sin tocar la logica de negocio.
export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(user: NewUser): Promise<User>;
}
