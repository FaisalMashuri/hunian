"use server";

import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export type DecisionResult = { ok: true } | { ok: false; error: string };

// Mencatat keputusan (OPSIONAL — user tak harus memilih). 1 row = 1 siklus selesai (KPI-1).
export async function recordDecisionAction(
  candidateId: string,
  comparedIds: string[],
  notes?: string | null,
): Promise<DecisionResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "Sesi berakhir." };

  const { data: c } = await supabaseAdmin
    .from("candidates")
    .select("scoring_version, score_total")
    .eq("id", candidateId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!c) return { ok: false, error: "Kandidat tidak ditemukan." };

  const { error } = await supabaseAdmin.from("decisions").insert({
    user_id: userId,
    candidate_id: candidateId,
    scoring_version: c.scoring_version,
    score_at_decision: c.score_total,
    candidates_compared: comparedIds,
    notes: notes?.trim() ? notes.trim() : null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
