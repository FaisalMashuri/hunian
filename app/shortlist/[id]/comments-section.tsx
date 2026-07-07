import { supabaseAdmin } from "@/lib/supabase/server";
import { CommentsThread, type CommentItem } from "./comments-thread";

// Collaboration C-2: diskusi per kandidat — di-stream via <Suspense> (query komentar + nama author).
// Akses ke halaman detail sudah diverifikasi (resolveCandidateAccess) sebelum seksi ini render.
export async function CommentsSection({ candidateId, currentUserId }: { candidateId: string; currentUserId: string }) {
  const { data: rows } = await supabaseAdmin
    .from("candidate_comments")
    .select("id, body, created_at, author_id")
    .eq("candidate_id", candidateId)
    .order("created_at", { ascending: true });
  const list = rows ?? [];

  const authorIds = [...new Set(list.map((r) => r.author_id as string))];
  const nameById = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: users } = await supabaseAdmin.from("users").select("id, name, email").in("id", authorIds);
    for (const u of users ?? []) nameById.set(u.id as string, (u.name as string) || (u.email as string) || "Partner");
  }

  const comments: CommentItem[] = list.map((r) => ({
    id: r.id as string,
    body: r.body as string,
    createdAt: r.created_at as string,
    authorName: nameById.get(r.author_id as string) ?? "Partner",
    isMine: (r.author_id as string) === currentUserId,
  }));

  return <CommentsThread candidateId={candidateId} comments={comments} />;
}
