import { useState, type ChangeEvent } from "react";
import { ACEPTA_IMAGEN, leerImagen } from "../../lib/imagen";
import { subirImagen } from "../../lib/ofertasApi";
import type { Lote } from "../../types";

// Solo para el vendedor: sube o cambia la imagen del lote. Funciona también para los lotes del mock.
export function ImagenLote({ lote, onSubida }: { lote: Lote; onSubida: () => void }) {
  const [pendiente, setPendiente] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tono: "" | "error" | "success" }>({ texto: "", tono: "" });

  const elegir = async (evento: ChangeEvent<HTMLInputElement>) => {
    const input = evento.target;
    const archivo = input.files?.[0];
    setPendiente(null);
    setMensaje({ texto: "", tono: "" });
    if (!archivo) return;
    try {
      setPendiente(await leerImagen(archivo));
    } catch (error) {
      input.value = "";
      setMensaje({ texto: error instanceof Error ? error.message : "No se pudo leer la imagen.", tono: "error" });
    }
  };

  const subir = async () => {
    if (!pendiente) return;
    setEnviando(true);
    setMensaje({ texto: "Subiendo imagen…", tono: "" });
    try {
      await subirImagen(lote.id, pendiente);
      setPendiente(null);
      setMensaje({ texto: "Imagen guardada.", tono: "success" });
      onSubida();
    } catch (error) {
      setMensaje({ texto: error instanceof Error ? error.message : "No se pudo subir la imagen.", tono: "error" });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="panel imagen-panel" aria-labelledby="imagenLoteTitulo">
      <div className="panel-heading">
        <div>
          <h3 id="imagenLoteTitulo">{lote.imagenUrl ? "Cambiar imagen" : "Agregar imagen"}</h3>
          <p>JPG, PNG o WebP, de hasta 3 MB. Se muestra en la tarjeta y en la ficha del lote.</p>
        </div>
      </div>
      <div className="imagen-controles">
        <input id="imagenLote" type="file" accept={ACEPTA_IMAGEN} onChange={elegir} disabled={enviando} />
        <button className="button button-primary" type="button" onClick={subir} disabled={!pendiente || enviando}>
          Subir imagen
        </button>
      </div>
      {pendiente && <img className="imagen-preview" src={pendiente} alt="Vista previa de la imagen elegida" />}
      <p className={`form-message ${mensaje.tono}`} aria-live="polite">
        {mensaje.texto}
      </p>
    </section>
  );
}
