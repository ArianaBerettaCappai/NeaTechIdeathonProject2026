# Legajo (nombre provisional)

**Vertical:** Agro · **Escenario:** Ganadería · **Evento:** Ideathon NEA Tech 2026 (Corrientes)
**Demo navegable:** app React en `web/` (ver [Cómo ejecutar la demo](#cómo-ejecutar-la-demo)) · **Presentación:** `presentacion/Legajo_Presentacion.pdf`

## Frase del problema
> El productor ganadero de Corrientes necesita **demostrar con evidencia verificable la identidad y el recorrido de sus animales** porque **los compradores de mercados como la Unión Europea lo exigen y hoy esa información está repartida en registros y papeles que no se conectan**.

## Resumen en 4 líneas
1. **Problema:** la información existe (identificación, movimientos, sanidad), pero está dispersa y nadie la presenta como un solo expediente que un comprador pueda revisar.
2. **Solución:** una plataforma que reúne, concilia y presenta evidencia por animal o lote, e indica en cada dato su fuente y su nivel de confianza. No reemplaza a SENASA y no certifica.
3. **Negocio:** suscripción o pago por lote; casi todo es software (costos **SUPUESTOS**, a validar).
4. **Blockchain:** no hace falta. Un sello de integridad (hash) del expediente alcanza; anclarlo en cadena queda para más adelante.

## Alcance (se mantiene)
1. Identidad del animal y su propietario. 2. Movimientos (trazabilidad). 3. Sanidad como espacio para adjuntar documentos.
**Fuera del alcance de esta etapa:** evidencia ambiental (EUDR), habilitaciones de establecimientos y perfiles de otros mercados. Se muestran como "no evaluada".

## Entregables de la ideatón
| Entregable | Dónde está |
|---|---|
| Presentación en PDF (problema, usuario, propuesta, tecnología, impacto) | `presentacion/Legajo_Presentacion.pdf` |
| Demo navegable (función central: expediente de un lote con brechas, sanidad y sello verificable) | `web/` (React) |
| Sustento: fuentes, supuestos y limitaciones | `06-sustento/sustento.md` |

## Cómo ejecutar la demo
El proyecto tiene dos partes: el frontend React (`web/`) y el backend Express (`App/`) con Supabase para el acceso.

1. **Frontend** (portada, ofertas y expediente; no necesita backend):
   ```sh
   cd web
   npm install
   npm run dev
   ```
   Abrir `http://localhost:5173`.
2. **Backend** (solo para iniciar sesión y registrarse). Copiar `App/.env.example` como `App/.env` y completar las credenciales de Supabase; después:
   ```sh
   cd App
   npm install
   npm run dev
   ```
   El frontend envía `/auth/*` al puerto 3000 mediante el proxy de Vite.

Las ofertas, la deforestación y los datos del expediente son simulados. Los mapas usan imágenes satelitales de Esri, así que necesitan conexión a internet.

## Equipo
- (completar nombres y roles)

## Índice
- [01-problema](01-problema/problema.md) · [02-solucion](02-solucion/solucion.md) · [03-costos-y-ganancias](03-costos-y-ganancias/costos-y-ganancias.md) · [04-blockchain](04-blockchain/blockchain.md) · [05-producto](05-producto/producto.md) · [06-sustento](06-sustento/sustento.md) · [07-arquitectura](07-arquitectura/arquitectura.md)

## Contexto para IA
Proyecto de la Ideathon NEA Tech 2026, vertical Agro, escenario Ganadería. Desafío: ¿cómo demostrar de manera confiable el origen y las condiciones de producción ganadera del NEA para acceder a mercados internacionales, en particular la Unión Europea?

Nuestra propuesta es una **plataforma de evidencia digital**, no una app para registrar animales. Los organismos oficiales (SENASA: identificación electrónica, RENSPA, SIGSA, DT-e) siguen siendo la **fuente de verdad**. La plataforma guarda referencias y copias con procedencia, concilia animal → movimiento → establecimiento → lote, y emite un **expediente (dossier)** donde cada dato indica fuente, fecha y nivel de confianza: *declarado, registrado, contrastado, verificado*. El expediente tiene estados *borrador, con_alertas, completo, verificado*; **nunca "certificado"**, porque eso corresponde a un organismo competente.

Principios: procedencia por dato; datos mínimos al comprador (consentimiento del productor); reproducibilidad; degradación explícita (si falta un dato, el expediente lo dice); los números y decisiones salen de código determinístico, la IA solo ayuda a interpretar y explicar.

Alcance actual: identidad y propietario, movimientos, sanidad (adjuntar documentos). Mercado: UE. Foco: Corrientes. Primer cliente a validar: productor (el frigorífico/exportador podría ser el pagador principal: hipótesis abierta). Todo dato no verificado está marcado como **SUPUESTO**, **DATO SIMULADO** o **[VALIDAR]**.

Criterios del jurado: Resolución del problema 25 (primer desempate), Innovación 25, Prototipo 20, Impacto 20, Factibilidad 10. Blockchain e IA no suman puntos por sí solos.
