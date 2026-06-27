import "server-only";

// POI sekitar hunian dari OpenStreetMap (Overpass API) — GRATIS, tanpa Google Maps key.
// Dipakai seksi "Akses & Lingkungan Sekitar" di halaman detail kandidat.
// Jarak = garis lurus (haversine) + estimasi waktu kasar; keduanya DILABELI estimasi di UI
// (bukan jarak/waktu tempuh asli). Upgrade ke rute asli per-POI ter-cache di DB = Slice berikutnya
// (lihat docs/DEVELOPMENT-PLAN.md → tabel candidate_poi). Pola error eksplisit selaras geocode.ts/directions.ts.

export type PoiCategory =
  | "transport"
  | "grocery"
  | "health"
  | "education"
  | "worship"
  | "dining"
  | "highway";

export type Poi = {
  id: string; // "node/123" — idempoten lintas reload
  name: string;
  sub: string; // label tipe ringkas, mis. "Minimarket", "Masjid"
  category: PoiCategory;
  emoji: string;
  lat: number;
  lng: number;
  distanceKm: number; // garis lurus
  walkMin: number | null; // estimasi (jalan) bila dekat
  motorMin: number | null; // estimasi (motor) bila agak jauh
  routeKm?: number | null; // jarak tempuh jalan asli (Directions, S2-7) — null bila belum/tak dihitung
  routeMin?: number | null; // durasi tempuh menit asli (Directions, S2-7)
};

export type PoiSummary = {
  total: number;
  nearestTransport: number | null;
  nearestGrocery: number | null;
  nearestHealth: number | null;
};

export type PoiResult = {
  pois: Poi[];
  summary: PoiSummary;
  error: string | null;
};

const EMPTY_SUMMARY: PoiSummary = { total: 0, nearestTransport: null, nearestGrocery: null, nearestHealth: null };

// ── Jarak garis lurus (haversine), dibulatkan 1 desimal.
export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const la1 = (aLat * Math.PI) / 180;
  const la2 = (bLat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  const km = 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  return Math.round(km * 10) / 10;
}

// Estimasi waktu dari jarak garis lurus: <1,2 km tampil jalan kaki (5 km/jam), selebihnya motor (25 km/jam).
function estTimes(distanceKm: number): { walkMin: number | null; motorMin: number | null } {
  if (distanceKm < 1.2) return { walkMin: Math.max(1, Math.round((distanceKm / 5) * 60)), motorMin: null };
  return { walkMin: null, motorMin: Math.max(1, Math.round((distanceKm / 25) * 60)) };
}

const MAX_PER_CATEGORY = 8;
// Beberapa mirror publik Overpass — dirotasi saat satu sibuk/429 (lihat wiki.openstreetmap.org/wiki/Overpass_API).
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

type OverpassTags = Record<string, string>;
type OverpassEl = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: OverpassTags;
};
type OverpassResponse = { elements?: OverpassEl[] };

// Susun query Overpass. radiusM = radius pencarian (meter). Koordinat dibulatkan agar cache (key=URL) lebih sering nyangkut.
function buildQuery(lat: number, lng: number, radiusM: number): string {
  const a = `${radiusM},${lat.toFixed(5)},${lng.toFixed(5)}`;
  const lines = [
    `nwr["highway"="bus_stop"](around:${a});`,
    `nwr["railway"~"^(station|halt|tram_stop)$"](around:${a});`,
    `nwr["amenity"="bus_station"](around:${a});`,
    `nwr["aeroway"="aerodrome"](around:${a});`,
    `nwr["shop"~"^(convenience|supermarket|mall|department_store)$"](around:${a});`,
    `nwr["amenity"="marketplace"](around:${a});`,
    `nwr["amenity"~"^(hospital|clinic|pharmacy|doctors)$"](around:${a});`,
    `nwr["amenity"~"^(school|university|college|kindergarten)$"](around:${a});`,
    `nwr["amenity"="place_of_worship"](around:${a});`,
    `nwr["amenity"~"^(restaurant|cafe|fast_food|food_court)$"](around:${a});`,
    `nwr["barrier"="toll_booth"](around:${a});`,
    `nwr["highway"="motorway_junction"](around:${a});`,
  ];
  return `[out:json][timeout:25];(${lines.join("")});out center tags 300;`;
}

// ── Kategorisasi + emoji + label tipe dari tag OSM. null = abaikan elemen.
function classify(tags: OverpassTags): { category: PoiCategory; emoji: string; sub: string } | null {
  const amenity = tags.amenity;
  const shop = tags.shop;

  // Transport
  if (tags.aeroway === "aerodrome") return { category: "transport", emoji: "✈️", sub: "Bandara" };
  if (tags.highway === "bus_stop") return { category: "transport", emoji: "🚌", sub: "Halte bus" };
  if (tags.highway === "motorway_junction") return { category: "highway", emoji: "🛣️", sub: "Pintu/akses tol" };
  if (tags.barrier === "toll_booth") return { category: "highway", emoji: "🛣️", sub: "Gerbang tol" };
  if (tags.railway === "station" || tags.railway === "halt") return { category: "transport", emoji: "🚉", sub: "Stasiun" };
  if (tags.railway === "tram_stop") return { category: "transport", emoji: "🚊", sub: "Pemberhentian trem" };
  if (amenity === "bus_station") return { category: "transport", emoji: "🚏", sub: "Terminal bus" };

  // Belanja (termasuk pasar & mall)
  if (shop === "convenience") return { category: "grocery", emoji: "🏪", sub: "Minimarket" };
  if (shop === "supermarket") return { category: "grocery", emoji: "🛒", sub: "Supermarket" };
  if (shop === "mall") return { category: "grocery", emoji: "🏬", sub: "Mall" };
  if (shop === "department_store") return { category: "grocery", emoji: "🏬", sub: "Pusat perbelanjaan" };
  if (amenity === "marketplace") return { category: "grocery", emoji: "🛍️", sub: "Pasar" };

  // Kesehatan
  if (amenity === "hospital") return { category: "health", emoji: "🏥", sub: "Rumah sakit" };
  if (amenity === "clinic") return { category: "health", emoji: "🏥", sub: "Klinik" };
  if (amenity === "doctors") return { category: "health", emoji: "🩺", sub: "Praktik dokter" };
  if (amenity === "pharmacy") return { category: "health", emoji: "💊", sub: "Apotek" };

  // Pendidikan
  if (amenity === "school") return { category: "education", emoji: "🏫", sub: "Sekolah" };
  if (amenity === "kindergarten") return { category: "education", emoji: "🧸", sub: "TK / PAUD" };
  if (amenity === "college") return { category: "education", emoji: "🎓", sub: "Akademi" };
  if (amenity === "university") return { category: "education", emoji: "🎓", sub: "Universitas" };

  // Ibadah (emoji per religion)
  if (amenity === "place_of_worship") {
    const r = tags.religion;
    if (r === "muslim") return { category: "worship", emoji: "🕌", sub: "Masjid" };
    if (r === "christian") return { category: "worship", emoji: "⛪", sub: "Gereja" };
    if (r === "buddhist") return { category: "worship", emoji: "🛕", sub: "Vihara" };
    if (r === "hindu") return { category: "worship", emoji: "🛕", sub: "Pura" };
    return { category: "worship", emoji: "🛐", sub: "Tempat ibadah" };
  }

  // Kuliner
  if (amenity === "restaurant") return { category: "dining", emoji: "🍽️", sub: "Restoran" };
  if (amenity === "cafe") return { category: "dining", emoji: "☕", sub: "Kafe" };
  if (amenity === "fast_food") return { category: "dining", emoji: "🍔", sub: "Cepat saji" };
  if (amenity === "food_court") return { category: "dining", emoji: "🍜", sub: "Pujasera" };

  return null;
}

async function callOverpass(query: string): Promise<OverpassResponse> {
  let lastErr: unknown = null;
  // 2 putaran: tiap putaran coba semua mirror; jeda singkat antar putaran agar lolos rate-limit (HTTP 429).
  // Respons sukses (GET) di-cache Next 7 hari; cache per-kandidat di candidate_poi (poi-cache.ts) menambah lapis kedua.
  for (let round = 0; round < 2; round++) {
    for (const endpoint of OVERPASS_ENDPOINTS) {
      const url = `${endpoint}?data=${encodeURIComponent(query)}`;
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 15_000);
      try {
        // Header etiket Overpass: tanpa User-Agent/Accept beberapa mirror menolak (406) atau lebih agresif rate-limit.
        const res = await fetch(url, {
          signal: ctrl.signal,
          headers: { "User-Agent": "Hunian/1.0 (rental decision app; +hunian)", Accept: "application/json" },
          next: { revalidate: 604800 },
        });
        if (!res.ok) {
          lastErr = new Error(`HTTP ${res.status}`);
          continue;
        }
        return (await res.json()) as OverpassResponse;
      } catch (e) {
        lastErr = e;
      } finally {
        clearTimeout(timer);
      }
    }
    if (round === 0) await new Promise((r) => setTimeout(r, 1500)); // backoff sebelum putaran ke-2
  }
  throw lastErr ?? new Error("Overpass tak merespons");
}

export async function fetchNearbyPOIs(lat: number, lng: number, radiusM = 2500): Promise<PoiResult> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { pois: [], summary: EMPTY_SUMMARY, error: "Koordinat hunian tidak valid" };
  }

  let data: OverpassResponse;
  try {
    data = await callOverpass(buildQuery(lat, lng, radiusM));
  } catch (e) {
    return {
      pois: [],
      summary: EMPTY_SUMMARY,
      error: `Gagal mengambil data OSM: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }

  const byCategory = new Map<PoiCategory, Poi[]>();
  for (const el of data.elements ?? []) {
    const tags = el.tags;
    if (!tags) continue;
    const coord = el.type === "node" ? { lat: el.lat, lng: el.lon } : { lat: el.center?.lat, lng: el.center?.lon };
    if (coord.lat == null || coord.lng == null) continue;
    const cls = classify(tags);
    if (!cls) continue;

    const distanceKm = haversineKm(lat, lng, coord.lat, coord.lng);
    const { walkMin, motorMin } = estTimes(distanceKm);
    const name = tags.name?.trim() || cls.sub; // tanpa nama → pakai label tipe (halte sering tanpa nama)
    const poi: Poi = {
      id: `${el.type}/${el.id}`,
      name,
      sub: cls.sub,
      category: cls.category,
      emoji: cls.emoji,
      lat: coord.lat,
      lng: coord.lng,
      distanceKm,
      walkMin,
      motorMin,
    };
    const arr = byCategory.get(cls.category) ?? [];
    arr.push(poi);
    byCategory.set(cls.category, arr);
  }

  // Maks 8 per kategori (terdekat), lalu gabung & sort global by jarak.
  const pois: Poi[] = [];
  for (const arr of byCategory.values()) {
    arr.sort((a, b) => a.distanceKm - b.distanceKm);
    pois.push(...arr.slice(0, MAX_PER_CATEGORY));
  }
  pois.sort((a, b) => a.distanceKm - b.distanceKm);

  const nearestIn = (cats: PoiCategory[]): number | null => {
    const hit = pois.find((p) => cats.includes(p.category));
    return hit ? hit.distanceKm : null;
  };

  const summary: PoiSummary = {
    total: pois.length,
    nearestTransport: nearestIn(["transport"]),
    nearestGrocery: nearestIn(["grocery"]),
    nearestHealth: nearestIn(["health"]),
  };

  return { pois, summary, error: null };
}
