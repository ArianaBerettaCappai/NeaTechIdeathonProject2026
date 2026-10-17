import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/UserRepository";
import { PublicUser, UserRole, toPublicUser } from "../models/User";
import { AuthError } from "./AuthError";

const SALT_ROUNDS = 12;

export interface RegisterInput {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
}

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtSecret: string,
    private readonly jwtExpiresIn: string
  ) {}

  async register(input: RegisterInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new AuthError("Ya existe una cuenta registrada con ese email.", 409);
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await this.userRepository.create({
      nombre: input.nombre.trim(),
      apellido: input.apellido.trim(),
      email,
      passwordHash,
      rol: input.rol,
    });

    return { user: toPublicUser(user), token: this.issueToken(user.id, user.rol) };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    const invalidCredentials = () =>
      new AuthError("Email o contraseña incorrectos.", 401);

    if (!user) {
      throw invalidCredentials();
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw invalidCredentials();
    }

    return { user: toPublicUser(user), token: this.issueToken(user.id, user.rol) };
  }

  private issueToken(userId: string, rol: UserRole): string {
    return jwt.sign({ sub: userId, rol }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);
  }
}
