import "dotenv/config";

function optionalEnv(name: string, defaultValue = ""): string {
  const value = process.env[name]?.trim();
  return value ? value : defaultValue;
}

export const env = {
  supabaseUrl: optionalEnv("SUPABASE_URL"),
  supabaseServiceRoleKey: optionalEnv("SUPABASE_SERVICE_ROLE_KEY"),
  jwtSecret: optionalEnv("JWT_SECRET", "legajo-dev-jwt-secret-2026"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  port: Number(process.env.PORT ?? 3000),
};
