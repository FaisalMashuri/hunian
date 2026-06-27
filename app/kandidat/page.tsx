import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { CandidateStatus } from "@/lib/types/db";
import { AppShell } from "@/components/app/app-shell";
import { budgetZone, type BudgetZone } from "@/lib/pricing";
import { deriveVerdict, type VerdictInput } from "@/lib/scoring/verdict";
import { relativeId } from "@/lib/format/relative";
import type { Periode } from "@/lib/constants/periode";
import Link from "next/link";
import { DashboardClient, type InsightData } from "./dashboard-client";
import { type CardData } from "./candidate-card";
import { BudgetMap, type BudgetPoint } from "./budget-map";
import { SidebarContext } from "./sidebar-context";

const COMPLETE_FIELDS = [
  "harga_efektif_bulanan",
  "deposit",
  "kamar_tidur",
  "kamar_mandi",
  "luas_bangunan_m2",
  "furnished",
  "carport",
  "dapur",
  "alamat",
  "kontak_owner",
];

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { data: prefs } = await supabaseAdmin
    .from("user_preferences")
    .select("onboarding_completed, budget_ideal, budget_max, weight_harga, weight_lokasi, weight_fasilitas, deadline_pindah")
    .eq("user_id", userId)
    .maybeSingle();
  if (!prefs?.onboarding_completed) redirect("/onboarding");

  const ideal = (prefs.budget_ideal as number) ?? null;
  const max = (prefs.budget_max as number) ?? null;

  const { data: candidates } = await supabaseAdmin
    .from("candidates")
    .select(
      "id, title, property_type, status, harga_efektif_bulanan, periode_asli, score_total, score_harga, score_lokasi, score_fasilitas, kamar_tidur, kamar_mandi, luas_bangunan_m2, furnished, carport, dapur, deposit, alamat, kontak_owner, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const rows = candidates ?? [];
  const ids = rows.map((c) => c.id as string);

  const distById: Record<string, number | null> = {};
  if (ids.length > 0) {
    const { data: commutes } = await supabaseAdmin
      .from("candidate_commute")
      .select("candidate_id, distance_km")
      .in("candidate_id", ids);
    for (const c of commutes ?? []) {
      const k = c.candidate_id as string;
      if (distById[k] == null) distById[k] = (c.distance_km as number) ?? null;
    }
  }

  const flagById: Record<string, number> = {};
  if (ids.length > 0) {
    const { data: flags } = await supabaseAdmin
      .from("candidate_deal_breaker_flags")
      .select("candidate_id")
      .in("candidate_id", ids);
    for (const f of flags ?? []) {
      const k = f.candidate_id as string;
      flagById[k] = (flagById[k] ?? 0) + 1;
    }
  }

  const now = new Date();

  // Pool verdict (kandidat aktif) untuk cek dominasi.
  const activeRows = rows.filter((c) => c.status !== "sudah_tersewa");
  const verdictPool: VerdictInput[] = activeRows.map((c) => ({
    id: c.id as string,
    title: c.title as string,
    score_total: (c.score_total as number) ?? null,
    score_harga: (c.score_harga as number) ?? null,
    score_lokasi: (c.score_lokasi as number) ?? null,
    score_fasilitas: (c.score_fasilitas as number) ?? null,
    distanceKm: distById[c.id as string] ?? null,
    flagCount: flagById[c.id as string] ?? 0,
  }));

  const toCard = (c: Record<string, unknown>): CardData => {
    const id = c.id as string;
    const perBulan = (c.harga_efektif_bulanan as number) ?? null;
    const distanceKm = distById[id] ?? null;
    const filled = COMPLETE_FIELDS.filter((f) => c[f] != null).length;
    const score = (c.score_total as number) ?? null;
    const vi: VerdictInput = {
      id,
      title: c.title as string,
      score_total: score,
      score_harga: (c.score_harga as number) ?? null,
      score_lokasi: (c.score_lokasi as number) ?? null,
      score_fasilitas: (c.score_fasilitas as number) ?? null,
      distanceKm,
      flagCount: flagById[id] ?? 0,
    };
    return {
      id,
      title: c.title as string,
      property_type: c.property_type as string,
      status: c.status as CandidateStatus,
      score_total: score,
      perBulan,
      periode: (c.periode_asli as Periode | null) ?? null,
      zone: budgetZone(perBulan, ideal, max),
      distanceKm,
      flagCount: flagById[id] ?? 0,
      completeness: Math.round((filled / COMPLETE_FIELDS.length) * 100),
      needsData: score == null || distanceKm == null,
      alamat: (c.alamat as string) ?? null,
      verdict: deriveVerdict(vi, verdictPool),
      activity: "Ditambah " + relativeId((c.created_at as string) ?? null, now),
    };
  };

  const allCards = rows.map((c) => toCard(c as Record<string, unknown>));
  const active = allCards.filter((c) => c.status !== "sudah_tersewa");
  const archived = allCards.filter((c) => c.status === "sudah_tersewa");

  const perluData = active.filter((c) => c.needsData).length;
  const siapBanding = active.filter((c) => !c.needsData).length;
  const dealBreaker = active.filter((c) => c.flagCount > 0).length;
  const disurvey = active.filter((c) => c.status === "sudah_disurvey").length;
  const pertahankan = active.filter((c) => c.verdict.kind === "pertahankan" || c.verdict.kind === "cek_db").length;

  const zoneCount: Record<BudgetZone, number> = { comfort: 0, ideal: 0, stretch: 0, over: 0 };
  for (const c of active) if (c.zone) zoneCount[c.zone]++;
  const zoneTotal = Object.values(zoneCount).reduce((a, b) => a + b, 0);

  const points: BudgetPoint[] = allCards
    .filter((c) => c.perBulan != null)
    .map((c) => ({ id: c.id, label: c.title, perBulan: c.perBulan as number, zone: c.zone, archived: c.status === "sudah_tersewa" }));

  const insights: InsightData[] = [];
  if (perluData > 0)
    insights.push({ tone: "amber", title: `${perluData} kandidat perlu data`, body: "Skor belum valid karena jarak/budget belum lengkap. Lengkapi agar bisa dibandingkan.", href: "/kandidat", cta: "Lihat" });
  if (siapBanding >= 2)
    insights.push({ tone: "teal", title: `${siapBanding} siap dibandingkan`, body: "Data cukup untuk dilihat trade-off-nya. Bandingkan untuk memutuskan.", href: "/bandingkan", cta: "Bandingkan" });
  if (dealBreaker > 0)
    insights.push({ tone: "blue", title: `${dealBreaker} deal breaker aktif`, body: "Ada kandidat dengan kondisi yang kamu hindari. Tinjau sebelum dipertahankan.", href: "/kandidat", cta: "Tinjau" });

  // Deadline
  const deadlineRaw = (prefs.deadline_pindah as string) ?? null;
  let deadlineDate: string | null = null;
  let deadlineDaysLeft: number | null = null;
  if (deadlineRaw) {
    const d = new Date(deadlineRaw);
    if (!Number.isNaN(d.getTime())) {
      deadlineDaysLeft = Math.max(0, Math.ceil((d.getTime() - now.getTime()) / 86_400_000));
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
    <AppShell user={{ name: user?.name ?? "—", email: user?.email ?? "—", initial }} aside={aside} navBadge={active.length} bleed>
      {active.length === 0 ? (
        <div className="mx-4 mt-6 rounded-3xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center sm:mx-6">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-2xl text-teal-700">+</div>
          <h3 className="text-lg font-bold tracking-tight text-zinc-900">Belum ada kandidat</h3>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-600">
            Tempel listing pertama yang sudah kamu temukan — dari WhatsApp, OLX, atau Mamikos. Hunian rapikan datanya dan bantu kamu membandingkan.
          </p>
          <Link href="/input" className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-teal-700 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800">
            + Tambah kandidat pertama
          </Link>
        </div>
      ) : (
        <DashboardClient
          cards={active}
          archived={archived}
          title="Hunian Saya"
          sub={`${active.length} kandidat aktif · ${disurvey} disurvey`}
          counts={{ aktif: active.length, disurvey, pertahankan, dealBreaker, tersewa: archived.length }}
          insights={insights}
          budgetMap={<BudgetMap ideal={ideal} max={max} points={points} />}
        />
      )}
    </AppShell>
  );
}
