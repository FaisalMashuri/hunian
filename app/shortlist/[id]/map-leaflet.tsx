"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type LatLng = { lat: number; lng: number; label: string };

// Ikon marker custom (divIcon) — hindari ikon default Leaflet yang sering broken di bundler.
function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<div style="width:18px;height:18px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 18],
    popupAnchor: [0, -16],
  });
}

const HOME_ICON = pinIcon("#0f766e"); // teal-700 — hunian
const DEST_ICON = pinIcon("#e8621a"); // oranye — tujuan

function FitBounds({ points }: { points: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15);
    } else if (points.length > 1) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, [map, points]);
  return null;
}

export default function MapLeaflet({
  home,
  dest,
  route,
}: {
  home: LatLng;
  dest: LatLng | null;
  route?: { lat: number; lng: number }[];
}) {
  const points = dest ? [home, dest] : [home];
  const hasRoute = !!route && route.length > 1;
  return (
    <MapContainer
      center={[home.lat, home.lng]}
      zoom={14}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[home.lat, home.lng]} icon={HOME_ICON}>
        <Popup>{home.label}</Popup>
      </Marker>
      {dest && (
        <>
          <Marker position={[dest.lat, dest.lng]} icon={DEST_ICON}>
            <Popup>{dest.label}</Popup>
          </Marker>
          {hasRoute ? (
            // Garis mengikuti jalan (Directions API).
            <Polyline
              positions={route!.map((p) => [p.lat, p.lng] as [number, number])}
              pathOptions={{ color: "#0f766e", weight: 4, opacity: 0.85 }}
            />
          ) : (
            // Fallback: garis lurus penghubung (rute belum tersedia).
            <Polyline
              positions={[
                [home.lat, home.lng],
                [dest.lat, dest.lng],
              ]}
              pathOptions={{ color: "#0f766e", weight: 2, dashArray: "6 6", opacity: 0.7 }}
            />
          )}
        </>
      )}
      <FitBounds points={points} />
    </MapContainer>
  );
}
