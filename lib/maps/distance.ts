import "server-only";
import type { TransportMode } from "@/lib/types/db";

const MODE_MAP: Record<TransportMode, string> = {
  motor: "driving",
  mobil: "driving",
  transit: "transit",
  jalan_kaki_sepeda: "walking",
};

export type DistanceResult = { km: number | null; error: string | null };

type DMResponse = {
  status?: string;
  error_message?: string;
  rows?: { elements?: { status?: string; distance?: { value?: number } }[] }[];
};

const km1 = (meters: number) => Math.round((meters / 1000) * 10) / 10;

function topError(data: DMResponse): string | null {
  if (data?.status && data.status !== "OK") {
    return `Maps: ${data.status}${data.error_message ? " — " + data.error_message : ""}`;
  }
  return null;
}

function elementResult(el?: { status?: string; distance?: { value?: number } }): DistanceResult {
  if (el?.status === "OK" && el.distance?.value != null) return { km: km1(el.distance.value), error: null };
  if (!el) return { km: null, error: "Maps: respons kosong" };
  // ZERO_RESULTS / NOT_FOUND -> alamat tak bisa di-rute-kan.
  return { km: null, error: `Jarak tak terhitung untuk alamat ini (${el.status ?? "NO_RESULT"})` };
}

// Jarak satu origin -> satu destination, dengan alasan error eksplisit.
export async function getDistanceKm(
  origin: string,
  destination: string,
  mode: TransportMode = "motor",
): Promise<DistanceResult> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return { km: null, error: "GOOGLE_MAPS_API_KEY belum diset" };
  if (!origin.trim()) return { km: null, error: "Lokasi tujuan (onboarding) belum diisi" };
  if (!destination.trim()) return { km: null, error: "Alamat kandidat kosong" };

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", origin);
  url.searchParams.set("destinations", destination);
  url.searchParams.set("mode", MODE_MAP[mode] ?? "driving");
  url.searchParams.set("region", "id");
  url.searchParams.set("key", key);

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as DMResponse;
    const te = topError(data);
    if (te) return { km: null, error: te };
    return elementResult(data?.rows?.[0]?.elements?.[0]);
  } catch (e) {
    return { km: null, error: `Gagal memanggil Maps: ${e instanceof Error ? e.message : "unknown"}` };
  }
}

// Batch: 1 origin -> N destinations (chunk 25). Hasil sejajar urutan destinations.
export async function getDistancesKm(
  origin: string,
  destinations: string[],
  mode: TransportMode = "motor",
): Promise<DistanceResult[]> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return destinations.map(() => ({ km: null, error: "GOOGLE_MAPS_API_KEY belum diset" }));
  if (!origin.trim())
    return destinations.map(() => ({ km: null, error: "Lokasi tujuan belum diisi" }));
  if (destinations.length === 0) return [];

  const out: DistanceResult[] = [];
  for (let i = 0; i < destinations.length; i += 25) {
    const chunk = destinations.slice(i, i + 25);
    const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
    url.searchParams.set("origins", origin);
    url.searchParams.set("destinations", chunk.join("|"));
    url.searchParams.set("mode", MODE_MAP[mode] ?? "driving");
    url.searchParams.set("region", "id");
    url.searchParams.set("key", key);
    try {
      const res = await fetch(url, { cache: "no-store" });
      const data = (await res.json()) as DMResponse;
      const te = topError(data);
      const els = data?.rows?.[0]?.elements ?? [];
      for (let j = 0; j < chunk.length; j++) {
        out.push(te ? { km: null, error: te } : elementResult(els[j]));
      }
    } catch (e) {
      const err = `Gagal memanggil Maps: ${e instanceof Error ? e.message : "unknown"}`;
      for (let j = 0; j < chunk.length; j++) out.push({ km: null, error: err });
    }
  }
  return out;
}
