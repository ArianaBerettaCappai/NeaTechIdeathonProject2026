# Solución

## Qué es y qué no es
Una plataforma que **no reemplaza** la trazabilidad oficial: reúne, concilia, verifica y presenta evidencia. Por cada lote emite un **expediente** donde cada dato indica su fuente y su nivel de confianza. No emite certificaciones; no sustituye a SENASA ni a un organismo acreditado. Un mapa o una cadena de bloques no certifican por sí solos.

## Innovación (lo que nos diferencia)
1. Conciliación automática animal → movimiento → establecimiento → lote.
2. Niveles de confianza explícitos (honestidad frente a la "trazabilidad de marketing").
3. Las brechas se muestran, no se ocultan (degradación explícita).
4. El productor controla qué comparte (vista comprador con datos mínimos).
5. Expediente con sello de integridad que cualquiera puede verificar sin depender de la plataforma.
6. Motor de reglas por mercado y producto en vez de una etiqueta "apto para exportación".

## Niveles de confianza
| Nivel | Significado | Ejemplo |
|---|---|---|
| Declarado | Lo afirma el actor sin respaldo | Titular indicado por el productor |
| Registrado | Consta en un registro oficial | Identificación del animal, DT-e |
| Contrastado | Dos fuentes coinciden | Salida y entrada de un movimiento coinciden |
| Verificado | Un tercero competente lo validó | Auditoría documental (no incluido en la demo) |

## Reglas del prototipo (alcance actual)
| Regla | Resultados posibles |
|---|---|
| Identidad animal (y titular) | Verificada, incompleta o inconsistente |
| Historial de movimientos | Completo, con brechas o pendiente de confirmar |
| Documentación sanitaria | Vigente, faltante o vencida |
| Electrónica vs. analógica | Informada como proporción (rodeo mixto) |
| Fuente por cada dato | Si falta procedencia, el expediente no se emite |
| Datos faltantes | Se listan en una sección explícita |
| Habilitación, ambiental, requisitos del destino | **No evaluados** (fuera de alcance) |

Estado del expediente: `borrador`, `con_alertas`, `completo`, `verificado`. Nunca "certificado". Cada regla debe tener fuente normativa, versión y fecha de vigencia **[VALIDAR]** con un experto regulatorio.

## Funcionalidad central de la demo
**Expediente de un lote con brechas detectadas, documentos de sanidad y sello verificable.** Flujo (ver `index.html`):
1. Se ve el lote y qué reglas cumple (semáforo con texto e ícono).
2. Se abre un animal y se ve su línea de tiempo con fuente y confianza de cada evento.
3. Se adjunta un documento de sanidad (la huella se calcula en el navegador).
4. Se emite el expediente (JSON con huella SHA-256) y se verifica; al alterar un dato, la verificación falla.
Extra: la vista de comprador oculta el titular (datos mínimos).

## Ideas descartadas
- App para registrar animales desde cero: SENASA ya lo hace.
- Token o ID virtual propio: duplica la identidad oficial. Ver `04-blockchain`.
- Etiqueta única "apto para exportación": la aptitud depende del mercado y del producto.
- Empezar por mapas y deforestación: demasiado grande para esta etapa.

## A quién probarlo y qué preguntar
Productores, veterinarios, cooperativas, un frigorífico/exportador y, si es posible, un comprador o auditor. Preguntas: ¿Lo entienden a primera vista? ¿Les da confianza? ¿Qué dato falta? ¿Pagarían y cuánto? ¿Es un problema del productor o del frigorífico?
