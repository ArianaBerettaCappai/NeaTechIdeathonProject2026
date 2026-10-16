# Blockchain: sí o no

## Respuesta
**No hace falta para esta etapa.** Un sello de integridad (hash SHA-256) del expediente cubre la necesidad de "probar que no se modificó". Anclar ese hash en una cadena pública queda como mejora opcional posterior.

## Filtro
| Condición | ¿Se cumple? |
|---|---|
| Se mueve plata o derechos | No. No hay pagos ni transferencia de propiedad. |
| Hace falta un registro que nadie pueda modificar | Solo para la huella del expediente. Se logra sin cadena (y se puede anclar después). |
| Los actores no confían entre sí | Parcial. SENASA ya es la fuente de verdad. |

## ¿Tokenizar o crear un ID virtual único?
**No.** SENASA ya asigna la identidad oficial del animal. Un ID nuevo la duplica y confunde cuál es el válido. Un token tampoco certifica nada: solo prueba que algo se registró, no que sea verdadero. Siempre se usa el **identificador oficial** del animal.

## Qué va dónde (si se agrega más adelante)
| ON-CHAIN (opcional) | OFF-CHAIN |
|---|---|
| Hash del expediente y fecha de sellado | Datos de animales, titulares y documentos |
| Identificador del emisor | Backend, base de datos, archivos |
| | Datos personales y comerciales (privacidad) |
| | Verificación contra fuentes oficiales |

**Red:** a decidir cuando haga falta (Hedera o Stellar son las opciones del evento). Hoy no se elige.

## Cómo se verifica sin blockchain
El expediente se serializa en JSON canónico (claves ordenadas), se calcula SHA-256 y se guarda junto al archivo. Cualquiera recalcula la huella: si cambia un byte, no coincide. La demo lo muestra. Objetivo posterior: firma Ed25519 y formato compatible con credenciales verificables (W3C VC). **No** hay firma en la demo.
