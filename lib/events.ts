import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";

// Pencatatan event timeline kandidat (Slice 2, S2-3) — terpusat agar konsisten.
// Tabel candidate_events (migration S2-0). RLS bypass service role → user_id WAJIB diisi.
export type CandidateEventType =
  | "added"
  | "status_changed"
  | "data_updated"
  | "survey_completed"
  | "verdict_changed"
  | "price_changed"
  | "user_note"
  | "call_log"
  | "negotiation"
  | "appointment";

export async function insertCandidateEvent(
  userId: string,
  candidateId: string,
  type: CandidateEventType,
  data: Record<string, unknown> = {},
  source: "auto" | "manual" = "auto",
): Promise<void> {
  // Best-effort: kegagalan event tak boleh menggagalkan aksi utama (tabel mungkin belum ada bila S2-0 belum jalan).
  try {
    await supabaseAdmin.from("candidate_events").insert({
      candidate_id: candidateId,
      user_id: userId,
      event_type: type,
      source,
      event_data: data,
    });
  } catch {
    /* abaikan — timeline opsional */
  }
}
