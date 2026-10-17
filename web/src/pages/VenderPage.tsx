import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { EstadoDatos } from "../components/EstadoDatos";
import { Layout } from "../components/Layout";
import { ErrorApi } from "../lib/api";
import { ACEPTA_IMAGEN, leerImagen } from "../lib/imagen";
import { numero } from "../lib/format";
import { crearOferta, pedirRodeo, subirImagen, type LotePublicado, type RodeoProductor } from "../lib/ofertasApi";
import { esVendedor } from "../lib/sesion";
import { invalidarLotes, useLotes } from "../lib/senasa";

type Tono = "" | "error" | "success";
interface Mensaje {
  texto: string;
  tono: Tono;
}

const SIN_MENSAJE: Mensaje = { texto: "", tono: "" };

// Crear una oferta es solo para vendedores; el resto vuelve al acceso.
export function VenderPage() {
  const { error, lotes } = useLotes();
  if (!esVendedor()) return <Navigate to="/acceso" replace />;
  if (!lotes) return <EstadoDatos error={error} />;

  return (
    <Layout>
      <section className="vender-hero">
        <p className="eyebrow">PUBLICAR UN LOTE</p>
        <h1>Ofrecé tu hacienda exportable.</h1>
        <p className="section-intro">
          Ingresá tu CUIT para ver todo tu rodeo. Solo se pueden ofrecer los animales exportables a la UE; los demás muestran el
          motivo.
        </p>
      </section>
      <FormularioOferta />
    </Layout>
  );
}

function FormularioOferta() {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [cuit, setCuit] = useState("");
  const [rodeo, setRodeo] = useState<RodeoProductor | null>(null);
  const [buscandoRodeo, setBuscandoRodeo] = useState(false);
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje>(SIN_MENSAJE);
  // Si la oferta se creó pero la imagen falló, queda el enlace al lote para reintentar desde ahí.
  const [loteCreado, setLoteCreado] = useState<string | null>(null);

  const exportables = rodeo?.animales.filter((animal) => animal.exportable) ?? [];
  const noExportables = rodeo?.animales.filter((animal) => !animal.exportable) ?? [];

  // No es un <form> propio: vive dentro del formulario de la oferta, y Enter no debe publicar.
  const buscarRodeo = async () => {
    setBuscandoRodeo(true);
    setMensaje(SIN_MENSAJE);
    setSeleccionados([]);
    try {
      setRodeo(await pedirRodeo(cuit.trim()));
    } catch (error) {
      setRodeo(null);
      setMensaje({ texto: error instanceof ErrorApi ? error.message : "No se pudo consultar el rodeo.", tono: "error" });
    } finally {
      setBuscandoRodeo(false);
    }
  };

  const alternar = (codigo: string) =>
    setSeleccionados((previos) => (previos.includes(codigo) ? previos.filter((c) => c !== codigo) : [...previos, codigo]));

  const elegirImagen = async (evento: ChangeEvent<HTMLInputElement>) => {
    const input = evento.target;
    const archivo = input.files?.[0];
    setImagen(null);
    if (!archivo) return;
    try {
      setImagen(await leerImagen(archivo));
    } catch (error) {
      input.value = "";
      setMensaje({ texto: error instanceof Error ? error.message : "No se pudo leer la imagen.", tono: "error" });
    }
  };

  const enviar = async (evento: SyntheticEvent) => {
    evento.preventDefault();
    const precioPorKg = Number(precio);
    if (!titulo.trim()) return setMensaje({ texto: "Ponele un título a la oferta.", tono: "error" });
    if (!rodeo) return setMensaje({ texto: "Ingresá tu CUIT y consultá tu rodeo primero.", tono: "error" });
    if (!seleccionados.length) return setMensaje({ texto: "Elegí al menos un animal exportable.", tono: "error" });
    if (!(precioPorKg > 0)) return setMensaje({ texto: "El precio por kilo debe ser mayor a cero.", tono: "error" });

    setEnviando(true);
    setMensaje({ texto: "Publicando la oferta…", tono: "" });
    let lote: LotePublicado | undefined;
    try {
      lote = await crearOferta({
        titulo: titulo.trim(),
        productorCuit: rodeo.productorCuit,
        animalCodigos: seleccionados,
        precioPorKg,
      });
      if (imagen) await subirImagen(lote.id, imagen);
      invalidarLotes();
      navigate(`/ofertas/${lote.id}`);
    } catch (error) {
      const texto = error instanceof ErrorApi ? error.message : "No se pudo publicar la oferta.";
      if (lote) {
        invalidarLotes();
        setLoteCreado(lote.id);
        setMensaje({ texto: `La oferta se publicó, pero la imagen no se pudo subir: ${texto}`, tono: "error" });
      } else {
        setMensaje({ texto, tono: "error" });
      }
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="vender-form panel" onSubmit={enviar} noValidate>
      <label className="field-label" htmlFor="tituloOferta">Título de la oferta</label>
      <input
        id="tituloOferta"
        type="text"
        placeholder="Ej.: Novillos de invernada, Corrientes"
        maxLength={120}
        value={titulo}
        onChange={(evento) => setTitulo(evento.target.value)}
      />

      <div className="rodeo-buscar-fila">
        <div className="rodeo-buscar-campo">
          <label className="field-label" htmlFor="cuitOferta">Tu CUIT</label>
          <input
            id="cuitOferta"
            type="text"
            inputMode="numeric"
            placeholder="20-99999903-3"
            value={cuit}
            onChange={(evento) => setCuit(evento.target.value)}
            onKeyDown={(evento) => {
              if (evento.key !== "Enter") return;
              evento.preventDefault();
              if (cuit.trim() && !buscandoRodeo) void buscarRodeo();
            }}
          />
        </div>
        <button
          className="button button-outline"
          type="button"
          onClick={() => void buscarRodeo()}
          disabled={buscandoRodeo || !cuit.trim()}
        >
          {buscandoRodeo ? "Buscando…" : "Ver mi rodeo"}
        </button>
      </div>

      <fieldset className="animales-picker">
        <legend className="field-label">Animales de tu rodeo</legend>
        {!rodeo && <p className="form-hint">Ingresá tu CUIT para ver todos tus animales.</p>}
        {rodeo && !rodeo.animales.length && <p className="form-hint">Este CUIT no tiene animales registrados.</p>}
        {rodeo && rodeo.animales.length > 0 && (
          <p className="form-hint">
            {rodeo.productorNombre}: {exportables.length} de {rodeo.animales.length} animales son exportables.
          </p>
        )}
        {exportables.map((animal) => (
          <label className="animal-option" key={animal.animalCodigo}>
            <input
              type="checkbox"
              checked={seleccionados.includes(animal.animalCodigo)}
              onChange={() => alternar(animal.animalCodigo)}
            />
            <span>
              <strong>{animal.animalCodigo}</strong>
              <small>
                {animal.categoria} · {animal.raza} · {numero.format(animal.pesoKg)} kg
              </small>
            </span>
          </label>
        ))}
        {noExportables.map((animal) => (
          <div className="animal-option animal-option-bloqueado" key={animal.animalCodigo}>
            <span>
              <strong>{animal.animalCodigo}</strong>
              <small>
                {animal.categoria} · {animal.raza} · {numero.format(animal.pesoKg)} kg · no se puede ofrecer:
              </small>
              <ul className="rodeo-motivos">
                {animal.motivosNoExportable.map((motivo) => (
                  <li key={motivo}>{motivo}</li>
                ))}
              </ul>
            </span>
          </div>
        ))}
      </fieldset>

      <div className="form-two-columns">
        <div>
          <label className="field-label" htmlFor="precioOferta">Precio por kg (USD)</label>
          <input
            id="precioOferta"
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            value={precio}
            onChange={(evento) => setPrecio(evento.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="imagenOferta">Imagen del lote (opcional)</label>
          <input id="imagenOferta" type="file" accept={ACEPTA_IMAGEN} onChange={elegirImagen} />
          <small className="form-hint">JPG, PNG o WebP, de hasta 3 MB.</small>
        </div>
      </div>

      <button className="button button-primary button-full" type="submit" disabled={enviando}>
        Publicar oferta <span aria-hidden="true">→</span>
      </button>
      <p className={`form-message ${mensaje.tono}`} aria-live="polite">
        {mensaje.texto}
        {loteCreado && (
          <>
            {" "}
            <Link to={`/ofertas/${loteCreado}`}>Ir al lote</Link>
          </>
        )}
      </p>
    </form>
  );
}
