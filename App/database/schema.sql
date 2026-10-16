-- Schema para autenticacion propia (login/registro) con tabla de usuarios en Supabase (PostgreSQL).
-- Ejecutar este archivo en el SQL Editor de Supabase (Project -> SQL Editor -> New query).

-- Extension necesaria para generar UUIDs con gen_random_uuid().
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enum de roles soportados por la plataforma.
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('vendedor', 'comprador');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  rol user_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email siempre en minusculas para evitar duplicados por mayusculas/minusculas.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_idx ON users (LOWER(email));

-- Mantiene updated_at al dia en cada UPDATE.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- RLS habilitado: el backend accede con la service role key, que ignora RLS,
-- asi que la tabla queda cerrada a cualquier otro cliente (ej. el navegador con la anon key).
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
