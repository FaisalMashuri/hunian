import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { computeScore, evalDealBreakers, type Weights } from "@/lib/scoring/score";
import { getDistancesKm } from "@/lib/maps/distance";
import { EMPTY_DRAFT, type ExtractedDraft } from "@/lib/extraction/types";
import type { TransportMode, FurnishedStatus } from "@/lib/types/db";

const MAX_RESCORE = 50;

type Prefs = {
  weights: Weights;
  budgetIdeal: number | null;
  budgetMax: number | null;
  destAddress: string | null;
  primaryMode: TransportMode;
  dealBreakers: { id: string; key: string }[];
};

type CandRow = {
  id: string;
  alamat: string | null;
  harga_efektif_bulanan: number | null;
  furnished: FurnishedStatus | null;
  carport: boolean | null;
  dapur: boolean | null;
  luas_bangunan_m2: number | null;
  score_kondisi: number | null;
  score_owner: number | null;
};

const CAND_FIELDS =
  "id, alamat, harga_efektif_bulanan, furnished, carport, dapur, luas_bangunan_m2, score_kondisi, score_owner";

async function loadPrefs(userId: string): Promise<Prefs> {
  const { data: p } = await supabaseAdmin
    .from("user_preferences")
    .select(
      "weight_harga, weight_lokasi, weight_fasilitas, weight_keamanan, weight_owner, budget_ideal, budget_max, dest_address, transport_modes",
    )
    .eq("user_id", userId)
    .maybeSingle();
  const modes = (p?.transport_modes as TransportMode[] | null) ?? [];

  const { data: dbs } = await supabaseAdmin
    .from("user_deal_breakers")
    .select("id, deal_breaker_key")
    .eq("user_id", userId)
    .eq("is_active", true);

  return {
    // weight_keamanan(DB) ← dimensi "Kondisi"; weight_owner ← "Owner". Default 0.2 bila belum diset.
    weights: {
      harga: (p?.weight_harga as number) ?? 0.34,
      lokasi: (p?.weight_lokasi as number) ?? 0.33,
      fasilitas: (p?.weight_fasilitas as number) ?? 0.33,
      kondisi: (p?.weight_keamanan as number) ?? 0.2,
      owner: (p?.weight_owner as number) ?? 0.2,
    },
    budgetIdeal: (p?.budget_ideal as number) ?? null,
    budgetMax: (p?.budget_max as number) ?? null,
    destAddress: (p?.dest_address as string) ?? null,
    primaryMode: modes[0] ?? "motor",
    dealBreakers: (dbs ?? [])
      .filter((d) => d.deal_breaker_key)
      .map((d) => ({ id: d.id as string, key: d.deal_breaker_key as string })),
  };
}

async function rescoreSet(
  userId: string,
  prefs: Prefs,
  cands: CandRow[],
  forceDistance: boolean,
): Promise<{ count: number; locationWarning: string | null }> {
  if (cands.length === 0) return { count: 0, locationWarning: null };
  const ids = cands.map((c) => c.id);

  // Jarak tersimpan.
  const { data: commutes } = await supabaseAdmin
    .from("candidate_commute")
    .select("candidate_id, distance_km")
    .in("candidate_id", ids);
  const distByCand = new Map<string, number | null>();
  for (const c of commutes ?? []) distByCand.set(c.candidate_id as string, c.distance_km as number | null);

  let locationWarning: string | null = null;
  if (!prefs.destAddress && cands.some((c) => c.alamat)) {
    locationWarning = "Lokasi tujuan (onboarding) belum diisi.";
  }

  // Hitung ulang jarak hanya bila dipaksa (tujuan berubah) atau belum ada.
  const needFetch = cands.filter(
    (c) => c.alamat && prefs.destAddress && (forceDistance || distByCand.get(c.id) == null),
  );
  if (needFetch.length > 0 && prefs.destAddress) {
    const dists = await getDistancesKm(
      prefs.destAddress,
      needFetch.map((c) => c.alamat as string),
      prefs.primaryMode,
    );
    for (let i = 0; i < needFetch.length; i++) {
      const r = dists[i];
      const cid = needFetch[i].id;
      distByCand.set(cid, r.km);
      if (r.error && !locationWarning) locationWarning = r.error;
      if (r.km != null) {
        await supabaseAdmin.from("candidate_commute").delete().eq("candidate_id", cid);
        await supabaseAdmin.from("candidate_commute").insert({
          candidate_id: cid,
          transport_mode: prefs.primaryMode,
          distance_km: r.km,
          api_provider: "google_maps",
        });
      }
    }
  }

  let n = 0;
  for (const c of cands) {
    // score.ts membaca field bernama harga_sewa_bulanan dari draft -> isi dengan harga EFEKTIF (DB).
    const draft: ExtractedDraft = {
      ...EMPTY_DRAFT,
      harga_sewa_bulanan: c.harga_efektif_bulanan,
      furnished: c.furnished,
      carport: c.carport,
      dapur: c.dapur,
      luas_bangunan_m2: c.luas_bangunan_m2,
    };
    const distanceKm = distByCand.get(c.id) ?? null;
    // Skor survei (Kondisi/Owner) sudah tersimpan di candidates — dipakai untuk total 5D, tak ditimpa.
    const score = computeScore(
      draft,
      prefs.weights,
      { ideal: prefs.budgetIdeal, max: prefs.budgetMax },
      distanceKm,
      { kondisi: c.score_kondisi, owner: c.score_owner },
    );

    await supabaseAdmin
      .from("candidates")
      .update({
        scoring_version: score.scoring_version,
        score_total: score.score_total,
        score_harga: score.score_harga,
        score_lokasi: score.score_lokasi,
        score_fasilitas: score.score_fasilitas,
        score_breakdown: score.breakdown,
        score_computed_at: new Date().toISOString(),
      })
      .eq("id", c.id)
      .eq("user_id", userId);

    // Re-eval deal breaker (idempoten): hapus flag lama, pasang yang melanggar.
    await supabaseAdmin.from("candidate_deal_breaker_flags").delete().eq("candidate_id", c.id);
    if (prefs.dealBreakers.length > 0) {
      const violated = new Set(
        evalDealBreakers(prefs.dealBreakers.map((d) => d.key), draft),
      );
      const flags = prefs.dealBreakers
        .filter((d) => violated.has(d.key))
        .map((d) => ({ candidate_id: c.id, deal_breaker_id: d.id }));
      if (flags.length > 0) await supabaseAdmin.from("candidate_deal_breaker_flags").insert(flags);
    }
    n++;
  }
  return { count: n, locationWarning };
}

// Re-score semua kandidat aktif user (dipanggil setelah edit preferensi).
export async function rescoreAllForUser(
  userId: string,
  opts: { destChanged?: boolean } = {},
): Promise<number> {
  const prefs = await loadPrefs(userId);
  const { data: cands } = await supabaseAdmin
    .from("candidates")
    .select(CAND_FIELDS)
    .eq("user_id", userId)
    .neq("status", "sudah_tersewa")
    .order("created_at", { ascending: false })
    .limit(MAX_RESCORE);
  const r = await rescoreSet(userId, prefs, (cands ?? []) as CandRow[], !!opts.destChanged);
  return r.count;
}

// Re-score satu kandidat (dipanggil setelah edit kandidat / tombol "hitung ulang").
export async function rescoreCandidate(
  userId: string,
  candidateId: string,
  opts: { recomputeDistance?: boolean } = {},
): Promise<{ count: number; locationWarning: string | null }> {
  const prefs = await loadPrefs(userId);
  const { data: c } = await supabaseAdmin
    .from("candidates")
    .select(CAND_FIELDS)
    .eq("id", candidateId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!c) return { count: 0, locationWarning: null };
  return rescoreSet(userId, prefs, [c as CandRow], !!opts.recomputeDistance);
}
