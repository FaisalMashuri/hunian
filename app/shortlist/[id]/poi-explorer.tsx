"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import type { Poi, PoiCategory } from "@/lib/maps/poi";
import type { PoiFocus } from "./poi-map";

const PoiMap = dynamic(() => import("./poi-map"), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full animate-pulse bg-zinc-100" />,
});

// Urutan + label chip filter. Hanya kategori yang ada isinya yang ditampilkan.
const CAT_META: Record<PoiCategory, { label: string; emoji: string }> = {
  transport: { label: "Transportasi", emoji: "🚌" },
  grocery: { label: "Belanja", emoji: "🛒" },
  health: { label: "Kesehatan", emoji: "🏥" },
  education: { label: "Pendidikan", emoji: "🏫" },
  worship: { label: "Ibadah", emoji: "🕌" },
  dining: { label: "Kuliner", emoji: "🍜" },
  highway: { label: "Tol", emoji: "🛣️" },
};
const CAT_ORDER: PoiCategory[] = ["transport", "grocery", "health", "education", "worship", "dining", "highway"];

const km = (v: number) => v.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// Warna jarak: ≤0,5 km hijau · ≤1,5 km amber · >1,5 km rose.
function distTone(d: number): { text: string; badge: string; label: string } {
  if (d <= 0.5) return { text: "text-emerald-600", badge: "bg-emerald-50 text-emerald-700", label: "Sangat dekat" };
  if (d <= 1.5) return { text: "text-amber-600", badge: "bg-amber-50 text-amber-700", label: "Cukup dekat" };
  return { text: "text-rose-600", badge: "bg-rose-50 text-rose-700", label: "Agak jauh" };
}

function estLabel(p: Poi): string {
  if (p.routeMin != null) return `~${p.routeMin} mnt berkendara`; // rute asli (S2-7)
  if (p.walkMin != null) return `~${p.walkMin} mnt jalan`;
  if (p.motorMin != null) return `~${p.motorMin} mnt motor`;
  return "";
}

export function PoiExplorer({ pois, home }: { pois: Poi[]; home: { lat: number; lng: number } }) {
  const [activeCat, setActiveCat] = useState<PoiCategory | "all">("all");
  const [focus, setFocus] = useState<PoiFocus>(null);

  const presentCats = useMemo(() => CAT_ORDER.filter((c) => pois.some((p) => p.category === c)), [pois]);
  const visible = useMemo(
    () => (activeCat === "all" ? pois : pois.filter((p) => p.category === activeCat)),
    [pois, activeCat],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E3DF] bg-white shadow-sm">
      {/* PETA */}
      <div className="h-[260px] w-full sm:h-[300px]">
        <PoiMap home={home} pois={pois} activeCat={activeCat} focus={focus} />
      </div>

      {/* FILTER KATEGORI */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#E4E3DF] px-3 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterChip active={activeCat === "all"} onClick={() => setActiveCat("all")}>
          Semua
        </FilterChip>
        {presentCats.map((c) => (
          <FilterChip key={c} active={activeCat === c} onClick={() => setActiveCat(c)}>
            {CAT_META[c].emoji} {CAT_META[c].label}
          </FilterChip>
        ))}
      </div>

      {/* LIST */}
      <div className="max-h-[300px] overflow-y-auto">
        {visible.map((p) => {
          const d = p.routeKm ?? p.distanceKm; // utamakan jarak tempuh jalan asli (S2-7)
          const tone = distTone(d);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setFocus({ lat: p.lat, lng: p.lng, key: Date.now() })}
              className="flex w-full items-center gap-3 border-b border-[#E4E3DF] px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-[#FAFAF9]"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[#F4F3F0] text-[17px]">{p.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-zinc-900">{p.name}</span>
                <span className="block text-[11.5px] text-zinc-400">{p.sub}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className={`block text-[13px] font-semibold tabular-nums ${tone.text}`}>
                  {km(d)} km
                  {p.routeKm != null && <span className="ml-1 align-middle text-[9.5px] font-bold uppercase tracking-wide text-teal-600">rute</span>}
                </span>
                {estLabel(p) && <span className="block text-[11px] text-zinc-400">{estLabel(p)}</span>}
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${tone.badge}`}>{tone.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* NOTA */}
      <div className="border-t border-[#E4E3DF] bg-[#FAFAF9] px-4 py-2 text-[11px] text-zinc-400">
        Bertanda <span className="font-bold uppercase tracking-wide text-teal-600">rute</span> = jarak tempuh jalan asli (Google); sisanya garis lurus (estimasi). Data fasilitas dari OpenStreetMap.
      </div>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors ${
        active ? "border-teal-700 bg-teal-700 font-semibold text-white" : "border-[#E4E3DF] bg-white text-zinc-500 hover:text-zinc-900"
      }`}
    >
      {children}
    </button>
  );
}
