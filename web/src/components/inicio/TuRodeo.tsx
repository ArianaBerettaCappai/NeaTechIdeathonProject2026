import { useState, type SyntheticEvent } from "react";
import { ErrorApi } from "../../lib/api";
import { numero } from "../../lib/format";
import { pedirRodeo, type RodeoProductor } from "../../lib/ofertasApi";
import { Badge } from "../Badge";

// Panel del vendedor: ingresa su CUIT y ve todo su rodeo. Los animales no exportables muestran por qué.
export function TuRodeo() {
  const [cuit, setCuit] = useState("");
  const [cargando, setCargando] = useState(false);
  const [rodeo, setRodeo] = useState<RodeoProductor | null>(null);
  const [error, setError] = useState("");

  const buscar = async (evento: SyntheticEvent) => {
    evento.preventDefault();
    setCargando(true);
    setError("");
    try {
      setRodeo(await pedirRodeo(cuit.trim()));
    } catch (err) {
      setRodeo(null);
      setError(err instanceof ErrorApi ? err.message : "No se pudo consultar el rodeo.");
    } finally {
      setCargando(false);
    }
  };

  const exportables = rodeo?.animales.filter((animal) => animal.exportable).length ?? 0;

  return (
    <section className="section" id="tu-rodeo" aria-labelledby="tuRodeoTitulo">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PANEL DEL PRODUCTOR</p>
          <h2 id="tuRodeoTitulo">Tu rodeo</h2>
          <p className="section-intro">Ingresá tu CUIT para ver todos tus animales y, si alguno no es exportable, por qué.</p>
        </div>
      </div>

      <form className="rodeo-buscar panel" onSubmit={buscar}>
        <label className="field-label" htmlFor="cuitRodeo">CUIT del productor</label>
        <div className="rodeo-buscar-fila">
          <input
            id="cuitRodeo"
            type="text"
            inputMode="numeric"
            placeholder="20-99999903-3"
            value={cuit}
            onChange={(evento) => setCuit(evento.target.value)}
          />
          <button className="button button-primary" type="submit" disabled={cargando || !cuit.trim()}>
            {cargando ? "Buscando…" : "Ver rodeo"}
          </button>
        </div>
        {error && <p className="form-message error" role="alert">{error}</p>}
      </form>

      {rodeo && (
        <article className="panel rodeo-productor">
          <div className="panel-heading">
            <div>
              <h3>{rodeo.productorNombre}</h3>
              <p>CUIT {rodeo.productorCuit}</p>
            </div>
            <Badge nivel="neutral">
              {exportables}/{rodeo.animales.length} exportables
            </Badge>
          </div>

          {rodeo.animales.length ? (
            <ul className="rodeo-lista">
              {rodeo.animales.map((animal) => (
                <li className="rodeo-animal" key={animal.animalCodigo}>
                  <div className="rodeo-animal-top">
                    <div>
                      <strong>{animal.animalCodigo}</strong>
                      <small>
                        {animal.categoria} · {animal.raza} · {animal.sexo === "M" ? "Macho" : "Hembra"} ·{" "}
                        {numero.format(animal.pesoKg)} kg
                      </small>
                    </div>
                    <Badge nivel={animal.exportable ? "ok" : "warn"}>
                      {animal.exportable ? "Exportable" : "No exportable"}
                    </Badge>
                  </div>
                  {!animal.exportable && (
                    <ul className="rodeo-motivos">
                      {animal.motivosNoExportable.map((motivo) => (
                        <li key={motivo}>{motivo}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="form-hint">Este productor no tiene animales registrados.</p>
          )}
        </article>
      )}
    </section>
  );
}
