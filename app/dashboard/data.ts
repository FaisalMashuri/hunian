import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/server";
import { visibleOwnerIds, sharedOwnersFor } from "@/lib/authz/candidate";
import { CandidateStatus } from "@/lib/types/db";
import { budgetZone, type BudgetZone } from "@/lib/pricing";
import { deriveVerdict, type VerdictInput } from "@/lib/scoring/verdict";
import { dataCoverage } from "@/lib/scoring/score";
import { relativeId } from "@/lib/format/relative";
import { loadCoverPhotos } from "@/lib/photos";
import type { Periode } from "@/lib/constants/periode";
import { type CardData } from "./candidate-card";
import { type InsightData } from "./dashboard-client";
import { type BudgetPoint } from "./budget-map";

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

export type DashboardData = {
  active: CardData[];
  archived: CardData[];
  counts: { aktif: number; disurvey: number; pertahankan: number; dealBreaker: number; tersewa: number };
  insights: InsightData[];
  points: BudgetPoint[];
  zoneCount: Record<BudgetZone, number>;
  zoneTotal: number;
};

// Loader dashboard ber-`cache()`: di-dedup React dalam satu request, jadi konten utama
// dan sub-seksi sidebar (distribusi zona) bisa jadi boundary <Suspense> terpisah tanpa fetch ganda.
// Catatan kendala: verdict butuh POOL seluruh kandidat aktif sekaligus → satu dataset, satu loader.
export const loadDashboardData = cache(async function loadDashboardData(
  userId: string,
  ideal: number | null,
  max: number | null,
): Promise<DashboardData> {
  // Collaboration C-1: dashboard menampilkan kandidat sendiri + kandidat yang dibagikan partner.
  const [ownerIds, sharedOwners] = await Promise.all([visibleOwnerIds(userId), sharedOwnersFor(userId)]);
  const ownerNameById = new Map(sharedOwners.map((o) => [o.ownerId, o.ownerName ?? o.ownerEmail]));

  const { data: candidates } = await supabaseAdmin
    .from("candidates")
    .select(
      "id, user_id, title, property_type, status, harga_efektif_bulanan, periode_asli, score_total, score_harga, score_lokasi, score_fasilitas, score_kondisi, score_owner, kamar_tidur, kamar_mandi, luas_bangunan_m2, furnished, carport, dapur, deposit, alamat, kontak_owner, created_at",
    )
    .in("user_id", ownerIds)
    .order("created_at", { ascending: false });

  const rows = candidates ?? [];
  const ids = rows.map((c) => c.id as string);

  // Commute + flags + foto sampul independen setelah `ids` diketahui → fetch paralel.
  const distById: Record<string, number | null> = {};
  const flagById: Record<string, number> = {};
  let coverByCand: Record<string, string> = {};
  if (ids.length > 0) {
    const [{ data: commutes }, { data: flags }, covers] = await Promise.all([
      supabaseAdmin.from("candidate_commute").select("candidate_id, distance_km").in("candidate_id", ids),
      supabaseAdmin.from("candidate_deal_breaker_flags").select("candidate_id").in("candidate_id", ids),
      loadCoverPhotos(ids),
    ]);
    coverByCand = covers;
    for (const c of commutes ?? []) {
      const k = c.candidate_id as string;
      if (distById[k] == null) distById[k] = (c.distance_km as number) ?? null;
    }
    for (const f of flags ?? []) {
      const k = f.candidate_id as string;
      flagById[k] = (flagById[k] ?? 0) + 1;
    }
  }

  const now = new Date();

  // Pool verdict (kandidat aktif) untuk cek dominasi — DIKELOMPOKKAN per owner:
  // skor kandidat partner dihitung terhadap pool partner, bukan dicampur dengan punya kita.
  const activeRows = rows.filter((c) => c.status !== "sudah_tersewa");
  const poolByOwner: Record<string, VerdictInput[]> = {};
  for (const c of activeRows) {
    const owner = c.user_id as string;
    (poolByOwner[owner] ??= []).push({
      id: c.id as string,
      title: c.title as string,
      score_total: (c.score_total as number) ?? null,
      score_harga: (c.score_harga as number) ?? null,
      score_lokasi: (c.score_lokasi as number) ?? null,
      score_fasilitas: (c.score_fasilitas as number) ?? null,
      distanceKm: distById[c.id as string] ?? null,
      flagCount: flagById[c.id as string] ?? 0,
    });
  }

  const toCard = (c: Record<string, unknown>): CardData => {
    const id = c.id as string;
    const ownerId = c.user_id as string;
    const perBulan = (c.harga_efektif_bulanan as number) ?? null;
    const distanceKm = distById[id] ?? null;
    const filled = COMPLETE_FIELDS.filter((f) => c[f] != null).length;
    const score = (c.score_total as number) ?? null;
    const cov = dataCoverage({
      score_harga: (c.score_harga as number) ?? null,
      score_lokasi: (c.score_lokasi as number) ?? null,
      score_fasilitas: (c.score_fasilitas as number) ?? null,
      score_kondisi: (c.score_kondisi as number) ?? null,
      score_owner: (c.score_owner as number) ?? null,
    });
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
      coverageKnown: cov.known,
      coverageTotal: cov.total,
      needsData: score == null || distanceKm == null,
      alamat: (c.alamat as string) ?? null,
      verdict: deriveVerdict(vi, poolByOwner[ownerId] ?? []),
      activity: "Ditambah " + relativeId((c.created_at as string) ?? null, now),
      sharedBy: ownerId === userId ? null : ownerNameById.get(ownerId) ?? "partner",
      photoUrl: coverByCand[id] ?? null,
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
    insights.push({ tone: "amber", title: `${perluData} hunian perlu data`, body: "Skor belum valid karena jarak/budget belum lengkap. Lengkapi agar bisa dibandingkan.", href: "/dashboard", cta: "Lihat" });
  if (siapBanding >= 2)
    insights.push({ tone: "teal", title: `${siapBanding} siap dibandingkan`, body: "Data cukup untuk dilihat trade-off-nya. Bandingkan untuk memutuskan.", href: "/bandingkan", cta: "Bandingkan" });
  if (dealBreaker > 0)
    insights.push({ tone: "blue", title: `${dealBreaker} deal breaker aktif`, body: "Ada hunian dengan kondisi yang kamu hindari. Tinjau sebelum dipertahankan.", href: "/dashboard", cta: "Tinjau" });

  return {
    active,
    archived,
    counts: { aktif: active.length, disurvey, pertahankan, dealBreaker, tersewa: archived.length },
    insights,
    points,
    zoneCount,
    zoneTotal,
  };
});
