"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { CANDIDATE_STATUSES, type CandidateStatus } from "@/lib/types/db";

export type StatusResult = { ok: true } | { ok: false; error: string };

// Ubah status kandidat dari dashboard (Arsipkan → sudah_tersewa, Pulihkan → tersedia).
export async function setStatusAction(
  candidateId: string,
  status: CandidateStatus,
): Promise<StatusResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir." };
  if (!CANDIDATE_STATUSES.includes(status)) return { ok: false, error: "Status tidak valid." };

  const { error } = await supabaseAdmin
    .from("candidates")
    .update({ status })
    .eq("id", candidateId)
    .eq("user_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/kandidat");
  return { ok: true };
}
