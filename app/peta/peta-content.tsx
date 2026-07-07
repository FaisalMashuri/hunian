import { supabaseAdmin } from "@/lib/supabase/server";
import { visibleOwnerIds, sharedOwnersFor } from "@/lib/authz/candidate";
import { geocodeAddress } from "@/lib/maps/geocode";
import { decodePolyline } from "@/lib/maps/directions";
import { deriveVerdict, type VerdictInput } from "@/lib/scoring/verdict";
import { PetaMap } from "./peta-map";
import type { MapItem, Office } from "./types";

const PHOTO_BUCKET = "candidate-photos";

// Loader Maps view — di-stream via <Suspense>. Kerja lambat (geocode, signed URL) di sini,
// bukan di page.tsx (NFR-11). Menampilkan hunian sendiri + yang dibagikan partner.
export async function PetaContent({ userId, user }: { userId: string; user: { name: string; initial: string } }) {
  const [ownerIds, sharedOwners, { data: prefs }] = await Promise.all([
    visibleOwnerIds(userId),
    sharedOwnersFor(userId),
    supabaseAdmin.from("user_preferences").select("dest_lat, dest_lng, dest_address").eq("user_id", userId).maybeSingle(),
  ]);
  const ownerNameById = new Map(sharedOwners.map((o) => [o.ownerId, o.ownerName ?? o.ownerEmail]));

  const { data: cands } = await supabaseAdmin
    .from("candidates")
    .select(
      "id, user_id, title, property_type, harga_efektif_bulanan, periode_asli, score_total, score_harga, score_lokasi, score_fasilitas, location_lat, location_lng, alamat",
    )
    .in("user_id", ownerIds)
    .neq("status", "sudah_tersewa");
  const rows = cands ?? [];

  // Geocode kandidat yang belum punya koordinat tapi punya alamat (persist agar sekali saja).
  await Promise.all(
    rows
      .filter((c) => (c.location_lat == null || c.location_lng == null) && (c.alamat as string | null))
      .map(async (c) => {
        const g = await geocodeAddress(c.alamat as string);
        if (g.error === null) {
          c.location_lat = g.lat;
          c.location_lng = g.lng;
          await supabaseAdmin.from("candidates").update({ location_lat: g.lat, location_lng: g.lng }).eq("id", c.id).eq("user_id", c.user_id);
        }
      }),
  );

  const placed = rows.filter((c) => c.location_lat != null && c.location_lng != null);
  const ids = placed.map((c) => c.id as string);

  // Commute + deal-breaker flags + foto pertama (batch, paralel).
  const distById: Record<string, number | null> = {};
  const durById: Record<string, number | null> = {};
  const routeById: Record<string, { lat: number; lng: number }[]> = {};
  const flagById: Record<string, number> = {};
  const photoPathByCand: Record<string, string> = {};
  if (ids.length > 0) {
    const [{ data: commutes }, { data: flags }, photoRes] = await Promise.all([
      supabaseAdmin.from("candidate_commute").select("candidate_id, distance_km, duration_min, route_summary").in("candidate_id", ids),
      supabaseAdmin.from("candidate_deal_breaker_flags").select("candidate_id").in("candidate_id", ids),
      supabaseAdmin.from("candidate_photos").select("candidate_id, storage_path, sort_order").in("candidate_id", ids).order("sort_order", { ascending: true }),
    ]);
    for (const r of commutes ?? []) {
      const k = r.candidate_id as string;
      if (!(k in distById)) {
        distById[k] = (r.distance_km as number) ?? null;
        durById[k] = (r.duration_min as number) ?? null;
        // route_summary = encoded polyline (Google Directions), tersimpan saat detail dibuka.
        const poly = r.route_summary as string | null;
        if (poly) { const pts = decodePolyline(poly); if (pts.length > 1) routeById[k] = pts; }
      }
    }
    for (const f of flags ?? []) { const k = f.candidate_id as string; flagById[k] = (flagById[k] ?? 0) + 1; }
    for (const p of photoRes.data ?? []) { const k = p.candidate_id as string; if (!(k in photoPathByCand)) photoPathByCand[k] = p.storage_path as string; }
  }

  // Signed URL batch untuk foto pertama tiap kandidat.
  const urlByPath: Record<string, string> = {};
  const paths = Object.values(photoPathByCand);
  if (paths.length > 0) {
    const { data: signed } = await supabaseAdmin.storage.from(PHOTO_BUCKET).createSignedUrls(paths, 3600);
    for (const s of signed ?? []) if (s.signedUrl && s.path) urlByPath[s.path] = s.signedUrl;
  }

  // Pool verdict per owner (jangan campur antar pemilik) → alasan "Worth It Logic".
  const poolByOwner: Record<string, VerdictInput[]> = {};
  for (const c of placed) {
    const owner = c.user_id as string;
    (poolByOwner[owner] ??= []).push({
      id: c.id as string,
      title: c.title as string,
      score_total: (c.score_total as number) ?? null,
      score_harga: (c.score_harga as number) ?? null,
      score_lokasi: (c.score_lokasi as number) ?? null,
      score_fasilitas: (c.score_fasilitas as number) ?? null,
      distanceKm: distById[c.id as string] ?? null,
      flagCount: flagById[c.id as string] ?? 0,
    });
  }

  const items: MapItem[] = placed.map((c) => {
    const id = c.id as string;
    const ownerId = c.user_id as string;
    const vi: VerdictInput = {
      id,
      title: c.title as string,
      score_total: (c.score_total as number) ?? null,
      score_harga: (c.score_harga as number) ?? null,
      score_lokasi: (c.score_lokasi as number) ?? null,
      score_fasilitas: (c.score_fasilitas as number) ?? null,
      distanceKm: distById[id] ?? null,
      flagCount: flagById[id] ?? 0,
    };
    const verdict = deriveVerdict(vi, poolByOwner[ownerId] ?? []);
    return {
      id,
      title: c.title as string,
      propertyType: c.property_type as string,
      lat: c.location_lat as number,
      lng: c.location_lng as number,
      score: (c.score_total as number) ?? null,
      scoreHarga: (c.score_harga as number) ?? null,
      scoreLokasi: (c.score_lokasi as number) ?? null,
      scoreFasilitas: (c.score_fasilitas as number) ?? null,
      perBulan: (c.harga_efektif_bulanan as number) ?? null,
      periode: (c.periode_asli as string) ?? null,
      alamat: (c.alamat as string) ?? null,
      distanceKm: distById[id] ?? null,
      durationMin: durById[id] ?? null,
      flagCount: flagById[id] ?? 0,
      photoUrl: urlByPath[photoPathByCand[id]] ?? null,
      sharedBy: ownerId === userId ? null : ownerNameById.get(ownerId) ?? "partner",
      logic: verdict.reason,
      route: routeById[id] ?? null,
    };
  });

  // Kantor = tujuan (dest) milik user. Geocode + persist bila belum ada koordinat.
  let office: Office | null = null;
  if (prefs?.dest_lat != null && prefs?.dest_lng != null) {
    office = { lat: prefs.dest_lat as number, lng: prefs.dest_lng as number, label: "Kantor Saya" };
  } else if (prefs?.dest_address) {
    const g = await geocodeAddress(prefs.dest_address as string);
    if (g.error === null) {
      office = { lat: g.lat, lng: g.lng, label: "Kantor Saya" };
      await supabaseAdmin.from("user_preferences").update({ dest_lat: g.lat, dest_lng: g.lng }).eq("user_id", userId);
    }
  }

  return <PetaMap items={items} office={office} user={user} />;
}
