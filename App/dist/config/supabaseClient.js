"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = exports.isSupabaseConfigured = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
function isRealSupabaseConfig(url, key) {
    if (!url || !key)
        return false;
    if (url.includes("xxxxxxxxxxxx") || url.includes("xxxxx"))
        return false;
    if (key === "tu-service-role-key" || key.startsWith("tu-"))
        return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    }
    catch {
        return false;
    }
}
exports.isSupabaseConfigured = isRealSupabaseConfig(env_1.env.supabaseUrl, env_1.env.supabaseServiceRoleKey);
// Service role key: el backend confia en su propia logica de autorizacion,
// por eso usa la key que ignora RLS. Nunca exponer esta key al frontend.
// Si no hay credenciales reales configuradas, se exporta null (con tipado compatible)
// para permitir ejecucion local con fallback en memoria.
exports.supabase = exports.isSupabaseConfigured
    ? (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseServiceRoleKey, {
        auth: { persistSession: false },
    })
    : null;
//# sourceMappingURL=supabaseClient.js.map