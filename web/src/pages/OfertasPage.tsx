import { useMemo, useState } from "react";
import { EstadoDatos } from "../components/EstadoDatos";
import { Layout } from "../components/Layout";
import { moneda, numero } from "../lib/format";
import { pesoTotal, valorLote, visiblesPara } from "../lib/ofertas";
import { esVendedor } from "../lib/sesion";
import { useLotes } from "../lib/senasa";
import { TarjetaOferta } from "../components/TarjetaOferta";

type Orden = "precio" | "peso";

export function OfertasPage() {
  const { lotes: todos, error } = useLotes();
  const [provincia, setProvincia] = useState("todas");
  const [orden, setOrden] = useState<Orden>("precio");

  const vendedor = esVendedor();
  const visibles = useMemo(() => (todos ? visiblesPara(todos, vendedor) : []), [todos, vendedor]);
  const provincias = useMemo(() => [...new Set(visibles.map((lote) => lote.provincia))].sort(), [visibles]);
  if (!todos) return <EstadoDatos error={error} />;

  const kg = visibles.reduce((total, lote) => total + pesoTotal(lote), 0);
  const animales = visibles.reduce((total, lote) => total + lote.animales.length, 0);
  const valor = visibles.reduce((total, lote) => total + valorLote(lote), 0);

  const lotes = visibles.filter((lote) => provincia === "todas" || lote.provincia === provincia).sort((a, b) =>
    orden === "peso" ? pesoTotal(b) - pesoTotal(a) : a.precioKg - b.precioKg
  );

  return (
    <Layout>
      <section className="ofertas-hero">
        <div>
          <p className="eyebrow">OFERTAS · LOTES PUBLICADOS</p>
          <h1>Hacienda con origen, lista para comprar.</h1>
          <p className="hero-text">
            Cada lote muestra su peso estimado, su precio por kilo y la historia de cada animal: dónde se crió, sus vacunas
            y qué movimientos tuvo.
          </p>
        </div>
        <dl className="hero-stats">
          <div>
            <dt>Lotes</dt>
            <dd>{numero.format(visibles.length)}</dd>
          </div>
          <div>
            <dt>Animales</dt>
            <dd>{numero.format(animales)}</dd>
          </div>
          <div>
            <dt>Kilos ofrecidos</dt>
            <dd>{numero.format(kg)}</dd>
          </div>
          <div>
            <dt>Valor estimado</dt>
            <dd>{moneda.format(valor)}</dd>
          </div>
        </dl>
      </section>

      <p className="notice" role="note">
        <strong>Datos simulados.</strong> Estas ofertas son ilustrativas: no son ventas vigentes ni cotizaciones oficiales, y
        la capa de deforestación no proviene de un sistema satelital real.
      </p>

      <section className="ofertas-main" id="ofertas">
        <div className="filtros">
          <label className="filtro">
            <span className="field-label">Provincia</span>
            <select value={provincia} onChange={(event) => setProvincia(event.target.value)}>
              <option value="todas">Todas las provincias</option>
              {provincias.map((nombre) => (
                <option key={nombre} value={nombre}>
                  {nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="filtro">
            <span className="field-label">Ordenar por</span>
            <select value={orden} onChange={(event) => setOrden(event.target.value as Orden)}>
              <option value="precio">Precio por kg, de menor a mayor</option>
              <option value="peso">Peso total, de mayor a menor</option>
            </select>
          </label>
        </div>

        <p className="view-count" aria-live="polite">
          {lotes.length} {lotes.length === 1 ? "oferta" : "ofertas"} publicadas
        </p>

        {lotes.length ? (
          <ul className="ofertas-grid">
            {lotes.map((lote) => (
              <li key={lote.id}>
                <TarjetaOferta lote={lote} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">No hay ofertas para esa provincia.</p>
        )}
      </section>
    </Layout>
  );
}
