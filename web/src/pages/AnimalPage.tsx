import { Link, Navigate, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { EstadoDatos } from "../components/EstadoDatos";
import { Layout } from "../components/Layout";
import { MapaComparador } from "../components/MapaComparador";
import { formatDate, moneda, numero } from "../lib/format";
import { buscarAnimal, tipoDeBovino, visiblesPara } from "../lib/ofertas";
import { esVendedor } from "../lib/sesion";
import { useLotes } from "../lib/senasa";

export function AnimalPage() {
  const { animalId = "" } = useParams();
  const { lotes, error } = useLotes();
  const vendedor = esVendedor();
  if (!lotes) return <EstadoDatos error={error} />;
  const encontrado = buscarAnimal(visiblesPara(lotes, vendedor), animalId);
  if (!encontrado) return <Navigate to="/ofertas" replace />;
  const { lote, animal } = encontrado;

  return (
    <Layout>
      <nav className="breadcrumb" aria-label="Ubicación">
        <Link to="/ofertas">Todas las ofertas</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/ofertas/${lote.id}`}>{lote.id}</Link>
        <span aria-hidden="true">/</span>
        <span>{animal.id}</span>
      </nav>

      <header className="oferta-head">
        <div>
          <p className="eyebrow">FICHA INDIVIDUAL · {lote.id}</p>
          <h2 tabIndex={-1}>{animal.id}</h2>
          <p className="section-intro">{tipoDeBovino(animal)}</p>
        </div>
        <span className="oferta-precio">
          {moneda.format(lote.precioKg)} <small>por kg</small>
        </span>
      </header>

      <dl className="ficha-grid">
        <div>
          <dt>Tipo de bovino</dt>
          <dd>{tipoDeBovino(animal)}</dd>
        </div>
        <div>
          <dt>Peso estimado</dt>
          <dd>
            {numero.format(animal.pesoMinKg)}–{numero.format(animal.pesoMaxKg)} kg
          </dd>
        </div>
        <div>
          <dt>Identificación</dt>
          <dd>{animal.identificacion}</dd>
        </div>
        <div>
          <dt>Titular declarado</dt>
          <dd>{animal.titular}</dd>
        </div>
        <div>
          <dt>Nacimiento</dt>
          <dd>{formatDate(animal.nacimiento)}</dd>
        </div>
        <div>
          <dt>Estado sanitario</dt>
          <dd>{animal.estado_sanitario}</dd>
        </div>
      </dl>

      <section className="mapas-panel" aria-labelledby="mapasTitulo">
        <div className="panel-heading">
          <div>
            <h3 id="mapasTitulo">Recorrido de crianza y movimientos</h3>
            <p>Establecimientos por los que pasó el animal, hasta el frigorífico de destino.</p>
          </div>
          <Badge nivel="neutral">Capa simulada</Badge>
        </div>

        <MapaComparador paradas={animal.paradas} destino={lote.frigorifico} />

        <ol className="timeline">
          {animal.paradas.map((parada) => (
            <li key={`${parada.tipo}-${parada.desde}`}>
              <strong>
                {parada.tipo} · {parada.establecimiento}
              </strong>
              <small>
                {parada.provincia} · {formatDate(parada.desde)} → {formatDate(parada.hasta)}
              </small>
              <small>Documento: {parada.documento}</small>
            </li>
          ))}
        </ol>
        <p className="disclaimer">Las zonas de deforestación son ilustrativas, no a escala, y no provienen de un sistema satelital real.</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Vacunas</h3>
            <p>Vacunas registradas para el animal. Datos ficticios de demostración.</p>
          </div>
        </div>
        <ul className="gap-list">
          {animal.sanidad.map((doc) => (
            <li key={doc.documento}>
              {doc.tipo} · lote {doc.documento} · vence {formatDate(doc.vence)}
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
