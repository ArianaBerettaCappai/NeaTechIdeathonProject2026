import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env";

function isRealSupabaseConfig(url: string, key: string): boolean {
  if (!url || !key) return false;
  if (url.includes("xxxxxxxxxxxx") || url.includes("xxxxx")) return false;
  if (key === "tu-service-role-key" || key.startsWith("tu-")) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = isRealSupabaseConfig(
  env.supabaseUrl,
  env.supabaseServiceRoleKey
);

// Service role key: el backend confia en su propia logica de autorizacion,
// por eso usa la key que ignora RLS. Nunca exponer esta key al frontend.
// Si no hay credenciales reales configuradas, se exporta null (con tipado compatible)
// para permitir ejecucion local con fallback en memoria.
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })
  : (null as unknown as SupabaseClient);
