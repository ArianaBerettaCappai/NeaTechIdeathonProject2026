# Vaka Rapé · Trazabilidad ganadera NEA

*(antes "Legajo", nombre provisional; "Vaka Rapé" significa "Camino de la Vaca")*

**Vertical:** Agro · **Escenario:** Ganadería · **Evento:** Ideatón NEA Tech 2026 (Corrientes)
**Demo navegable:** https://vaka-rape-web.vercel.app/ · código en `web/` (React) y `App/` (Express + Supabase)
**Presentación:** `presentacion/Vaka_Rape_Ideaton.pdf`

> **Convención del repositorio.** Todo lo no verificado está marcado como **SUPUESTO**, **DATO SIMULADO** o **[VALIDAR]**. Vaka Rapé **no certifica** ni reemplaza a SENASA: ordena la evidencia para que se pueda verificar.

## Frase del problema

> El productor ganadero del NEA necesita **demostrar con evidencia verificable la identidad y el recorrido de sus animales** porque **los compradores de mercados como la Unión Europea lo exigen y hoy esa información está repartida en registros y papeles que no se conectan**.

## Resumen en 5 líneas

1. **Problema:** la información existe (identificación, movimientos, sanidad), pero está dispersa entre SIGSA, SIGBIOTRAZA, planillas y carpetas, y se junta a mano a último momento.
2. **Solución:** un expediente único por animal y por lote: campo con su polígono, animales con su caravana y sus movimientos, y cruce del polígono con datos satelitales para ver si hubo pérdida de cobertura posterior a 2020. Cada dato indica su fuente y su nivel de confianza.
3. **Usuario:** pequeños y medianos productores (aplicable a todos). **Clientes:** frigoríficos exportadores y compradores europeos.
4. **Además:** marketplace donde el productor publica lotes y decide quién los ve y por cuánto tiempo.
5. **Blockchain:** no hace falta. Un sello de integridad (hash) del expediente alcanza; anclarlo en cadena queda para más adelante.

## Por qué ahora

- Desde el **1/1/2026** la identificación electrónica individual es obligatoria en terneros bovinos, bubalinos y cérvidos criados con fines comerciales (Res. SENASA 530/2025). Los animales con caravana analógica (CUIG) anteriores a 2026 siguen circulando: el rodeo es **mixto** durante años.
- El **Reglamento (UE) 2023/1115 (EUDR)** exige geolocalización de los establecimientos y evidencia de que no hubo deforestación posterior al **31/12/2020**. Fecha de aplicación publicada: **30/12/2026** para medianas y grandes empresas, 30/06/2027 para micro y pequeñas. **[VALIDAR]** con la Comisión Europea antes de cada hito.
- El equipo considera, **sin haberlo comprobado**, que desde el año próximo los animales sin trazabilidad completa tendrían problemas para exportarse a la UE. **[VALIDAR]**

## Qué hace la app (según la demo actual)

| Pantalla | Qué muestra |
| --- | --- |
| Inicio / sesión | Portada e inicio de sesión con usuario de prueba |
| Rodeo del productor | Búsqueda por CUIT; lista de animales con categoría, raza, sexo y peso; estado **Exportable / No exportable** con el motivo (por ejemplo, "establecimiento no habilitado para exportar a la UE"). Resumen "6/8 exportables" |
| Ofertas | Lotes publicados (kg, cantidad de animales, precio por kg, valor estimado), con filtro por provincia y orden por precio |
| Vender | Publicación de lotes |
| Expediente de un lote | Mapa con polígonos, brechas, sanidad (documentos adjuntos) y sello verificable |

Las ofertas, los precios, la deforestación y los datos del expediente son **DATO SIMULADO**. Los mapas usan imágenes satelitales de Esri y necesitan internet.

## Alcance

**Dentro (etapa actual):**
1. Identidad del animal y su propietario.
2. Movimientos (trazabilidad).
3. Sanidad como espacio para adjuntar documentos (opcional en la demo).
4. Polígono del campo y cruce con datos de cobertura forestal (en la demo, resultados simulados).
5. Publicación de lotes para la venta.

**Fuera (por ahora):** habilitaciones de establecimientos como motor de reglas completo, perfiles de otros mercados, cueros y otras especies, presentación de la DDS ante la UE, certificaciones propias.

## Cómo se construye el expediente

- Los registros oficiales (SENASA: identificación electrónica, RENSPA, SIGSA, DT-e) siguen siendo la **fuente de verdad**. La plataforma guarda referencias y copias con procedencia.
- **Niveles de confianza por dato:** *declarado* → *registrado* → *contrastado* → *verificado*.
- **Estados del expediente:** *borrador*, *con_alertas*, *completo*, *verificado*. **Nunca "certificado"**: eso corresponde a un organismo competente.
- **Principios:** procedencia por dato; datos mínimos al comprador (con consentimiento del productor); reproducibilidad; degradación explícita (si falta un dato, el expediente lo dice); los números y las decisiones salen de código determinístico, y la IA solo ayuda a interpretar y explicar.
- **Datos de origen (fases):** A) el productor descarga y carga archivos (planillas de SIGBIOTRAZA, constancias de DT-e); B) consentimiento delegado; C) convenio con SENASA. **No se asume** una API pública de SIGSA ni de TRAZA (Res. 117/2026). **[VALIDAR]**

## Datos de ejemplo (demo)

Conjunto **ficticio** de datos para RENSPA, SENASA (DT-e) y SIGBIOTRAZA, ubicado en Corrientes, Chaco, Formosa y Misiones. Se sugiere guardarlo en `datos/` (ver `README_demo_datos_nea.md` dentro de `demo_datos_nea.zip`).

- **Tablas:** productor, establecimiento (RENSPA), dispositivo y animal (SIGBIOTRAZA), dte y dte_animal (SENASA), frigorífico, parcela (polígono PostGIS), análisis de cobertura, chequeo legal, lote de faena.
- **5 productores, 6 establecimientos, 12 animales, 9 DT-e y 3 lotes** que validan reglas de negocio:
  - `LOT-2026-0101`: cadena completa → **completo**.
  - `LOT-2026-0102`: polígono con alerta de pérdida de cobertura posterior a 2020 y permiso de desmonte no registrado → **con_alertas**.
  - `LOT-2026-0103`: animal sin vínculo individual, campo sin polígono y un DT-e inconsistente con el historial → **borrador** con faltantes.
- Los resultados de cobertura forestal son **DATO SIMULADO**. Para obtenerlos reales: GFW Data API ([wri/gfw-data-api](https://github.com/wri/gfw-data-api)), consultando cada polígono con fecha de corte 31/12/2020. La pérdida de cobertura arbórea **no equivale** a deforestación (por ejemplo, cosecha de plantaciones forestales): el resultado es una alerta para revisión. **[VALIDAR]**
- Formatos usados en la demo: RENSPA `NN.NNN.N.NNNNN/NN`; caravana electrónica de 15 dígitos (`032` + 12 ficticios); caravana analógica `CUIGxxxx-número`. **[VALIDAR]** contra planillas reales.

## Modelo de negocio (SUPUESTO, a validar)

| Concepto | Propuesta |
| --- | --- |
| Registro del productor y carga de documentos | **Gratis** |
| Descarga del dossier unificado | **Con costo** |
| Marketplace | **Comisión muy baja por transacción** (propuesta inicial: 0,01 % a 0,03 %) |
| Clientes | Frigoríficos exportadores y compradores europeos |
| Canales | Eventos, publicidad y convenios |

**Pagador:** hoy se asume el productor, pero el frigorífico o exportador podría ser el pagador principal (hipótesis abierta). Los precios y las comisiones **no tienen respaldo de mercado todavía**.

## Qué está validado y qué no

| Validado | Hipótesis (sin comprobar) |
| --- | --- |
| El problema lo presentaron representantes del sector | Que el productor busque una solución así: muchos prefieren no declarar para evitar costos impositivos |
| Desde 2026 el productor debe identificar electrónicamente igual | Que a todos les interesen los mercados internacionales |
| | Que alguien pague por el dossier y a qué precio |

## Entregables de la ideatón

| Entregable | Dónde está |
| --- | --- |
| Presentación en PDF (problema, usuario, propuesta, tecnología, impacto) | `presentacion/Vaka_Rape_Ideaton.pdf` |
| Demo navegable (función central: expediente de un lote con brechas, sanidad y sello verificable) | `web/` (React) · https://vaka-rape-web.vercel.app/ |
| Sustento: fuentes, supuestos y limitaciones | `06-sustento/sustento.md` |

## Cómo ejecutar la demo

El proyecto tiene dos partes: el frontend React (`web/`) y el backend Express (`App/`) con Supabase para el acceso.

1. **Frontend** (portada, ofertas y expediente; no necesita backend):

   ```
   cd web
   npm install
   npm run dev
   ```

   Abrir `http://localhost:5173`.

2. **Backend** (solo para iniciar sesión y registrarse). Copiar `App/.env.example` como `App/.env` y completar las credenciales de Supabase; después:

   ```
   cd App
   npm install
   npm run dev
   ```

   El frontend envía `/auth/*` al puerto 3000 mediante el proxy de Vite.

## Estructura del repositorio

| Carpeta | Contenido |
| --- | --- |
| `01-problema` | Problema y usuario |
| `02-solucion` | Propuesta |
| `03-costos-y-ganancias` | Modelo de negocio y costos (SUPUESTOS) |
| `04-blockchain` | Por qué no hace falta blockchain |
| `05-producto` | Pitch, preguntas del jurado, riesgos y próximos pasos |
| `06-sustento` | Fuentes, supuestos y limitaciones |
| `07-arquitectura` | Arquitectura y modelo de datos |
| `App` | Backend Express + Supabase |
| `web` | Frontend React (demo) |
| `Frontend/Informacion` | Material de información del frontend |
| `datos` | Datos de ejemplo |
| `notebooks` | Análisis exploratorios |
| `presentacion` | Presentación en PDF |

## Riesgos principales

| Riesgo | Mitigación |
| --- | --- |
| Sin acceso programático a SIGSA | Estrategia por fases (archivos, delegación, convenio) |
| Rodeo mixto (analógico y electrónico) | Mostrar proporciones, no ocultarlas |
| Mezcla de animales en el frigorífico | Vínculo por tropa con porcentajes (etapa posterior) |
| Expectativa de "certificación" | Comunicar que es evaluación de evidencias, nunca "apto" |
| Falsos positivos o negativos satelitales | Versionado del método, revisión humana y nivel de confianza |
| Cambios regulatorios (EUDR) | Reglas versionadas; seguimiento de la norma |
| Privacidad y confianza del productor | Consentimientos, datos mínimos, auditoría |
| Exclusión de pequeños productores | Interfaz simple, onboarding por cooperativas |
| Nadie paga | Entrevistas antes de comprometer precio |

## Próximos pasos

1. Entrevistar productores, veterinarios, cooperativas, un frigorífico, un comprador y un verificador.
2. Leer la Res. 117/2026 y preguntar a SENASA qué datos puede consumir un tercero.
3. Conseguir muestras reales de planillas de SIGBIOTRAZA y DT-e para definir los conectores.
4. Reemplazar los resultados simulados de cobertura forestal por consultas reales a GFW y revisar su resolución y licencia.
5. Piloto con un frigorífico y 20 a 50 establecimientos de una cuenca (**SUPUESTO**).

## Equipo

- (completar nombres y roles)

## Contexto para IA

Proyecto de la Ideatón NEA Tech 2026, vertical Agro, escenario Ganadería. Desafío: ¿cómo demostrar de manera confiable el origen y las condiciones de producción ganadera del NEA para acceder a mercados internacionales, en particular la Unión Europea?

Nuestra propuesta, **Vaka Rapé**, es una **plataforma de evidencia digital**, no solo una app para registrar animales. Los organismos oficiales (SENASA: identificación electrónica, RENSPA, SIGSA, DT-e) son la **fuente de verdad**. La plataforma concilia animal → movimiento → establecimiento → lote, agrega el polígono del campo y un análisis de cobertura forestal posterior a 2020, y emite un **expediente (dossier)** donde cada dato indica fuente, fecha y nivel de confianza (*declarado, registrado, contrastado, verificado*). Estados del expediente: *borrador, con_alertas, completo, verificado*; **nunca "certificado"**. También ofrece un marketplace de lotes con visibilidad controlada por el productor.

Alcance actual: identidad y propietario, movimientos, sanidad (adjuntar documentos), polígono y cruce satelital, marketplace. Mercado: UE. Foco: Corrientes (datos de ejemplo en Chaco, Corrientes, Formosa y Misiones). Usuario: productor. Clientes: frigoríficos exportadores y compradores europeos. Todo dato no verificado está marcado como **SUPUESTO**, **DATO SIMULADO** o **[VALIDAR]**.

Criterios del jurado: Resolución del problema 25 (primer desempate), Innovación 25, Prototipo 20, Impacto 20, Factibilidad 10. Blockchain e IA no suman puntos por sí solos.
