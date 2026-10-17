"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseUserRepository = void 0;
function rowToUser(row) {
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
class SupabaseUserRepository {
    client;
    constructor(client) {
        this.client = client;
    }
    async findByEmail(email) {
        const { data, error } = await this.client
            .from("users")
            .select("*")
            .ilike("email", email)
            .maybeSingle();
        if (error) {
            throw new Error(`Error buscando usuario por email: ${error.message}`);
        }
        return data ? rowToUser(data) : null;
    }
    async findById(id) {
        const { data, error } = await this.client
            .from("users")
            .select("*")
            .eq("id", id)
            .maybeSingle();
        if (error) {
            throw new Error(`Error buscando usuario por id: ${error.message}`);
        }
        return data ? rowToUser(data) : null;
    }
    async create(user) {
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
        return rowToUser(data);
    }
}
exports.SupabaseUserRepository = SupabaseUserRepository;
//# sourceMappingURL=SupabaseUserRepository.js.map