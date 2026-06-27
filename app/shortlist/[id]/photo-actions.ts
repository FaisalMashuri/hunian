"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Photo } from "@/lib/photos";

const BUCKET = "candidate-photos";
const MAX_BYTES = 8_000_000; // 8 MB

export type PhotoResult = { ok: true } | { ok: false; error: string };
export type UploadResult = { ok: true; photo: Photo } | { ok: false; error: string };

async function ownsCandidate(userId: string, candidateId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("id", candidateId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

// Upload 1 foto (FormData: candidateId, source, file). Service role → Storage + insert candidate_photos.
// Mengembalikan foto + signed URL agar pemanggil bisa menampilkan TANPA reload (form survey).
export async function uploadPhotoAction(formData: FormData): Promise<UploadResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir." };

  const candidateId = formData.get("candidateId") as string | null;
  const source = ((formData.get("source") as string) || "listing") === "survey" ? "survey" : "listing";
  const file = formData.get("file") as File | null;
  if (!candidateId || !file) return { ok: false, error: "Data foto tidak lengkap." };
  if (!(await ownsCandidate(userId, candidateId))) return { ok: false, error: "Hunian tidak ditemukan." };

  if (!file.type.startsWith("image/")) return { ok: false, error: "File harus berupa gambar." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Ukuran maksimal 8 MB." };

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const rand = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const path = `users/${userId}/candidates/${candidateId}/${rand}.${ext}`;

  const buf = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(path, buf, { contentType: file.type, upsert: false });
  if (upErr) return { ok: false, error: `Gagal upload: ${upErr.message}` };

  // sort_order = jumlah foto kandidat saat ini.
  const { count } = await supabaseAdmin
    .from("candidate_photos")
    .select("id", { count: "exact", head: true })
    .eq("candidate_id", candidateId);

  const baseRow = { candidate_id: candidateId, storage_path: path, storage_bucket: BUCKET, sort_order: count ?? 0 };
  let ins = await supabaseAdmin.from("candidate_photos").insert({ ...baseRow, source }).select("id").single();
  // Toleran bila migration S2-1 (kolom `source`) belum dijalankan → simpan tanpa source.
  if (ins.error && /source/i.test(ins.error.message)) {
    ins = await supabaseAdmin.from("candidate_photos").insert(baseRow).select("id").single();
  }
  if (ins.error || !ins.data) {
    await supabaseAdmin.storage.from(BUCKET).remove([path]); // rollback file
    return { ok: false, error: `Gagal menyimpan: ${ins.error?.message ?? "unknown"}` };
  }

  const { data: signed } = await supabaseAdmin.storage.from(BUCKET).createSignedUrl(path, 3600);
  return { ok: true, photo: { id: ins.data.id as string, url: signed?.signedUrl ?? "", caption: null, source } };
}

export async function deletePhotoAction(photoId: string): Promise<PhotoResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir." };

  // Ambil foto + verifikasi kepemilikan via join ke candidates(user_id).
  const { data: p } = await supabaseAdmin
    .from("candidate_photos")
    .select("id, storage_path, storage_bucket, candidates!inner(user_id)")
    .eq("id", photoId)
    .maybeSingle();
  type Own = { user_id: string };
  const owner = p ? (Array.isArray(p.candidates) ? (p.candidates[0] as Own) : (p.candidates as unknown as Own)) : null;
  if (!p || owner?.user_id !== userId) return { ok: false, error: "Foto tidak ditemukan." };

  await supabaseAdmin.storage.from((p.storage_bucket as string) || BUCKET).remove([p.storage_path as string]);
  const { error } = await supabaseAdmin.from("candidate_photos").delete().eq("id", photoId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
