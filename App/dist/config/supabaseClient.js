"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const env_1 = require("./env");
// Service role key: el backend confia en su propia logica de autorizacion,
// por eso usa la key que ignora RLS. Nunca exponer esta key al frontend.
exports.supabase = (0, supabase_js_1.createClient)(env_1.env.supabaseUrl, env_1.env.supabaseServiceRoleKey, {
    auth: { persistSession: false },
});
//# sourceMappingURL=supabaseClient.js.map