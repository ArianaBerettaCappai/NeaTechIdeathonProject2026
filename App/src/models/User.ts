export type UserRole = "vendedor" | "comprador";

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  passwordHash: string;
  rol: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface NewUser {
  nombre: string;
  apellido: string;
  email: string;
  passwordHash: string;
  rol: UserRole;
}

export type PublicUser = Omit<User, "passwordHash">;

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}
