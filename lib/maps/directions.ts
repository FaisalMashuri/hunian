import "server-only";

// Rute jalan (Directions API) — untuk garis peta yang mengikuti jalan + durasi tempuh.
// Dipanggil sekali per kandidat lalu di-cache (encoded polyline disimpan di candidate_commute.route_summary,
// durasi di candidate_commute.duration_min) — biaya Maps API praktis sekali per kandidat.

export type RoutePoint = { lat: number; lng: number };

export type RouteResult = {
  durationMin: number | null;
  distanceKm: number | null;
  polyline: string | null; // encoded overview_polyline (untuk cache)
  path: RoutePoint[]; // hasil decode (untuk digambar)
  error: string | null;
};

type DirResponse = {
  status?: string;
  error_message?: string;
  routes?: {
    overview_polyline?: { points?: string };
    legs?: { distance?: { value?: number }; duration?: { value?: number } }[];
  }[];
};

// Decoder standar Google encoded polyline (algorithm format) → titik lat/lng.
export function decodePolyline(encoded: string): RoutePoint[] {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const path: RoutePoint[] = [];
  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let b: number;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0;
    shift = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;
    path.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return path;
}

const min1 = (sec: number) => Math.round(sec / 60);
const km1 = (m: number) => Math.round((m / 1000) * 10) / 10;

// origin/destination = "lat,lng". Mode driving (motor & mobil sama-sama driving di Slice 1).
export async function getRoute(
  origin: string,
  destination: string,
  mode: "driving" | "walking" | "transit" = "driving",
): Promise<RouteResult> {
  const empty: RouteResult = { durationMin: null, distanceKm: null, polyline: null, path: [], error: null };
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return { ...empty, error: "GOOGLE_MAPS_API_KEY belum diset" };
  if (!origin.trim() || !destination.trim()) return { ...empty, error: "Koordinat asal/tujuan kosong" };

  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  url.searchParams.set("mode", mode);
  url.searchParams.set("region", "id");
  url.searchParams.set("key", key);

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as DirResponse;
    if (data.status && data.status !== "OK") {
      return { ...empty, error: `Maps: ${data.status}${data.error_message ? " — " + data.error_message : ""}` };
    }
    const route = data.routes?.[0];
    const enc = route?.overview_polyline?.points ?? null;
    const leg = route?.legs?.[0];
    return {
      durationMin: leg?.duration?.value != null ? min1(leg.duration.value) : null,
      distanceKm: leg?.distance?.value != null ? km1(leg.distance.value) : null,
      polyline: enc,
      path: enc ? decodePolyline(enc) : [],
      error: enc ? null : "Rute tak ditemukan",
    };
  } catch (e) {
    return { ...empty, error: `Gagal memanggil Directions: ${e instanceof Error ? e.message : "unknown"}` };
  }
}
