import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

const BUCKET = "candidate-photos";
const SIGNED_TTL = 60 * 60; // 1 jam

export type Photo = { id: string; url: string; caption: string | null; source: "listing" | "survey" };

// Muat foto kandidat + signed URL (server-side). Pisah listing vs survey.
// Toleran bila migration S2-1 (kolom `source`) belum dijalankan → semua dianggap listing.
export async function loadCandidatePhotos(candidateId: string): Promise<{ listing: Photo[]; survey: Photo[] }> {
  type Row = { id: string; storage_path: string; storage_bucket: string | null; caption: string | null; source?: string };
  let rows: Row[] = [];
  const res = await supabaseAdmin
    .from("candidate_photos")
    .select("id, storage_path, storage_bucket, caption, source, sort_order")
    .eq("candidate_id", candidateId)
    .order("sort_order", { ascending: true });
  if (res.error) {
    const res2 = await supabaseAdmin
      .from("candidate_photos")
      .select("id, storage_path, storage_bucket, caption, sort_order")
      .eq("candidate_id", candidateId)
      .order("sort_order", { ascending: true });
    rows = ((res2.data as Row[] | null) ?? []).map((r) => ({ ...r, source: "listing" }));
  } else {
    rows = (res.data as Row[] | null) ?? [];
  }
  if (rows.length === 0) return { listing: [], survey: [] };

  const { data: signed } = await supabaseAdmin.storage.from(BUCKET).createSignedUrls(rows.map((r) => r.storage_path), SIGNED_TTL);
  const urlByPath = new Map<string, string>();
  for (const s of signed ?? []) if (s.signedUrl && s.path) urlByPath.set(s.path, s.signedUrl);

  const listing: Photo[] = [];
  const survey: Photo[] = [];
  for (const r of rows) {
    const url = urlByPath.get(r.storage_path);
    if (!url) continue;
    const src = r.source === "survey" ? "survey" : "listing";
    const photo: Photo = { id: r.id, url, caption: r.caption ?? null, source: src };
    (src === "survey" ? survey : listing).push(photo);
  }
  return { listing, survey };
}
