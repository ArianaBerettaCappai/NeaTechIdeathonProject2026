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
  telefono TEXT NOT NULL,
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

-- =============================================================================
-- RF-2: Sincronizacion de productores y animales desde SENASA (datos simulados)
-- =============================================================================

CREATE TABLE IF NOT EXISTS senasa_productores (
  id TEXT PRIMARY KEY,
  cuit TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  provincia TEXT NOT NULL,
  establecimientos JSONB NOT NULL DEFAULT '[]'::jsonb,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS senasa_productores_cuit_idx ON senasa_productores (cuit);

ALTER TABLE senasa_productores ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS senasa_animales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_codigo TEXT NOT NULL,
  productor_id TEXT NOT NULL,
  productor_cuit TEXT NOT NULL,
  caravana TEXT NOT NULL,
  tipo_identificacion TEXT NOT NULL,
  sexo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  raza TEXT NOT NULL,
  peso_kg NUMERIC NOT NULL,
  estado_sanitario TEXT NOT NULL,
  motivo_observacion TEXT,
  fecha_nacimiento DATE NOT NULL,
  establecimiento_nacimiento_renspa TEXT NOT NULL,
  establecimiento_actual_renspa TEXT NOT NULL,
  fecha_identificacion DATE NOT NULL,
  geolocalizacion_crianza JSONB NOT NULL,
  movimientos_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  lote_id TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(productor_cuit, animal_codigo)
);

CREATE INDEX IF NOT EXISTS senasa_animales_productor_cuit_idx ON senasa_animales (productor_cuit);
CREATE INDEX IF NOT EXISTS senasa_animales_productor_id_idx ON senasa_animales (productor_id);
CREATE INDEX IF NOT EXISTS senasa_animales_estado_sanitario_idx ON senasa_animales (estado_sanitario);

ALTER TABLE senasa_animales ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RF-3: Publicacion de lotes de animales aprobados
-- =============================================================================

CREATE TABLE IF NOT EXISTS lotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  productor_cuit TEXT NOT NULL,
  precio_por_kg NUMERIC NOT NULL CHECK (precio_por_kg > 0),
  peso_total_kg NUMERIC NOT NULL,
  monto_total NUMERIC NOT NULL,
  publicado_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lotes_productor_cuit_idx ON lotes (productor_cuit);
CREATE INDEX IF NOT EXISTS lotes_publicado_at_idx ON lotes (publicado_at);

ALTER TABLE lotes ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS lote_animales (
  lote_id UUID REFERENCES lotes(id) ON DELETE CASCADE,
  animal_codigo TEXT NOT NULL,
  productor_cuit TEXT NOT NULL,
  peso_kg NUMERIC NOT NULL,
  es_apto_ue BOOLEAN NOT NULL,
  PRIMARY KEY (lote_id, animal_codigo)
);

CREATE INDEX IF NOT EXISTS lote_animales_lote_id_idx ON lote_animales (lote_id);
CREATE INDEX IF NOT EXISTS lote_animales_productor_cuit_idx ON lote_animales (productor_cuit);
CREATE INDEX IF NOT EXISTS lote_animales_animal_codigo_idx ON lote_animales (animal_codigo);

ALTER TABLE lote_animales ENABLE ROW LEVEL SECURITY;
