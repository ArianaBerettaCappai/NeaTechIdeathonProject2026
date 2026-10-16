# Backend — Login y registro (Legajo)

Backend en Node.js + TypeScript + Express para registrar e identificar usuarios (vendedor/comprador), usando **Supabase (PostgreSQL)** como base de datos y autenticación propia (password hasheado con bcrypt + JWT).

## Estructura (repository pattern)

```
src/
  config/        env.ts, supabaseClient.ts
  models/        User.ts (tipos de dominio)
  repositories/  UserRepository.ts (interfaz) + SupabaseUserRepository.ts (implementación)
  services/      AuthService.ts (lógica de registro/login), AuthError.ts
  controllers/   authController.ts, authSchemas.ts (validación con zod)
  middleware/    requireAuth.ts, errorHandler.ts
  routes/        authRoutes.ts
  app.ts, server.ts
database/
  schema.sql     tabla `users` para correr en Supabase
```

La capa de servicios (`AuthService`) depende de la interfaz `UserRepository`, no de Supabase directamente. Si el día de mañana cambian de base de datos, solo hay que escribir otra clase que implemente `UserRepository`.

## 1. Crear el proyecto en Supabase

1. Entrar a [supabase.com](https://supabase.com) y crear un proyecto.
2. Ir a **SQL Editor** → **New query**, pegar el contenido de `database/schema.sql` y ejecutarlo. Esto crea la tabla `users` con: `nombre`, `apellido`, `email` (único), `password_hash`, `rol` (`vendedor` | `comprador`).
3. Ir a **Project Settings → API** y copiar:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (no la `anon` key) → `SUPABASE_SERVICE_ROLE_KEY`

## 2. Configurar variables de entorno

Copiar `.env.example` como `.env` (ya existe un `.env` vacío listo para completar) y pegar las credenciales:

```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ey...
JWT_SECRET=una-clave-larga-y-aleatoria
JWT_EXPIRES_IN=1d
PORT=3000
```

El archivo `.env` está en `.gitignore`: nunca se sube al repositorio.

## 3. Instalar y correr

```bash
cd backend
npm install
npm run dev     # desarrollo (recarga automática)
npm run build && npm start   # producción
```

## Endpoints

### `POST /auth/register`
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@gmail.com",
  "password": "contraseñaSegura123",
  "rol": "vendedor"
}
```
Responde `201` con `{ user, token }`. Falla con `409` si el email ya existe.

### `POST /auth/login`
```json
{ "email": "juan@gmail.com", "password": "contraseñaSegura123" }
```
Responde `200` con `{ user, token }`. Falla con `401` si las credenciales son incorrectas.

### `GET /auth/me`
Header: `Authorization: Bearer <token>`. Devuelve el usuario autenticado (sin el password).
