import { SupabaseClient } from "@supabase/supabase-js";
import { NewUser, User } from "../models/User";
import { UserRepository } from "./UserRepository";

interface UserRow {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password_hash: string;
  rol: User["rol"];
  created_at: string;
  updated_at: string;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    nombre: row.nombre,
    apellido: row.apellido,
    email: row.email,
    passwordHash: row.password_hash,
    rol: row.rol,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseUserRepository implements UserRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .ilike("email", email)
      .maybeSingle();

    if (error) {
      throw new Error(`Error buscando usuario por email: ${error.message}`);
    }
    return data ? rowToUser(data as UserRow) : null;
  }

  async findById(id: string): Promise<User | null> {
    const { data, error } = await this.client
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(`Error buscando usuario por id: ${error.message}`);
    }
    return data ? rowToUser(data as UserRow) : null;
  }

  async create(user: NewUser): Promise<User> {
    const { data, error } = await this.client
      .from("users")
      .insert({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        password_hash: user.passwordHash,
        rol: user.rol,
      })
      .select("*")
      .single();

    if (error) {
      throw new Error(`Error creando usuario: ${error.message}`);
    }
    return rowToUser(data as UserRow);
  }
}
