import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";
import { visibleOwnerIds } from "@/lib/authz/candidate";
import { CompareClient, type CompareCandidate } from "./compare-client";
import type { Periode } from "@/lib/constants/periode";

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

// Label deal breaker preset (selaras app/kandidat/[id]/page.tsx).
const DB_LABELS: Record<string, string> = {
  no_parkir_motor: "Tidak ada parkir motor",
  km_di_luar: "Kamar mandi di luar",
  no_memasak: "Tidak boleh masak",
  bayar_setahun_dimuka: "Bayar tahunan di muka",
  no_dapur: "Tidak ada dapur",
  lantai_3_tanpa_lift: "Lantai >3 tanpa lift",
  no_pasutri: "Tidak boleh pasutri",
};

type DbRel = { deal_breaker_key: string | null; custom_text: string | null };

// Konten Bandingkan — di-stream via <Suspense>. Fetch candidates → lalu commute/flags/surveys PARALEL.
export async function CompareContent({
  userId,
  idsParam,
  budget,
  weights,
}: {
  userId: string;
  idsParam: string | undefined;
  budget: { ideal: number | null; max: number | null };
  weights: { harga: number; lokasi: number; fasilitas: number };
}) {
  // Collaboration C-1: bisa membandingkan kandidat sendiri + kandidat yang dibagikan partner.
  const ownerIds = await visibleOwnerIds(userId);
  const { data: cands } = await supabaseAdmin
    .from("candidates")
    .select(
      "id, title, harga_efektif_bulanan, harga_sewa_bulanan, deposit, score_total, score_harga, score_lokasi, score_fasilitas, score_kondisi, score_owner, kamar_tidur, kamar_mandi, luas_bangunan_m2, furnished, carport, dapur, alamat, kontak_owner, periode_asli, biaya_listrik",
    )
    .in("user_id", ownerIds)
    .neq("status", "sudah_tersewa")
    .order("score_total", { ascending: false, nullsFirst: false });

  const list = cands ?? [];
  const ids = list.map((c) => c.id as string);

  const distById: Record<string, number | null> = {};
  const durById: Record<string, number | null> = {};
  const dbById: Record<string, string[]> = {};
  const surveyById: Record<string, Record<string, number | null>> = {};
  if (ids.length > 0) {
    // commute / flags / surveys independen → satu batch paralel (sebelumnya serial).
    const [{ data: commutes }, { data: flags }, { data: surveys }] = await Promise.all([
      supabaseAdmin.from("candidate_commute").select("candidate_id, distance_km, duration_min").in("candidate_id", ids),
      supabaseAdmin.from("candidate_deal_breaker_flags").select("candidate_id, user_deal_breakers(deal_breaker_key, custom_text)").in("candidate_id", ids),
      supabaseAdmin.from("candidate_surveys").select("candidate_id, kebersihan_rating, kebisingan_rating, kondisi_bangunan_rating, owner_rating").in("candidate_id", ids),
    ]);
    for (const r of commutes ?? []) {
      const k = r.candidate_id as string;
      if (!(k in distById)) {
        distById[k] = (r.distance_km as number) ?? null;
        durById[k] = (r.duration_min as number) ?? null;
      }
    }
    for (const f of flags ?? []) {
      const k = f.candidate_id as string;
      const raw = f.user_deal_breakers as unknown as DbRel | DbRel[] | null;
      const u = Array.isArray(raw) ? raw[0] : raw;
      const label = u?.custom_text || (u?.deal_breaker_key ? DB_LABELS[u.deal_breaker_key] ?? u.deal_breaker_key : "Deal breaker");
      (dbById[k] ??= []).push(label);
    }
    for (const sv of surveys ?? []) {
      surveyById[sv.candidate_id as string] = {
        kebersihan: (sv.kebersihan_rating as number | null) ?? null,
        kebisingan: (sv.kebisingan_rating as number | null) ?? null,
        kondisi_bangunan: (sv.kondisi_bangunan_rating as number | null) ?? null,
        owner: (sv.owner_rating as number | null) ?? null,
      };
    }
  }

  const candidates: CompareCandidate[] = list.map((c) => {
    const row = c as Record<string, unknown>;
    const filled = COMPLETE_FIELDS.filter((f) => row[f] != null).length;
    const harga = c.harga_efektif_bulanan as number | null;
    const deposit = c.deposit as number | null;
    return {
      id: c.id as string,
      title: c.title as string,
      harga,
      hargaAwal: c.harga_sewa_bulanan as number | null,
      periode: (c.periode_asli as Periode | null) ?? null,
      deposit,
      upfront: harga != null ? harga + (deposit ?? 0) : null,
      scoreTotal: c.score_total as number | null,
      scoreHarga: c.score_harga as number | null,
      scoreLokasi: c.score_lokasi as number | null,
      scoreFasilitas: c.score_fasilitas as number | null,
      scoreKondisi: (c.score_kondisi as number | null) ?? null,
      scoreOwner: (c.score_owner as number | null) ?? null,
      survey: surveyById[c.id as string] ?? null,
      distanceKm: distById[c.id as string] ?? null,
      durationMin: durById[c.id as string] ?? null,
      dealBreakers: dbById[c.id as string] ?? [],
      furnished: (c.furnished as string | null) ?? null,
      dapur: (c.dapur as boolean | null) ?? null,
      carport: (c.carport as boolean | null) ?? null,
      kamarTidur: (c.kamar_tidur as number | null) ?? null,
      kamarMandi: (c.kamar_mandi as number | null) ?? null,
      luas: (c.luas_bangunan_m2 as number | null) ?? null,
      biayaListrik: (c.biaya_listrik as string | null) ?? null,
      completeness: Math.round((filled / COMPLETE_FIELDS.length) * 100),
    };
  });

  // Pra-pilih dari dashboard/detail (?ids=a,b,c) — hanya id valid, maksimal 4.
  const validIds = new Set(candidates.map((c) => c.id));
  const initialSelected = (idsParam ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => validIds.has(x))
    .slice(0, 4);

  if (candidates.length === 0) {
    return (
      <div className="min-h-screen bg-[#F4F3F0]">
        <div className="mx-auto max-w-[1100px] px-6 py-16 text-center">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">Shortlistmu masih kosong</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-600">
            Tambahkan hunian dari listing yang sudah kamu temukan, lalu bandingkan di sini.
          </p>
          <Link href="/input" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800">
            + Tambah ke Shortlist
          </Link>
        </div>
      </div>
    );
  }

  return <CompareClient candidates={candidates} initialSelected={initialSelected} budget={budget} weights={weights} />;
}
