"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const AuthError_1 = require("./AuthError");
const SALT_ROUNDS = 12;
class AuthService {
    userRepository;
    jwtSecret;
    jwtExpiresIn;
    constructor(userRepository, jwtSecret, jwtExpiresIn) {
        this.userRepository = userRepository;
        this.jwtSecret = jwtSecret;
        this.jwtExpiresIn = jwtExpiresIn;
    }
    async register(input) {
        const email = input.email.trim().toLowerCase();
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw new AuthError_1.AuthError("Ya existe una cuenta registrada con ese email.", 409);
        }
        const passwordHash = await bcryptjs_1.default.hash(input.password, SALT_ROUNDS);
        const user = await this.userRepository.create({
            nombre: input.nombre.trim(),
            apellido: input.apellido.trim(),
            email,
            passwordHash,
            rol: input.rol,
        });
        return { user: (0, User_1.toPublicUser)(user), token: this.issueToken(user.id, user.rol) };
    }
    async login(input) {
        const email = input.email.trim().toLowerCase();
        const user = await this.userRepository.findByEmail(email);
        const invalidCredentials = () => new AuthError_1.AuthError("Email o contraseña incorrectos.", 401);
        if (!user) {
            throw invalidCredentials();
        }
        const passwordMatches = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!passwordMatches) {
            throw invalidCredentials();
        }
        return { user: (0, User_1.toPublicUser)(user), token: this.issueToken(user.id, user.rol) };
    }
    issueToken(userId, rol) {
        return jsonwebtoken_1.default.sign({ sub: userId, rol }, this.jwtSecret, {
            expiresIn: this.jwtExpiresIn,
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map