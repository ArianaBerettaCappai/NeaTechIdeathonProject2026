# Sustento: fuentes, supuestos y limitaciones

## Fuentes
- SENASA, identificación electrónica: https://www.argentina.gob.ar/senasa/sistema-de-identificacion-electronica-de-animales
- SENASA, sitio institucional: https://www.argentina.gob.ar/senasa
- Comisión Europea, EUDR: https://environment.ec.europa.eu/topics/forests/deforestation/regulation-deforestation-free-products_en
- Reglamento (UE) 2023/1115 y su modificación Reglamento (UE) 2025/2650 (citado en el documento Dossier)
- Global Forest Watch: https://www.globalforestwatch.org/
- INTA Corrientes, ganadería de precisión: https://repositorio.inta.gob.ar/handle/20.500.12123/23258 (**pendiente de leer**)
- INTA Mercedes, seguimiento individual en recría de vaquillas: https://repositorio.inta.gob.ar/handle/20.500.12123/23592 (**pendiente de leer**)
- Ley 26.331 de Bosques Nativos y mapas OTBN; MapBiomas Chaco (a incorporar)
Estado: las citas normativas provienen de los documentos del proyecto y **no fueron verificadas por nosotros**.

## Supuestos
| Supuesto | Estado |
|---|---|
| No existe API pública de SIGSA para terceros | SUPUESTO, [VALIDAR] con SENASA |
| El productor puede descargar sus datos en archivos | SUPUESTO, [VALIDAR] formatos |
| El pagador inicial es el productor | Decisión del equipo; el frigorífico podría ser el pagador principal |
| Precios y costos | SUPUESTO sin respaldo de mercado |
| Fechas EUDR y alcance del producto | [VALIDAR] antes de cada hito |
| Cueros y pieles fuera de alcance de la UE | Dato de prensa, [VALIDAR]; el proyecto se centra en carne |
| Datos de la demo (animales, DT-e, establecimientos) | DATO SIMULADO |

## Limitaciones del prototipo
- No consulta SENASA ni valida contra registros oficiales.
- No evalúa evidencia ambiental, habilitaciones ni requisitos del destino.
- El sello SHA-256 prueba integridad, no veracidad; no hay firma digital ni verificador externo.
- No hay usuarios, permisos ni consentimientos reales; la "vista comprador" es una simulación.
- Los documentos adjuntos no salen del navegador y no se guardan.
- Las reglas son de ejemplo y no fueron revisadas por un experto regulatorio.
- La validación del problema es indirecta (sin entrevistas directas todavía).

## Preguntas abiertas (del documento Dossier)
- ¿Qué datos de SIGSA/DT-e puede obtener el productor en formato exportable y con qué esquema?
- ¿Qué nivel de geolocalización exige la guía vigente de la UE para bovinos y cómo trata la cría, recría y engorde?
- ¿Qué datasets de cobertura forestal tienen resolución y licencia aptas en el NEA?
- ¿Qué provincias publican OTBN y permisos de desmonte en formato utilizable?
- ¿Qué comprador europeo participaría del piloto y qué formato de evidencia acepta?
- ¿Quién sería el verificador acreditado? ¿Cuál es la disposición a pagar real?
