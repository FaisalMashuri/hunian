import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/maps/geocode";
import type { LatLng } from "./map-leaflet";

export type HomeInput = { id: string; title: string; location_lat: number | null; location_lng: number | null; alamat: string | null };

// Resolusi koordinat home (geocode lazy + simpan). Dibungkus cache() agar MapSection & PoiGate
// — dua boundary <Suspense> berbeda — berbagi satu geocode/satu write (dedup per request,
// kunci = referensi argumen `c`/`userId` yang sama dari page).
export const resolveHome = cache(async function resolveHome(c: HomeInput, userId: string): Promise<{ home: LatLng | null; error: string | null }> {
  if (c.location_lat != null && c.location_lng != null) {
    return { home: { lat: c.location_lat, lng: c.location_lng, label: c.title }, error: null };
  }
  if (c.alamat) {
    const g = await geocodeAddress(c.alamat);
    if (g.error !== null) return { home: null, error: g.error };
    await supabaseAdmin.from("candidates").update({ location_lat: g.lat, location_lng: g.lng }).eq("id", c.id).eq("user_id", userId);
    return { home: { lat: g.lat, lng: g.lng, label: c.title }, error: null };
  }
  return { home: null, error: "Alamat hunian belum diisi." };
});
