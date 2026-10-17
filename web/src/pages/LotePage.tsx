import { Link, Navigate, useParams } from "react-router-dom";
import { Badge } from "../components/Badge";
import { EstadoDatos } from "../components/EstadoDatos";
import { Layout } from "../components/Layout";
import { ImagenLote } from "../components/lote/ImagenLote";
import { formatDate, moneda, numero } from "../lib/format";
import { alertasDe, buscarLote, esAptoUE, pesoTotal, valorLote } from "../lib/ofertas";
import { esVendedor } from "../lib/sesion";
import { useLotes } from "../lib/senasa";

export function LotePage() {
  const { loteId = "" } = useParams();
  const { lotes, error, recargar } = useLotes();
  if (!lotes) return <EstadoDatos error={error} />;
  const lote = buscarLote(lotes, loteId);
  if (!lote) return <Navigate to="/ofertas" replace />;
  const vendedor = esVendedor();

  return (
    <Layout>
      <nav className="breadcrumb" aria-label="Ubicación">
        <Link to="/ofertas">Todas las ofertas</Link>
        <span aria-hidden="true">/</span>
        <span>{lote.id}</span>
      </nav>

      <header className="oferta-head">
        <div>
          <p className="eyebrow">
            {lote.id} · PUBLICADO {formatDate(lote.publicado)}
          </p>
          <h2 tabIndex={-1}>{lote.titulo}</h2>
          <p className="section-intro">
            {lote.provincia} · {lote.productor} · destino {lote.frigorifico.nombre}
          </p>
        </div>
        <dl className="oferta-resumen">
          <div>
            <dt>Peso total</dt>
            <dd>{numero.format(pesoTotal(lote))} kg</dd>
          </div>
          <div>
            <dt>Precio por kg</dt>
            <dd>{moneda.format(lote.precioKg)}</dd>
          </div>
          <div>
            <dt>Valor estimado</dt>
            <dd>{moneda.format(valorLote(lote))}</dd>
          </div>
        </dl>
      </header>

      {lote.imagenUrl && <img className="lote-imagen" src={lote.imagenUrl} alt={`Foto del lote ${lote.titulo}`} />}
      {vendedor && <ImagenLote lote={lote} onSubida={recargar} />}

      <div className="table-wrap panel">
        <table>
          <thead>
            <tr>
              <th scope="col">Animal</th>
              <th scope="col">Categoría</th>
              <th scope="col">Peso</th>
              <th scope="col">Identificación</th>
              <th scope="col">Elegibilidad UE</th>
              <th scope="col">Deforestación</th>
            </tr>
          </thead>
          <tbody>
            {lote.animales.map((animal) => {
              const alertas = alertasDe(animal).length;
              return (
                <tr key={animal.id}>
                  <td>
                    <Link className="animal-link" to={`/ofertas/animal/${animal.id}`}>
                      {animal.id}
                    </Link>
                  </td>
                  <td>
                    {animal.categoria} · {animal.sexo}
                  </td>
                  <td>{numero.format(animal.pesoKg)} kg</td>
                  <td>{animal.identificacion}</td>
                  <td>
                    <Badge nivel={esAptoUE(animal) ? "ok" : "warn"}>es_apto_ue: {String(esAptoUE(animal))}</Badge>
                  </td>
                  <td>{alertas ? <Badge nivel="bad">{alertas} alerta(s)</Badge> : <Badge nivel="ok">Sin alertas</Badge>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="disclaimer">La elegibilidad UE es una regla simple del prototipo (estado sanitario Aprobado), no una certificación.</p>
    </Layout>
  );
}
