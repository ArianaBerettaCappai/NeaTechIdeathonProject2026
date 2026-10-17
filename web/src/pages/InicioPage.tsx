import { Link } from "react-router-dom";
import { EstadoDatos } from "../components/EstadoDatos";
import { Layout } from "../components/Layout";
import { TarjetaOferta } from "../components/TarjetaOferta";
import { Notice } from "../components/inicio/Notice";
import { TuRodeo } from "../components/inicio/TuRodeo";
import { moneda, numero } from "../lib/format";
import { pesoTotal, valorLote, visiblesPara } from "../lib/ofertas";
import { esVendedor } from "../lib/sesion";
import { useLotes } from "../lib/senasa";

const PASOS = [
  {
    titulo: "Elegí el lote",
    texto: "Compará peso, precio por kilo y provincia de cada lote disponible.",
  },
  {
    titulo: "Revisá cada animal",
    texto: "Mirá su crianza, sus vacunas y sus movimientos entre campos en el mapa.",
  },
  {
    titulo: "Coordiná la compra",
    texto: "Acordá con el productor la entrega y el traslado hasta el frigorífico destino.",
  },
];

export function InicioPage() {
  const { lotes: todos, error } = useLotes();
  if (!todos) return <EstadoDatos error={error} />;

  const vendedor = esVendedor();
  const lotes = visiblesPara(todos, vendedor);
  const kg = lotes.reduce((total, lote) => total + pesoTotal(lote), 0);
  const animales = lotes.reduce((total, lote) => total + lote.animales.length, 0);
  const valor = lotes.reduce((total, lote) => total + valorLote(lote), 0);
  const destacado = lotes[0];

  return (
    <Layout>
      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">NOVILLOS, VAQUILLONAS Y TERNEROS · NEA</p>
          <h1>
            Comprá ganado
            <br />
            <span>con toda su historia a la vista.</span>
          </h1>
          <p className="hero-text">
            Compra directa de lotes del Nordeste. Por cada animal ves dónde se crió, sus vacunas y cada movimiento entre campos.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/ofertas">
              Ver lotes disponibles <span aria-hidden="true">→</span>
            </Link>
            <a className="button button-outline" href="#como-comprar">Cómo funciona</a>
          </div>
          <dl className="hero-stats">
            <div>
              <dt>Lotes</dt>
              <dd>{numero.format(lotes.length)}</dd>
            </div>
            <div>
              <dt>Animales</dt>
              <dd>{numero.format(animales)}</dd>
            </div>
            <div>
              <dt>Kilos</dt>
              <dd>{numero.format(kg)}</dd>
            </div>
            <div>
              <dt>Valor estimado</dt>
              <dd>{moneda.format(valor)}</dd>
            </div>
          </dl>
        </div>

        {destacado && (
          <aside className="hero-card" aria-label="Lote destacado">
            <div className="hero-card-top">
              <span className="status-dot" /> LOTE DESTACADO
            </div>
            <p className="lot-code">{destacado.id}</p>
            <p className="hero-card-titulo">{destacado.titulo}</p>
            <div className="hero-stat-grid">
              <div>
                <strong>{numero.format(pesoTotal(destacado))} kg</strong>
                <span>peso total</span>
              </div>
              <div>
                <strong>{moneda.format(destacado.precioKg)}</strong>
                <span>por kg</span>
              </div>
              <div>
                <strong>{destacado.animales.length}</strong>
                <span>animales</span>
              </div>
            </div>
            <Link className="button button-light button-full" to={`/ofertas/${destacado.id}`}>
              Ver este lote <span aria-hidden="true">→</span>
            </Link>
          </aside>
        )}
      </section>

      <section className="section" id="lotes">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LOTES DISPONIBLES</p>
            <h2>Elegí tu próximo lote</h2>
          </div>
          <Link className="text-link" to="/ofertas">
            Ver todas las ofertas →
          </Link>
        </div>
        {lotes.length ? (
          <ul className="ofertas-grid ofertas-grid-inicio">
            {lotes.map((lote) => (
              <li key={lote.id}>
                <TarjetaOferta lote={lote} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">Todavía no hay animales exportables a la UE publicados.</p>
        )}
      </section>

      {vendedor && <TuRodeo />}

      <section className="section" id="como-comprar">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CÓMO FUNCIONA</p>
            <h2>De la oferta a la compra, sin sorpresas</h2>
          </div>
        </div>
        <ol className="pasos">
          {PASOS.map((paso) => (
            <li key={paso.titulo}>
              <h3>{paso.titulo}</h3>
              <p>{paso.texto}</p>
            </li>
          ))}
        </ol>
        <div className="cta-final">
          <div>
            <h3>Encontrá el ganado que buscás</h3>
            <p>Todas las ofertas, con el detalle de cada animal y su recorrido.</p>
          </div>
          <Link className="button button-primary" to="/ofertas">
            Ir a las ofertas <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <Notice />
    </Layout>
  );
}
