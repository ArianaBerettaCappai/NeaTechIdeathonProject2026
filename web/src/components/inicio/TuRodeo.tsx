import { numero } from "../../lib/format";
import { esAptoUE } from "../../lib/ofertas";
import type { ProductorRodeo } from "../../types";
import { Badge } from "../Badge";

// Panel del vendedor: todo el rodeo del dataset agrupado por productor, con el motivo de cada animal no exportable.
export function TuRodeo({ productores }: { productores: ProductorRodeo[] }) {
  return (
    <section className="section" id="tu-rodeo" aria-labelledby="tuRodeoTitulo">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PANEL DEL PRODUCTOR</p>
          <h2 id="tuRodeoTitulo">Tu rodeo</h2>
        </div>
      </div>

      <div className="rodeo-grid">
        {productores.map((productor) => {
          const exportables = productor.animales.filter(esAptoUE).length;
          return (
            <article className="panel rodeo-productor" key={productor.cuit}>
              <div className="panel-heading">
                <div>
                  <h3>{productor.nombre}</h3>
                  <p>
                    CUIT {productor.cuit} · {productor.provincia}
                  </p>
                </div>
                <Badge nivel="neutral">
                  {exportables}/{productor.animales.length} exportables
                </Badge>
              </div>

              {productor.animales.length ? (
                <ul className="rodeo-lista">
                  {productor.animales.map((animal) => {
                    const apto = esAptoUE(animal);
                    return (
                      <li className="rodeo-animal" key={animal.id}>
                        <div className="rodeo-animal-top">
                          <div>
                            <strong>{animal.id}</strong>
                            <small>
                              {animal.categoria} · {numero.format(animal.pesoKg)} kg
                            </small>
                          </div>
                          <Badge nivel={apto ? "ok" : "warn"}>{apto ? "Exportable" : "No exportable"}</Badge>
                        </div>
                        {!apto && (
                          <ul className="rodeo-motivos">
                            {animal.motivosNoExportable.map((motivo) => (
                              <li key={motivo}>{motivo}</li>
                            ))}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="form-hint">Este productor no tiene animales registrados.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
