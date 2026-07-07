import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/server";

// ==============================================================
// Authz terpusat untuk kandidat — gerbang tunggal akses lintas-akun (Collaboration C-1).
//
// Konteks: service role BYPASS RLS (lihat db/schema.sql SECTION 6). Sebelum collaboration,
// setiap query cukup `.eq("user_id", userId)`. Sejak share antar-akun, READ path harus
// mengizinkan kandidat milik owner yang membagikan shortlist-nya ke email viewer.
//
// Aturan:
//  - READ: `.in("user_id", await visibleOwnerIds(userId))` (diri sendiri + owner yang share aktif).
//  - WRITE: tetap owner-only di C-1 (`.eq("user_id", ownerId)`), atau `assertCandidateAccess(..,"owner")`.
//    Untuk C-2 (editor), turunkan requiredRole ke "editor".
//
// Sharing dicocokkan lewat EMAIL (collab_shares.grantee_email = users.email), jadi partner
// yang belum pernah login pun tetap "terdaftar" begitu dia login dengan email tsb.
// ==============================================================

export type AccessRole = "owner" | "editor" | "viewer";

export type CandidateAccess = {
  candidateId: string;
  ownerId: string; // pemilik kandidat (candidates.user_id) — sumber prefs/skor/timeline
  role: AccessRole;
  isOwner: boolean;
};

export type SharedOwner = { ownerId: string; ownerName: string | null; ownerEmail: string };

// Email (lowercase) viewer dari tabel users. Dibungkus cache() → dedup per request.
const viewerEmail = cache(async function viewerEmail(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin.from("users").select("email").eq("id", userId).maybeSingle();
  const email = (data?.email as string | undefined) ?? null;
  return email ? email.toLowerCase() : null;
});

// Owner yang membagikan shortlist-nya ke viewer (share aktif). Dengan nama untuk badge UI.
export const sharedOwnersFor = cache(async function sharedOwnersFor(userId: string): Promise<SharedOwner[]> {
  const email = await viewerEmail(userId);
  if (!email) return [];
  const { data: shares } = await supabaseAdmin
    .from("collab_shares")
    .select("owner_id")
    .eq("grantee_email", email)
    .eq("status", "active");
  const ownerIds = [...new Set((shares ?? []).map((s) => s.owner_id as string))].filter((id) => id !== userId);
  if (ownerIds.length === 0) return [];
  const { data: owners } = await supabaseAdmin.from("users").select("id, name, email").in("id", ownerIds);
  const byId = new Map((owners ?? []).map((o) => [o.id as string, o]));
  return ownerIds.map((id) => ({
    ownerId: id,
    ownerName: (byId.get(id)?.name as string | undefined) ?? null,
    ownerEmail: (byId.get(id)?.email as string | undefined) ?? "",
  }));
});

// Daftar user_id yang datanya boleh DIBACA viewer: diri sendiri + owner yang share aktif.
// Dipakai di READ path: `.in("user_id", await visibleOwnerIds(userId))`.
export const visibleOwnerIds = cache(async function visibleOwnerIds(userId: string): Promise<string[]> {
  const shared = await sharedOwnersFor(userId);
  return [userId, ...shared.map((s) => s.ownerId)];
});

// Resolusi akses satu kandidat: owner? share aktif? tidak ada akses (null).
export const resolveCandidateAccess = cache(async function resolveCandidateAccess(
  userId: string,
  candidateId: string,
): Promise<CandidateAccess | null> {
  const { data: cand } = await supabaseAdmin
    .from("candidates")
    .select("user_id")
    .eq("id", candidateId)
    .maybeSingle();
  if (!cand) return null;
  const ownerId = cand.user_id as string;
  if (ownerId === userId) {
    return { candidateId, ownerId, role: "owner", isOwner: true };
  }
  const email = await viewerEmail(userId);
  if (!email) return null;
  const { data: share } = await supabaseAdmin
    .from("collab_shares")
    .select("role")
    .eq("owner_id", ownerId)
    .eq("grantee_email", email)
    .eq("status", "active")
    .maybeSingle();
  if (!share) return null;
  const role = (share.role as string) === "editor" ? "editor" : "viewer";
  return { candidateId, ownerId, role, isOwner: false };
});

const ROLE_RANK: Record<AccessRole, number> = { viewer: 1, editor: 2, owner: 3 };

// Gerbang untuk WRITE/aksi sensitif. Melempar bila akses < required. Untuk C-1 gunakan "owner".
export async function assertCandidateAccess(
  userId: string,
  candidateId: string,
  requiredRole: AccessRole = "owner",
): Promise<CandidateAccess> {
  const access = await resolveCandidateAccess(userId, candidateId);
  if (!access || ROLE_RANK[access.role] < ROLE_RANK[requiredRole]) {
    throw new Error("FORBIDDEN: tidak punya akses ke hunian ini.");
  }
  return access;
}
