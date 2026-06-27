import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { fetchNearbyPOIs, type Poi, type PoiCategory, type PoiResult, type PoiSummary } from "./poi";
import { getRoute } from "./directions";

// S2-7 — POI ter-cache per kandidat di `candidate_poi`.
// Tujuan ganda: (1) hindari hammer Overpass tiap muat (sumber HTTP 429); (2) simpan rute asli (Directions)
// untuk POI terpenting. Muat pertama → Overpass + Directions top-N → persist; muat berikutnya → dari DB.

const FRESH_MS = 30 * 24 * 60 * 60 * 1000; // POI jarang berubah → segarkan tiap 30 hari
const MAX_ROUTES = 6;
const SUMMARY_CATEGORIES = ["transport", "grocery", "health"] as const;

// candidate_poi tak menyimpan emoji/sub → rekonstruksi generik per kategori saat baca cache.
// (Muat pertama tetap pakai emoji/sub granular dari Overpass; nama POI selalu tersimpan utuh.)
const CAT_DEFAULT: Record<PoiCategory, { emoji: string; sub: string }> = {
  transport: { emoji: "🚌", sub: "Transportasi" },
  grocery: { emoji: "🛒", sub: "Belanja" },
  health: { emoji: "🏥", sub: "Kesehatan" },
  education: { emoji: "🏫", sub: "Pendidikan" },
  worship: { emoji: "🕌", sub: "Ibadah" },
  dining: { emoji: "🍜", sub: "Kuliner" },
  highway: { emoji: "🛣️", sub: "Tol" },
};

function estTimes(distanceKm: number): { walkMin: number | null; motorMin: number | null } {
  if (distanceKm < 1.2) return { walkMin: Math.max(1, Math.round((distanceKm / 5) * 60)), motorMin: null };
  return { walkMin: null, motorMin: Math.max(1, Math.round((distanceKm / 25) * 60)) };
}

type Row = {
  osm_id: string;
  category: string;
  name: string | null;
  lat: number;
  lng: number;
  straight_km: number;
  route_km: number | null;
  route_min: number | null;
  fetched_at: string;
};

function rowToPoi(r: Row): Poi {
  const category = r.category as PoiCategory;
  const meta = CAT_DEFAULT[category] ?? { emoji: "📍", sub: "Tempat" };
  const distanceKm = Number(r.straight_km);
  const { walkMin, motorMin } = estTimes(distanceKm);
  return {
    id: r.osm_id,
    name: r.name || meta.sub,
    sub: meta.sub,
    category,
    emoji: meta.emoji,
    lat: r.lat,
    lng: r.lng,
    distanceKm,
    walkMin,
    motorMin,
    routeKm: r.route_km != null ? Number(r.route_km) : null,
    routeMin: r.route_min ?? null,
  };
}

function summarize(pois: Poi[]): PoiSummary {
  const nearestIn = (cats: PoiCategory[]) => {
    const h = pois.find((p) => cats.includes(p.category));
    return h ? h.distanceKm : null;
  };
  return {
    total: pois.length,
    nearestTransport: nearestIn(["transport"]),
    nearestGrocery: nearestIn(["grocery"]),
    nearestHealth: nearestIn(["health"]),
  };
}

export async function loadCandidatePois(candidateId: string, home: { lat: number; lng: number }): Promise<PoiResult> {
  // 1) Coba cache DB — hindari Overpass (sumber 429) saat sudah pernah dimuat & masih segar.
  const { data: rows } = await supabaseAdmin
    .from("candidate_poi")
    .select("osm_id, category, name, lat, lng, straight_km, route_km, route_min, fetched_at")
    .eq("candidate_id", candidateId);
  if (rows && rows.length > 0) {
    const newest = Math.max(...rows.map((r) => new Date(r.fetched_at as string).getTime()).filter((n) => Number.isFinite(n)));
    if (Number.isFinite(newest) && Date.now() - newest < FRESH_MS) {
      const pois = (rows as Row[]).map(rowToPoi).sort((a, b) => a.distanceKm - b.distanceKm);
      return { pois, summary: summarize(pois), error: null };
    }
  }

  // 2) Cache kosong/kedaluwarsa → ambil dari Overpass. Jangan cache kegagalan (mis. 429) — biar dicoba lagi.
  const res = await fetchNearbyPOIs(home.lat, home.lng);
  if (res.error || res.pois.length === 0) return res;

  // 3) Hitung rute asli untuk POI terpenting (paralel) lalu persist SELURUH daftar POI.
  const byDist = [...res.pois].sort((a, b) => a.distanceKm - b.distanceKm);
  const targets: Poi[] = [];
  const add = (p?: Poi) => {
    if (p && targets.length < MAX_ROUTES && !targets.some((t) => t.id === p.id)) targets.push(p);
  };
  for (const cat of SUMMARY_CATEGORIES) add(byDist.find((p) => p.category === cat));
  for (const p of byDist) add(p);

  const routeByOsm = new Map<string, { km: number | null; min: number | null }>();
  const computed = await Promise.all(
    targets.map((p) => getRoute(`${home.lat},${home.lng}`, `${p.lat},${p.lng}`, "driving").then((r) => ({ p, r }))),
  );
  for (const { p, r } of computed) if (r.distanceKm != null) routeByOsm.set(p.id, { km: r.distanceKm, min: r.durationMin });

  const nowIso = new Date().toISOString();
  const upserts = res.pois.map((p) => {
    const rt = routeByOsm.get(p.id);
    return {
      candidate_id: candidateId,
      osm_id: p.id,
      category: p.category,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      straight_km: p.distanceKm,
      route_km: rt?.km ?? null,
      route_min: rt?.min ?? null,
      mode: rt ? "driving" : null,
      fetched_at: nowIso, // refresh timestamp agar freshness window ter-reset
    };
  });
  // Best-effort: kegagalan tulis cache tak boleh menggagalkan render (supabase-js return {error}, tak throw).
  await supabaseAdmin.from("candidate_poi").upsert(upserts, { onConflict: "candidate_id,osm_id" });

  const enriched = res.pois.map((p) => {
    const rt = routeByOsm.get(p.id);
    return rt && rt.km != null ? { ...p, routeKm: rt.km, routeMin: rt.min } : p;
  });
  return { pois: enriched, summary: res.summary, error: null };
}
