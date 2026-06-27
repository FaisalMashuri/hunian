"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Poi, PoiCategory } from "@/lib/maps/poi";

export type PoiFocus = { lat: number; lng: number; key: number } | null;

// Pin properti (teal) — pola sama map-leaflet.tsx.
const HOME_ICON = L.divIcon({
  className: "",
  html: `<div style="width:30px;height:30px;background:#0f766e;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:14px">🏠</span></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

function poiIcon(emoji: string, dim: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="width:26px;height:26px;background:#fff;border:2px solid #fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 1px 5px rgba(0,0,0,.2);opacity:${dim ? 0.25 : 1}">${emoji}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

function FitToPois({ home, pois }: { home: { lat: number; lng: number }; pois: Poi[] }) {
  const map = useMap();
  useEffect(() => {
    const pts: [number, number][] = [[home.lat, home.lng], ...pois.map((p) => [p.lat, p.lng] as [number, number])];
    if (pts.length === 1) {
      map.setView(pts[0], 15);
    } else {
      map.fitBounds(L.latLngBounds(pts), { padding: [36, 36], maxZoom: 16 });
    }
  }, [map, home, pois]);
  return null;
}

function FocusOnClick({ focus }: { focus: PoiFocus }) {
  const map = useMap();
  useEffect(() => {
    if (focus) map.setView([focus.lat, focus.lng], 17, { animate: true });
  }, [map, focus]);
  return null;
}

export default function PoiMap({
  home,
  pois,
  activeCat,
  focus,
}: {
  home: { lat: number; lng: number };
  pois: Poi[];
  activeCat: PoiCategory | "all";
  focus: PoiFocus;
}) {
  return (
    <MapContainer center={[home.lat, home.lng]} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }} className="z-0">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[home.lat, home.lng]} icon={HOME_ICON}>
        <Popup>Hunian ini</Popup>
      </Marker>
      {pois.map((p) => {
        const dim = activeCat !== "all" && p.category !== activeCat;
        return (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={poiIcon(p.emoji, dim)} opacity={dim ? 0.4 : 1}>
            <Popup>
              <strong>{p.name}</strong>
              {p.sub} · {p.distanceKm.toLocaleString("id-ID")} km
            </Popup>
          </Marker>
        );
      })}
      <FitToPois home={home} pois={pois} />
      <FocusOnClick focus={focus} />
    </MapContainer>
  );
}
