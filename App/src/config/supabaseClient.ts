import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Service role key: el backend confia en su propia logica de autorizacion,
// por eso usa la key que ignora RLS. Nunca exponer esta key al frontend.
export const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { persistSession: false },
});
