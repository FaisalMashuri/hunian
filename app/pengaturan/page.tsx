import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { AppShell } from "@/components/app/app-shell";
import { SidebarContext } from "@/app/kandidat/sidebar-context";
import { budgetZone, type BudgetZone } from "@/lib/pricing";
import { SettingsContent, type SettingsInitial } from "./settings-content";
import type { TransportMode } from "@/lib/types/db";

export default async function PengaturanPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { data: prefs } = await supabaseAdmin
    .from("user_preferences")
    .select(
      "onboarding_completed, budget_ideal, budget_max, dest_address, transport_modes, priority_selection, weight_harga, weight_lokasi, weight_fasilitas, deadline_pindah",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (!prefs?.onboarding_completed) redirect("/onboarding");

  const { data: dbs } = await supabaseAdmin
    .from("user_deal_breakers")
    .select("deal_breaker_key, custom_text")
    .eq("user_id", userId)
    .eq("is_active", true);

  const ideal = (prefs.budget_ideal as number) ?? null;
  const max = (prefs.budget_max as number) ?? null;

  // ── Distribusi budget (zona) dari kandidat aktif — untuk panel sidebar.
  const { data: cands } = await supabaseAdmin
    .from("candidates")
    .select("harga_efektif_bulanan")
    .eq("user_id", userId)
    .neq("status", "sudah_tersewa");
  const active = cands ?? [];
  const zoneCount: Record<BudgetZone, number> = { comfort: 0, ideal: 0, stretch: 0, over: 0 };
  for (const c of active) {
    const z = budgetZone(c.harga_efektif_bulanan as number | null, ideal, max);
    if (z) zoneCount[z]++;
  }
  const zoneTotal = Object.values(zoneCount).reduce((a, b) => a + b, 0);

  // ── Deadline → countdown.
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
  const initialChar = (user?.name ?? user?.email ?? "?").charAt(0).toUpperCase();
  const priorities = [
    { label: "Harga", w: prefs.weight_harga as number | null },
    { label: "Lokasi", w: prefs.weight_lokasi as number | null },
    { label: "Fasilitas", w: prefs.weight_fasilitas as number | null },
  ];

  const initial: SettingsInitial = {
    budgetIdeal: ideal ?? 3_000_000,
    budgetMax: max ?? 4_000_000,
    tujuan: (prefs.dest_address as string) ?? "",
    transportModes: (prefs.transport_modes as TransportMode[] | null) ?? [],
    priorities: (prefs.priority_selection as string[] | null) ?? [],
    dealBreakers: (dbs ?? []).map((d) => d.deal_breaker_key as string | null).filter((k): k is string => !!k),
    customDealBreakers: (dbs ?? []).map((d) => d.custom_text as string | null).filter((k): k is string => !!k),
    deadline: deadlineRaw,
  };

  const aside = (
    <SidebarContext
      ideal={ideal}
      max={max}
      priorities={priorities}
      zoneCount={zoneCount}
      zoneTotal={zoneTotal}
      deadlineDate={deadlineDate}
      deadlineDaysLeft={deadlineDaysLeft}
    />
  );

  return (
    <AppShell user={{ name: user?.name ?? "—", email: user?.email ?? "—", initial: initialChar }} aside={aside} navBadge={active.length}>
      <SettingsContent
        initial={initial}
        user={{
          name: user?.name ?? "—",
          email: user?.email ?? "—",
          initial: initialChar,
          candidateCount: active.length,
        }}
      />
    </AppShell>
  );
}
