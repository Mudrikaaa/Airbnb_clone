"use client";

// Loaded only in the browser (see LocationSection): Leaflet touches `window` on import.
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer } from "react-leaflet";

// Airbnb-style marker: a black circle with a white house, instead of Leaflet's default pin
// (whose image paths also break under bundlers).
const HOME_ICON = L.divIcon({
  className: "",
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  html: `<div style="width:48px;height:48px;border-radius:9999px;background:#222;display:grid;place-items:center;box-shadow:0 6px 16px rgba(0,0,0,.25)">
    <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 3 2 11.5h3V21h5.5v-6h3v6H19v-9.5h3z"/></svg>
  </div>`,
});

export default function ListingMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer center={[lat, lng]} zoom={13} scrollWheelZoom={false} className="h-full w-full">
      {/* CARTO "Voyager" tiles: OpenStreetMap data with a light style close to Airbnb's map. */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <Marker position={[lat, lng]} icon={HOME_ICON} />
    </MapContainer>
  );
}
