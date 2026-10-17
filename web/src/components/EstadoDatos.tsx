import { Layout } from "./Layout";

// Mientras llegan los datos de SENASA, o si no se pudieron cargar.
export function EstadoDatos({ error }: { error?: string }) {
  return (
    <Layout>
      <section className="section">
        <p className="eyebrow">{error ? "ERROR DE DATOS" : "CARGANDO"}</p>
        <p className="section-intro" role={error ? "alert" : "status"}>
          {error ?? "Cargando lotes desde el backend…"}
        </p>
      </section>
    </Layout>
  );
}
