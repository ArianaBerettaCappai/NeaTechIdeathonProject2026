import { Link, Navigate, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { EstadoDatos } from "../components/EstadoDatos";
import { Layout } from "../components/Layout";
import { MapaComparador } from "../components/MapaComparador";
import { formatDate, moneda, numero } from "../lib/format";
import { alertasDe, buscarAnimal, esAptoUE, visiblesPara } from "../lib/ofertas";
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
  const alertas = alertasDe(animal);

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
          <p className="section-intro">
            {animal.categoria} {animal.raza} · {animal.sexo}
          </p>
        </div>
        <span className="oferta-precio">
          {moneda.format(lote.precioKg)} <small>por kg</small>
        </span>
      </header>

      <dl className="ficha-grid">
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
          <dt>Peso</dt>
          <dd>{numero.format(animal.pesoKg)} kg</dd>
        </div>
        <div>
          <dt>Estado sanitario</dt>
          <dd>{animal.estado_sanitario}</dd>
        </div>
        <div>
          <dt>es_apto_ue</dt>
          <dd>
            <Badge nivel={esAptoUE(animal) ? "ok" : "warn"}>{String(esAptoUE(animal))}</Badge>
          </dd>
        </div>
      </dl>

      <section className="mapas-panel" aria-labelledby="mapasTitulo">
        <div className="panel-heading">
          <div>
            <h3 id="mapasTitulo">Recorrido de crianza y deforestación</h3>
            <p>
              {alertas.length
                ? `Hubo deforestación detectada en ${alertas.length} de ${animal.paradas.length} establecimientos del recorrido.`
                : "No se detectó deforestación en los establecimientos del recorrido."}
            </p>
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
              {parada.deforestacion.alerta ? (
                <Badge nivel="bad">
                  Deforestación: {parada.deforestacion.hectareas} ha ({parada.deforestacion.anio})
                </Badge>
              ) : (
                <Badge nivel="ok">Sin alerta de deforestación</Badge>
              )}
            </li>
          ))}
        </ol>
        <p className="disclaimer">Las zonas de deforestación son ilustrativas, no a escala, y no provienen de un sistema satelital real.</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Sanidad</h3>
            <p>Documentos sanitarios declarados para el animal.</p>
          </div>
        </div>
        <ul className="gap-list">
          {animal.sanidad.map((doc) => (
            <li key={doc.documento}>
              {doc.tipo} · {doc.documento} · vence {formatDate(doc.vence)}
            </li>
          ))}
        </ul>
      </section>
    </Layout>
  );
}
