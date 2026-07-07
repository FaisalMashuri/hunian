"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { worthMeta } from "@/lib/scoring/worth-it";
import type { MapItem, Office } from "./types";

// Pin teardrop (SVG) — ujung bawah = titik geo. `inner` = isi kepala pin (titik / gedung).
function pinSvg(fill: string, inner: string) {
  return `<svg width="32" height="40" viewBox="0 0 24 30" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .8C6 .8 1.2 5.6 1.2 11.6c0 7.6 9.3 16.3 10.2 17.1a.9.9 0 0 0 1.2 0c.9-.8 10.2-9.5 10.2-17.1C22.8 5.6 18 .8 12 .8Z" fill="${fill}" stroke="#fff" stroke-width="1.5"/>
    ${inner}
  </svg>`;
}

// Ring pulse (dua lapis, staggered) memancar dari kepala pin.
function rings(color: string) {
  return `<span class="hn-mk__ring" style="--hn-c:${color}"></span><span class="hn-mk__ring hn-mk__ring--2" style="--hn-c:${color}"></span>`;
}

function markerHtml(pinFill: string, inner: string, pill: { bg: string; fg: string; label: string; active: boolean }, pulse: boolean) {
  const pinCls = `hn-mk__pin${pulse ? " hn-mk__pin--pop" : ""}`;
  const pillCls = `hn-mk__pill${pill.active ? " hn-mk__pill--active" : ""}`;
  return `<div class="hn-mk">
    ${pulse ? rings(pinFill) : ""}
    <div class="${pinCls}">${pinSvg(pinFill, inner)}</div>
    <div class="${pillCls}" style="background:${pill.bg};color:${pill.fg}">${pill.label}</div>
  </div>`;
}

// Marker hunian: pin teal + titik oranye (default) / pin oranye + titik putih (terpilih, pulse).
function itemIcon(item: MapItem, selected: boolean) {
  const m = worthMeta(item.score);
  const pinFill = selected ? "#e8621a" : "#0f766e";
  const dot = selected ? "#ffffff" : "#e8621a";
  const inner = `<circle cx="12" cy="11.6" r="4.4" fill="${dot}"/>`;
  const label = item.score == null ? "Perlu Data" : `${m.label} – ${Math.round(item.score)}`;
  return L.divIcon({
    className: "",
    html: markerHtml(pinFill, inner, { bg: selected ? "#e8621a" : m.pillBg, fg: selected ? "#ffffff" : m.pillText, label, active: selected }, selected),
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

// Kantor: pin oranye + ikon gedung putih, selalu pulse.
function officeIcon() {
  const c = "#e8621a";
  const building = `<rect x="8.4" y="8" width="7.2" height="7.6" rx="0.9" fill="#fff"/>
    <rect x="9.6" y="9.5" width="1.5" height="1.5" rx=".2" fill="${c}"/>
    <rect x="12.9" y="9.5" width="1.5" height="1.5" rx=".2" fill="${c}"/>
    <rect x="11" y="12.4" width="2" height="3.2" fill="${c}"/>`;
  return L.divIcon({
    className: "",
    html: markerHtml(c, building, { bg: c, fg: "#ffffff", label: "Kantor Saya", active: false }, true),
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function FitBounds({ pts }: { pts: [number, number][] }) {
  const map = useMap();
  // Kunci berdasarkan ISI koordinat, bukan identitas array → tak refit saat klik marker.
  const key = pts.map((p) => `${p[0].toFixed(5)},${p[1].toFixed(5)}`).join("|");
  useEffect(() => {
    if (pts.length === 1) map.setView(pts[0], 14);
    else if (pts.length > 1) map.fitBounds(L.latLngBounds(pts), { padding: [70, 70], maxZoom: 15 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export type Basemap = "voyager" | "positron" | "dark";

const BASEMAPS: Record<Basemap, { url: string }> = {
  voyager: { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" },
  positron: { url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" },
  dark: { url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" },
};

export default function PetaLeaflet({
  items,
  office,
  selectedId,
  onSelect,
  basemap = "voyager",
}: {
  items: MapItem[];
  office: Office | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  basemap?: Basemap;
}) {
  const pts: [number, number][] = [
    ...items.map((i) => [i.lat, i.lng] as [number, number]),
    ...(office ? [[office.lat, office.lng] as [number, number]] : []),
  ];
  const center: [number, number] = pts[0] ?? [-6.2088, 106.8456]; // fallback Jakarta
  const selected = items.find((i) => i.id === selectedId) ?? null;

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom style={{ height: "100%", width: "100%" }} className="z-0" zoomControl={false}>
      {/* Basemap CARTO (Voyager/Positron/Dark) — bersih & soft. key → swap saat basemap ganti.
          detectRetina + {r} → tile @2x tajam di layar HiDPI. */}
      <TileLayer
        key={basemap}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={BASEMAPS[basemap].url}
        subdomains="abcd"
        detectRetina
      />

      {/* Rute hunian terpilih → kantor (dari DB; fallback garis lurus putus-putus). */}
      {selected && office && (
        selected.route && selected.route.length > 1 ? (
          <Polyline positions={selected.route.map((p) => [p.lat, p.lng] as [number, number])} pathOptions={{ color: "#0f766e", weight: 4, opacity: 0.85 }} />
        ) : (
          <Polyline positions={[[selected.lat, selected.lng], [office.lat, office.lng]]} pathOptions={{ color: "#0f766e", weight: 2.5, opacity: 0.65, dashArray: "6 7" }} />
        )
      )}

      {office && <Marker position={[office.lat, office.lng]} icon={officeIcon()} zIndexOffset={1000} />}
      {items.map((i) => (
        <Marker
          key={i.id}
          position={[i.lat, i.lng]}
          icon={itemIcon(i, i.id === selectedId)}
          zIndexOffset={i.id === selectedId ? 2000 : 0}
          eventHandlers={{ click: () => onSelect(i.id) }}
        />
      ))}
      {pts.length > 0 && <FitBounds pts={pts} />}
    </MapContainer>
  );
}
