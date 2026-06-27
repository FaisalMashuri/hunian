import { supabaseAdmin } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/maps/geocode";
import { getRoute, decodePolyline, type RoutePoint } from "@/lib/maps/directions";
import type { TransportMode } from "@/lib/types/db";
import { MapPanel } from "./map-panel";
import type { LatLng } from "./map-leaflet";
import { resolveHome, type HomeInput } from "./location";

// Mode transport user → mode Directions + label footer peta.
const TRANSPORT_DIR: Record<TransportMode, "driving" | "walking" | "transit"> = { motor: "driving", mobil: "driving", transit: "transit", jalan_kaki_sepeda: "walking" };
const TRANSPORT_LABEL: Record<TransportMode, string> = { motor: "Motor", mobil: "Mobil", transit: "Transit", jalan_kaki_sepeda: "Jalan/Sepeda" };

type Prefs = { dest_lat: number | null; dest_lng: number | null; dest_address: string | null; transport_modes: TransportMode[] | null } | null;
type Commute = { distance_km: number | null; duration_min: number | null; route_summary: string | null; transport_mode: string | null } | null;

// Seksi peta — di-stream via <Suspense>. Geocode + Directions lambat & dulu memblok seluruh
// detail page; kini kerja itu dipindah ke sini agar scaffold (header/verdict/biaya) tampil instan.
export async function MapSection({ candidate, prefs, commute, userId }: { candidate: HomeInput; prefs: Prefs; commute: Commute; userId: string }) {
  // Koordinat home via resolver ber-cache() (dedup dgn PoiGate).
  const { home, error: mapError } = await resolveHome(candidate, userId);

  let dest: LatLng | null = null;
  if (prefs?.dest_lat != null && prefs?.dest_lng != null) {
    dest = { lat: prefs.dest_lat, lng: prefs.dest_lng, label: "Tujuanmu" };
  } else if (prefs?.dest_address) {
    const g = await geocodeAddress(prefs.dest_address);
    if (g.error === null) {
      dest = { lat: g.lat, lng: g.lng, label: "Tujuanmu" };
      await supabaseAdmin.from("user_preferences").update({ dest_lat: g.lat, dest_lng: g.lng }).eq("user_id", userId);
    }
  }

  const prefModes = prefs?.transport_modes ?? [];
  const transportMode: TransportMode = (commute?.transport_mode as TransportMode) ?? prefModes[0] ?? "motor";

  // Rute jalan (Directions) + durasi — cache di candidate_commute (route_summary = encoded polyline).
  let routePath: RoutePoint[] = [];
  let durationMin: number | null = commute?.duration_min ?? null;
  if (home && dest) {
    const storedPolyline = commute?.route_summary ?? null;
    if (storedPolyline) {
      routePath = decodePolyline(storedPolyline);
    } else {
      const r = await getRoute(`${home.lat},${home.lng}`, `${dest.lat},${dest.lng}`, TRANSPORT_DIR[transportMode]);
      if (r.path.length > 0) {
        routePath = r.path;
        if (durationMin == null) durationMin = r.durationMin;
        // Cache hanya bila baris commute sudah ada (jangan ganggu data scoring).
        await supabaseAdmin.from("candidate_commute").update({ route_summary: r.polyline, duration_min: r.durationMin }).eq("candidate_id", candidate.id);
      }
    }
  }

  return (
    <MapPanel
      home={home}
      dest={dest}
      distanceKm={commute?.distance_km ?? null}
      durationMin={durationMin}
      modeLabel={TRANSPORT_LABEL[transportMode]}
      route={routePath}
      error={mapError}
    />
  );
}
