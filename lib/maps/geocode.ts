import "server-only";

// Geocoding alamat teks -> lat/lng via Google Geocoding API (reuse GOOGLE_MAPS_API_KEY).
// Pola error eksplisit, selaras dengan lib/maps/distance.ts (alasan dimunculkan, bukan disembunyikan).

export type GeocodeOk = { lat: number; lng: number; error: null };
export type GeocodeErr = { lat: null; lng: null; error: string };
export type GeocodeResult = GeocodeOk | GeocodeErr;

type GeocodeResponse = {
  status?: string;
  error_message?: string;
  results?: { geometry?: { location?: { lat?: number; lng?: number } } }[];
};

export async function geocodeAddress(address: string | null | undefined): Promise<GeocodeResult> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return { lat: null, lng: null, error: "GOOGLE_MAPS_API_KEY belum diset" };
  if (!address?.trim()) return { lat: null, lng: null, error: "Alamat kosong" };

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("region", "id");
  url.searchParams.set("key", key);

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = (await res.json()) as GeocodeResponse;
    if (data?.status && data.status !== "OK") {
      return {
        lat: null,
        lng: null,
        error: `Maps: ${data.status}${data.error_message ? " — " + data.error_message : ""}`,
      };
    }
    const loc = data?.results?.[0]?.geometry?.location;
    if (loc?.lat == null || loc?.lng == null) {
      return { lat: null, lng: null, error: "Lokasi tak ditemukan untuk alamat ini" };
    }
    return { lat: loc.lat, lng: loc.lng, error: null };
  } catch (e) {
    return {
      lat: null,
      lng: null,
      error: `Gagal memanggil Maps: ${e instanceof Error ? e.message : "unknown"}`,
    };
  }
}
