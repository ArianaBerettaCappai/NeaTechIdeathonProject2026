import { Link } from "react-router-dom";
import { moneda, numero } from "../lib/format";
import { esAptoUE, pesoTotal, valorLote } from "../lib/ofertas";
import type { Lote } from "../types";
import { Badge } from "./Badge";

export function TarjetaOferta({ lote }: { lote: Lote }) {
  const todosAptos = lote.animales.every(esAptoUE);
  return (
    <Link className="oferta-card" to={`/ofertas/${lote.id}`}>
      {lote.imagenUrl && <img className="oferta-imagen" src={lote.imagenUrl} alt={`Foto del lote ${lote.titulo}`} loading="lazy" />}
      <span className="oferta-top">
        <span className="oferta-code">{lote.id}</span>
        <Badge nivel={todosAptos ? "ok" : "warn"}>{todosAptos ? "Apto UE" : "Revisar"}</Badge>
      </span>
      <h3>{lote.titulo}</h3>
      <p className="oferta-origen">
        {lote.provincia} · {lote.productor}
      </p>
      <p className="oferta-peso">
        <strong>{numero.format(pesoTotal(lote))}</strong> kg <span>{lote.animales.length} animales</span>
      </p>
      <span className="oferta-foot">
        <span>
          <small>Precio por kg</small>
          {moneda.format(lote.precioKg)}
        </span>
        <span>
          <small>Valor estimado</small>
          {moneda.format(valorLote(lote))}
        </span>
      </span>
      <span className="oferta-ver">
        Ver lote <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}
