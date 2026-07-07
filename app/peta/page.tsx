import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { Sidebar } from "@/components/app/sidebar";
import { BottomNav } from "@/components/app/bottom-nav";
import { PetaContent } from "./peta-content";

export default async function PetaPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  // Guard onboarding (butuh budget/tujuan) — cepat, di shell.
  const { data: prefs } = await supabaseAdmin
    .from("user_preferences")
    .select("onboarding_completed")
    .eq("user_id", userId)
    .maybeSingle();
  if (!prefs?.onboarding_completed) redirect("/onboarding");

  const u = session.user;
  const user = { name: u?.name ?? "—", initial: (u?.name ?? u?.email ?? "?").charAt(0).toUpperCase() };

  // Shell konsisten: sidebar (desktop) + bottom nav (mobile). Peta mengisi tinggi penuh area konten.
  return (
    <div className="min-h-screen sm:pl-64">
      <Sidebar />
      <main className="h-[100dvh] w-full">
        <Suspense fallback={<div className="h-[100dvh] w-full animate-pulse bg-[#eceae5]" />}>
          <PetaContent userId={userId} user={user} />
        </Suspense>
      </main>
      <BottomNav />
    </div>
  );
}
