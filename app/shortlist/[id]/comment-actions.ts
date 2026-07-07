"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { assertCandidateAccess } from "@/lib/authz/candidate";
import { revalidatePath } from "next/cache";

// Collaboration C-2 — diskusi async per kandidat.
// Baca/tulis untuk siapa pun yang punya akses (owner ATAU partner). Hapus = penulis saja.

export type CommentResult = { ok: true } | { ok: false; error: string };

const MAX_LEN = 2000;

export async function addCommentAction(candidateId: string, bodyRaw: string): Promise<CommentResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir. Masuk lagi." };

  const body = bodyRaw.trim();
  if (!body) return { ok: false, error: "Komentar kosong." };
  if (body.length > MAX_LEN) return { ok: false, error: "Komentar terlalu panjang." };

  // Gerbang authz: minimal "viewer" (owner atau partner yang di-share).
  try {
    await assertCandidateAccess(userId, candidateId, "viewer");
  } catch {
    return { ok: false, error: "Tidak punya akses ke hunian ini." };
  }

  const { error } = await supabaseAdmin
    .from("candidate_comments")
    .insert({ candidate_id: candidateId, author_id: userId, body });
  if (error) return { ok: false, error: `Gagal mengirim: ${error.message}` };

  revalidatePath(`/shortlist/${candidateId}`);
  return { ok: true };
}

export async function deleteCommentAction(commentId: string): Promise<CommentResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir. Masuk lagi." };

  // Hanya penulis yang boleh menghapus komentarnya sendiri.
  const { data: c } = await supabaseAdmin
    .from("candidate_comments")
    .select("candidate_id, author_id")
    .eq("id", commentId)
    .maybeSingle();
  if (!c || (c.author_id as string) !== userId) {
    return { ok: false, error: "Tidak bisa menghapus komentar ini." };
  }

  const { error } = await supabaseAdmin
    .from("candidate_comments")
    .delete()
    .eq("id", commentId)
    .eq("author_id", userId);
  if (error) return { ok: false, error: `Gagal menghapus: ${error.message}` };

  revalidatePath(`/shortlist/${c.candidate_id as string}`);
  return { ok: true };
}
