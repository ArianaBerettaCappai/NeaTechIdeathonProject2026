import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Circle, Polygon, Polyline, CircleMarker, Tooltip } from "react-leaflet";

export const ORIGIN: [number, number] = [-36.62, -59.85];
const ZONE: [number, number][] = [
  [-36.56, -59.95], [-36.55, -59.76], [-36.66, -59.72], [-36.7, -59.88], [-36.64, -59.98],
];
export const PADDOCKS: { name: string; pos: [number, number]; months: string }[] = [
  { name: "Potrero La Aguada · Cría", pos: [-36.59, -59.92], months: "0–7 meses" },
  { name: "Potrero El Monte · Recría", pos: [-36.6, -59.84], months: "7–14 meses" },
  { name: "Potrero Los Sauces · Rotación", pos: [-36.65, -59.79], months: "14–20 meses" },
  { name: "Potrero La Loma · Terminación", pos: [-36.67, -59.87], months: "20–26 meses" },
];

export default function TraceMap({ mode }: { mode: "origin" | "route" }) {
  const green = "oklch(0.45 0.1 150)";
  const orange = "oklch(0.66 0.17 50)";
  return (
    <MapContainer center={ORIGIN} zoom={11} scrollWheelZoom={false} className="h-full w-full">
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {mode === "origin" ? (
        <>
          <Polygon positions={ZONE} pathOptions={{ color: green, fillColor: green, fillOpacity: 0.25, weight: 2 }}>
            <Tooltip sticky>Estancia La Esperanza · 1.240 ha</Tooltip>
          </Polygon>
          <Circle center={ORIGIN} radius={9000} pathOptions={{ color: green, dashArray: "6 6", fill: false, weight: 1.5 }} />
        </>
      ) : (
        <>
          <Polyline positions={PADDOCKS.map((p) => p.pos)} pathOptions={{ color: orange, weight: 3, dashArray: "8 8" }} />
          {PADDOCKS.map((p, i) => (
            <CircleMarker key={p.name} center={p.pos} radius={9}
              pathOptions={{ color: "white", weight: 3, fillColor: i === PADDOCKS.length - 1 ? orange : green, fillOpacity: 1 }}>
              <Tooltip direction="top">{`${i + 1}. ${p.name} (${p.months})`}</Tooltip>
            </CircleMarker>
          ))}
        </>
      )}
    </MapContainer>
  );
}
