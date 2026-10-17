import { useState, type ChangeEvent, type SyntheticEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { EstadoDatos } from "../components/EstadoDatos";
import { Layout } from "../components/Layout";
import { ErrorApi } from "../lib/api";
import { ACEPTA_IMAGEN, leerImagen } from "../lib/imagen";
import { numero } from "../lib/format";
import { esAptoUE } from "../lib/ofertas";
import { crearOferta, subirImagen, type LotePublicado } from "../lib/ofertasApi";
import { esVendedor } from "../lib/sesion";
import { invalidarLotes, useLotes } from "../lib/senasa";
import type { ProductorRodeo } from "../types";

type Tono = "" | "error" | "success";
interface Mensaje {
  texto: string;
  tono: Tono;
}

const SIN_MENSAJE: Mensaje = { texto: "", tono: "" };

// Crear una oferta es solo para vendedores; el resto vuelve al acceso.
export function VenderPage() {
  const { productores, error } = useLotes();
  if (!esVendedor()) return <Navigate to="/acceso" replace />;
  if (!productores) return <EstadoDatos error={error} />;

  return (
    <Layout>
      <section className="vender-hero">
        <p className="eyebrow">PUBLICAR UN LOTE</p>
        <h1>Ofrecé tu hacienda exportable.</h1>
        <p className="section-intro">
          Elegí el productor y los animales que cumplen los requisitos para la UE. La oferta aparece enseguida en la portada y en
          las ofertas.
        </p>
      </section>
      <FormularioOferta productores={productores} />
    </Layout>
  );
}

function FormularioOferta({ productores }: { productores: ProductorRodeo[] }) {
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [cuit, setCuit] = useState("");
  const [seleccionados, setSeleccionados] = useState<string[]>([]);
  const [precio, setPrecio] = useState("");
  const [imagen, setImagen] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje>(SIN_MENSAJE);
  // Si la oferta se creó pero la imagen falló, queda el enlace al lote para reintentar desde ahí.
  const [loteCreado, setLoteCreado] = useState<string | null>(null);

  const productor = productores.find((p) => p.cuit === cuit);
  const exportables = productor?.animales.filter(esAptoUE) ?? [];

  const cambiarProductor = (valor: string) => {
    setCuit(valor);
    setSeleccionados([]);
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
    if (!productor) return setMensaje({ texto: "Elegí el productor.", tono: "error" });
    if (!seleccionados.length) return setMensaje({ texto: "Elegí al menos un animal exportable.", tono: "error" });
    if (!(precioPorKg > 0)) return setMensaje({ texto: "El precio por kilo debe ser mayor a cero.", tono: "error" });

    setEnviando(true);
    setMensaje({ texto: "Publicando la oferta…", tono: "" });
    let lote: LotePublicado | undefined;
    try {
      lote = await crearOferta({
        titulo: titulo.trim(),
        productorCuit: productor.cuit,
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

      <label className="field-label" htmlFor="productorOferta">Productor</label>
      <select id="productorOferta" value={cuit} onChange={(evento) => cambiarProductor(evento.target.value)}>
        <option value="">Seleccionar…</option>
        {productores.map((p) => (
          <option key={p.cuit} value={p.cuit}>
            {p.nombre} · CUIT {p.cuit}
          </option>
        ))}
      </select>

      <fieldset className="animales-picker">
        <legend className="field-label">Animales exportables</legend>
        {!productor && <p className="form-hint">Elegí un productor para ver sus animales exportables.</p>}
        {productor && !exportables.length && (
          <p className="form-hint">Este productor no tiene animales exportables a la UE.</p>
        )}
        {exportables.map((animal) => (
          <label className="animal-option" key={animal.id}>
            <input type="checkbox" checked={seleccionados.includes(animal.id)} onChange={() => alternar(animal.id)} />
            <span>
              <strong>{animal.id}</strong>
              <small>
                {animal.categoria} · {numero.format(animal.pesoKg)} kg
              </small>
            </span>
          </label>
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
