import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sharedOwnersFor } from "@/lib/authz/candidate";
import { BottomNav } from "@/components/app/bottom-nav";
import { KolaborasiClient, type Partner, type SharedWithMe } from "./kolaborasi-client";

export default async function KolaborasiPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  // Partner yang kuundang (share aktif) + shortlist yang dibagikan ke aku.
  const [{ data: shares }, sharedOwners] = await Promise.all([
    supabaseAdmin
      .from("collab_shares")
      .select("grantee_email, role")
      .eq("owner_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: true }),
    sharedOwnersFor(userId),
  ]);

  const partners: Partner[] = (shares ?? []).map((s) => ({ email: s.grantee_email as string, role: s.role as string }));
  const sharedWithMe: SharedWithMe[] = sharedOwners.map((o) => ({ ownerName: o.ownerName, ownerEmail: o.ownerEmail }));

  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      {/* TOPBAR */}
      <div className="sticky top-9 z-30 flex h-[54px] items-center gap-3 border-b border-[#E4E3DF] bg-white/95 px-4 backdrop-blur sm:px-6">
        <Link
          href="/dashboard"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E4E3DF] px-3 py-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-[#F4F3F0] hover:text-zinc-900"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <span className="min-w-0 flex-1 truncate text-[15px] font-bold tracking-tight text-zinc-900">Kolaborasi</span>
      </div>

      <div className="mx-auto max-w-[720px] px-4 pb-28 pt-6 sm:px-6">
        <div className="mb-5">
          <h1 className="text-xl font-extrabold tracking-tight text-zinc-900">Cari rumah bareng</h1>
          <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-500">
            Ajak pasanganmu melihat &amp; membandingkan hunian yang sama, tanpa perlu screenshot dan kirim-kirim.
          </p>
        </div>
        <KolaborasiClient partners={partners} sharedWithMe={sharedWithMe} />
      </div>

      <BottomNav />
    </div>
  );
}
