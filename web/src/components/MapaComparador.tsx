import "leaflet/dist/leaflet.css";
import { Fragment, useEffect, useRef, useState, type RefObject } from "react";
import { CircleMarker, MapContainer, Polygon, Polyline, TileLayer, Tooltip, useMap, useMapEvent } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import type { Parada } from "../types";
import { zonaDeforestada } from "../lib/ofertas";

const SAT_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const SAT_ATTR = "Imágenes © Esri, Maxar, Earthstar Geographics";
const SWIPE_INICIAL = 35; // deja a la vista la zona de deforestación al abrir la ficha

interface Props {
  paradas: Parada[];
  destino: { nombre: string; lat: number; lng: number };
}

type Espejo = RefObject<LeafletMap | null>;

// Registra el mapa de deforestación para que el mapa de recorrido pueda mover su vista.
function RegistrarEspejo({ espejo }: { espejo: Espejo }) {
  const mapa = useMap();
  useEffect(() => {
    espejo.current = mapa;
    return () => {
      espejo.current = null;
    };
  }, [mapa, espejo]);
  return null;
}

// Al moverse el mapa de recorrido, el de deforestación sigue la misma vista.
function SincronizarVista({ espejo }: { espejo: Espejo }) {
  const mapa = useMap();
  useMapEvent("move", () => {
    espejo.current?.setView(mapa.getCenter(), mapa.getZoom(), { animate: false });
  });
  return null;
}

export function MapaComparador({ paradas, destino }: Props) {
  const [swipe, setSwipe] = useState(SWIPE_INICIAL);
  const espejo = useRef<LeafletMap | null>(null);

  const puntos: [number, number][] = [...paradas.map((p) => [p.lat, p.lng] as [number, number]), [destino.lat, destino.lng]];
  const limites = { bounds: puntos, boundsOptions: { padding: [40, 40] as [number, number] } };

  return (
    <>
      <div className="comparador">
        <MapContainer className="mapa" {...limites} scrollWheelZoom={false} attributionControl>
          <TileLayer url={SAT_URL} attribution={SAT_ATTR} maxZoom={18} />
          <Polyline positions={puntos} pathOptions={{ color: "#f1ead8", weight: 3, dashArray: "7 8", opacity: 0.95 }} />
          {paradas.map((parada) => (
            <CircleMarker
              key={`${parada.tipo}-${parada.desde}`}
              center={[parada.lat, parada.lng]}
              radius={9}
              pathOptions={{ color: "#fff", weight: 2, fillColor: "#214332", fillOpacity: 1 }}
            >
              <Tooltip>{`${parada.tipo}: ${parada.establecimiento}`}</Tooltip>
            </CircleMarker>
          ))}
          <CircleMarker
            center={[destino.lat, destino.lng]}
            radius={8}
            pathOptions={{ color: "#fff", weight: 2, fillColor: "#98602d", fillOpacity: 1 }}
          >
            <Tooltip>{`Destino: ${destino.nombre}`}</Tooltip>
          </CircleMarker>
          <SincronizarVista espejo={espejo} />
        </MapContainer>

        {/* El clip va en un div propio: MapContainer copia su style al montar y no lo actualiza al mover el slider. */}
        <div className="mapa-top" style={{ clipPath: `inset(0 0 0 ${swipe}%)` }}>
          <MapContainer
            className="mapa"
            {...limites}
            zoomControl={false}
            attributionControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
          >
            <TileLayer url={SAT_URL} maxZoom={18} />
            {/* El recorrido también va en esta capa, así se ve la ruta en cualquier posición del deslizador. */}
            <Polyline positions={puntos} pathOptions={{ color: "#f1ead8", weight: 2, dashArray: "7 8", opacity: 0.8 }} />
            {paradas.map((parada) => {
              const clave = `${parada.tipo}-${parada.desde}`;
              const alerta = parada.deforestacion.alerta;
              return (
                <Fragment key={clave}>
                  {parada.deforestacion.alerta && (
                    <Polygon
                      positions={zonaDeforestada(parada.lat, parada.lng, parada.deforestacion.hectareas)}
                      pathOptions={{ color: "#ff7a57", weight: 2, fillColor: "#c2402a", fillOpacity: 0.6 }}
                    >
                      <Tooltip>{`Deforestación simulada: ${parada.deforestacion.hectareas} ha (${parada.deforestacion.anio})`}</Tooltip>
                    </Polygon>
                  )}
                  <CircleMarker
                    center={[parada.lat, parada.lng]}
                    radius={9}
                    pathOptions={{ color: "#fff", weight: 2, fillColor: alerta ? "#c2402a" : "#4f8a5f", fillOpacity: 1 }}
                  >
                    <Tooltip>{alerta ? `Alerta de deforestación: ${parada.establecimiento}` : `Sin alerta: ${parada.establecimiento}`}</Tooltip>
                  </CircleMarker>
                </Fragment>
              );
            })}
            <CircleMarker
              center={[destino.lat, destino.lng]}
              radius={8}
              pathOptions={{ color: "#fff", weight: 2, fillColor: "#98602d", fillOpacity: 1 }}
            >
              <Tooltip>{`Destino: ${destino.nombre}`}</Tooltip>
            </CircleMarker>
            <RegistrarEspejo espejo={espejo} />
          </MapContainer>
        </div>

        <div className="swipe-line" style={{ left: `${swipe}%` }} aria-hidden="true" />
      </div>

      <div className="swipe-control">
        <label htmlFor="swipe">Deslizar para comparar</label>
        <input id="swipe" type="range" min={0} max={100} value={swipe} onChange={(event) => setSwipe(Number(event.target.value))} />
        <div className="swipe-labels">
          <span>Recorrido</span>
          <span>Deforestación</span>
        </div>
      </div>
    </>
  );
}
