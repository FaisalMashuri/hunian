import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import { SidebarContext } from "./sidebar-context";
import { SidebarZoneSection } from "./sidebar-zone-section";
import { DashboardContent } from "./dashboard-content";
import { DashboardSkeleton, SidebarZoneSkeleton } from "./skeletons";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  // Hanya prefs (cepat) di shell — wajib utk guard onboarding + konteks budget sidebar.
  const { data: prefs } = await supabaseAdmin
    .from("user_preferences")
    .select("onboarding_completed, budget_ideal, budget_max, weight_harga, weight_lokasi, weight_fasilitas, deadline_pindah")
    .eq("user_id", userId)
    .maybeSingle();
  if (!prefs?.onboarding_completed) redirect("/onboarding");

  const ideal = (prefs.budget_ideal as number) ?? null;
  const max = (prefs.budget_max as number) ?? null;

  // Deadline (dari prefs — tampil instan).
  const deadlineRaw = (prefs.deadline_pindah as string) ?? null;
  let deadlineDate: string | null = null;
  let deadlineDaysLeft: number | null = null;
  if (deadlineRaw) {
    const d = new Date(deadlineRaw);
    if (!Number.isNaN(d.getTime())) {
      deadlineDaysLeft = Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000));
      deadlineDate = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    }
  }

  const user = session.user;
  const initial = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();
  const priorities = [
    { label: "Harga", w: prefs.weight_harga as number | null },
    { label: "Lokasi", w: prefs.weight_lokasi as number | null },
    { label: "Fasilitas", w: prefs.weight_fasilitas as number | null },
  ];

  // Sidebar: Budget/Prioritas/Deadline instan dari prefs; Distribusi zona di-stream.
  const aside = (
    <SidebarContext
      ideal={ideal}
      max={max}
      priorities={priorities}
      zoneSlot={
        <Suspense fallback={<SidebarZoneSkeleton />}>
          <SidebarZoneSection userId={userId} ideal={ideal} max={max} />
        </Suspense>
      }
      deadlineDate={deadlineDate}
      deadlineDaysLeft={deadlineDaysLeft}
    />
  );

  return (
    <AppShell user={{ name: user?.name ?? "—", email: user?.email ?? "—", initial }} aside={aside} bleed>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userId={userId} ideal={ideal} max={max} />
      </Suspense>
    </AppShell>
  );
}
