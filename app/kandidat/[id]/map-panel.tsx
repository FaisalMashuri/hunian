"use client";

import dynamic from "next/dynamic";
import type { LatLng } from "./map-leaflet";

// Leaflet butuh `window` → load tanpa SSR. Wrapper ini client component, jadi ssr:false valid.
const MapLeaflet = dynamic(() => import("./map-leaflet"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-zinc-100" />,
});

export function MapPanel({
  home,
  dest,
  distanceKm,
  durationMin,
  modeLabel = "Motor",
  route,
  error,
}: {
  home: LatLng | null;
  dest: LatLng | null;
  distanceKm: number | null;
  durationMin?: number | null;
  modeLabel?: string;
  route?: { lat: number; lng: number }[];
  error?: string | null;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E4E3DF] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#E4E3DF] px-[18px] py-3.5">
        <h3 className="flex items-center gap-2 text-[13px] font-bold text-zinc-900">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></svg>
          Jarak ke Tujuan
        </h3>
        {dest && <span className="truncate text-[12px] text-zinc-500">{dest.label}</span>}
      </div>

      {home ? (
        <div className="h-56 w-full sm:h-[280px]">
          <MapLeaflet home={home} dest={dest} route={route} />
        </div>
      ) : (
        <div className="m-[18px] rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center">
          <p className="text-sm font-medium text-zinc-600">Peta belum tersedia</p>
          <p className="mt-1 text-xs text-zinc-400">{error ?? "Alamat kandidat belum bisa dipetakan."}</p>
        </div>
      )}

      {home && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-[#E4E3DF] px-[18px] py-3 text-[12.5px] text-zinc-500">
          {durationMin != null && (
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              {modeLabel} (estimasi)
              <span className="font-semibold tabular-nums text-zinc-900">~{durationMin} mnt</span>
            </span>
          )}
          {distanceKm != null && (
            <span className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" /></svg>
              Jarak jalan
              <span className="font-semibold tabular-nums text-zinc-900">{distanceKm} km</span>
            </span>
          )}
          <span className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-teal-700" /> Hunian</span>
            {dest ? (
              <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-[#e8621a]" /> Tujuanmu</span>
            ) : (
              <span className="text-amber-600">Tujuan belum dipetakan</span>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
