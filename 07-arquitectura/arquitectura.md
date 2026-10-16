# Arquitectura

## Idea central
Los registros oficiales siguen siendo la **fuente de verdad**. La plataforma guarda referencias y copias con procedencia, no los reemplaza. Cuatro grupos de fuentes (SENASA, productores, datos ambientales, frigorífico) alimentan una **capa de evidencia** con seis etapas: ingesta, conciliación, análisis ambiental, motor de reglas, niveles de confianza y sello de integridad. La salida es el **expediente por lote**, accesible al comprador con consentimiento del productor.

## Principios de diseño
- **Procedencia por dato:** cada afirmación apunta a su fuente, fecha y método.
- **Datos mínimos al comprador:** divulgación selectiva, nada más de lo necesario.
- **Reproducibilidad:** el análisis se versiona (dataset, fecha, algoritmo).
- **Degradación explícita:** si falta un dato, el expediente lo dice.
- **Decisiones determinísticas:** los números y reglas salen de código auditable; la IA solo ayuda a interpretar, explicar y priorizar y nunca cambia un resultado.

## Etapa 1 (esta entrega): sitio estático en GitHub Pages
```
/index.html                      demo navegable (HTML + CSS + JS, sin servidor)
/presentacion/*.pdf              presentación
/01-problema ... /07-arquitectura documentación en Markdown
```
- Todo corre en el navegador. Los datos de ejemplo están dentro de `index.html` (DATO SIMULADO).
- Reglas y detección de brechas: funciones JavaScript determinísticas.
- Sello de integridad: JSON canónico + SHA-256 con la API Web Crypto del navegador.
- Documentos de sanidad: solo se calcula su huella localmente; no se suben.
- Costo: cero. Limitación: sin usuarios, sin persistencia, sin conexión a SENASA.

## Etapa 2 (producto real, sugerida, a decidir por el equipo)
- **Backend:** Python + FastAPI. **Base de datos:** PostgreSQL con PostGIS. **Archivos:** almacenamiento S3-compatible.
- **Frontend:** React + TypeScript, mapas con MapLibre, español primero e inglés para compradores.
- **Identidad y acceso:** OIDC, roles (RBAC), MFA para frigoríficos y verificadores.
- **Firma:** Ed25519 sobre JSON canónico; objetivo de compatibilidad con credenciales verificables W3C.
- **Hosting:** región con residencia de datos acorde a la Ley 25.326 **[VALIDAR]**.

## Integración con SENASA (riesgo principal)
No se asume una API pública. Cada fuente es un **conector con contrato** (misma interfaz), para pasar de una fase a otra sin romper el resto.
- **Fase A (sin convenio):** el productor o frigorífico descarga sus datos (planillas, constancias de DT-e, existencias) y los carga con validaciones.
- **Fase B (consentimiento delegado):** autorización del productor, si SENASA lo habilita.
- **Fase C (convenio institucional):** interfaz acordada con SENASA y provincias.

## Modelo de datos
**Núcleo de la demo (alcance actual):** `organization`, `establishment`, `animal`, `movement`, `animal_location_period` (derivado de movimientos), `slaughter_lot`, `evidence_item`, `consent`, `dossier`, `audit_log`.
**Etapa ambiental (posterior):** `parcel` (polígono), `environmental_analysis`, `legal_check`, `market_profile`, `verification`.

Entidades principales:
- `organization`: productor, frigorífico, exportador, comprador o verificador, con rol e identificación fiscal.
- `establishment`: RENSPA, titular, provincia, estado de habilitación UE.
- `animal`: identificador electrónico o CUIG, tipo (electrónica|analógica), sexo, raza, mes/año de nacimiento, establecimiento de nacimiento.
- `movement`: DT-e con origen, destino, fecha de emisión y cierre, animales o cantidad, estado.
- `animal_location_period`: animal, establecimiento, desde, hasta.
- `slaughter_lot` y `lot_animal_link`: lote de faena y vínculo con animales o, si solo hay trazabilidad por tropa, con proveedores y porcentajes.
- `evidence_item`: afirmación, fuente, método, nivel de confianza, fecha, hash.
- `consent`: productor, destinatario, alcance, vigencia, revocado.
- `dossier`: lote, perfil, versión, estado, firma, hash.
- `audit_log`: inmutable (solo se agrega).

SQL de referencia (extracto):
```sql
CREATE TABLE establishment (
  id UUID PRIMARY KEY, renspa TEXT UNIQUE NOT NULL,
  owner_org_id UUID NOT NULL, province TEXT NOT NULL,
  eu_enabled BOOLEAN DEFAULT FALSE);
CREATE TABLE evidence_item (
  id UUID PRIMARY KEY, subject_type TEXT NOT NULL, subject_id UUID NOT NULL,
  claim TEXT NOT NULL,
  confidence TEXT CHECK (confidence IN ('declared','registered','crosschecked','verified')),
  source TEXT NOT NULL, method TEXT,
  observed_at TIMESTAMPTZ NOT NULL, content_hash TEXT NOT NULL);
```

## Reglas y estados
Reglas del perfil inicial (versión de prueba, **[VALIDAR]** con experto regulatorio):
- R1: cada animal del lote tiene identidad, titular y al menos un período de residencia asociado; si no, el lote queda marcado incompleto con porcentaje de cobertura.
- R2: el historial de movimientos no tiene huecos, saltos ni fechas incoherentes.
- R3: la documentación sanitaria está vigente a la fecha de faena.
- R4: el lote indica la proporción de animales con identificación electrónica frente a analógica.
- R5: ninguna afirmación sin fuente; sin procedencia el expediente no se emite.
- R6: el expediente lista todos los datos faltantes en una sección explícita.
- Etapa ambiental: cada predio con análisis de cobertura vigente (corte 31/12/2020) y chequeo de legalidad (OTBN y permisos).
Estados: `borrador`, `con_alertas`, `completo`, `verificado`. Nunca `certificado`.

## Seguridad y privacidad (etapa 2)
Cifrado en tránsito y en reposo; claves de firma en HSM/KMS con rotación; mínimo privilegio y MFA; consentimiento explícito con finalidad y vigencia, revocable; evaluación de impacto de privacidad antes del piloto **[VALIDAR]** con asesoría legal.

## Hoja de ruta
| Fase | Duración estimada (SUPUESTO) | Resultado |
|---|---|---|
| Descubrimiento | 4 semanas | Entrevistas, validación de requisitos UE, datos reales disponibles, acuerdo de piloto |
| MVP | 10 a 12 semanas | Importación, expedientes, reglas, sello, portales básicos |
| Piloto | 8 a 12 semanas | 1 frigorífico y 20 a 50 establecimientos |
| Escalamiento | 6 meses | Más frigoríficos, conectores, verificadores y perfiles |
Indicadores del piloto: % de lotes con cadena de origen completa; tiempo de armado de evidencia; inconsistencias detectadas y resueltas; aceptación del comprador y del auditor; costo por expediente.
