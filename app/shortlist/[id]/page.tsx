import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { CandidateStatus, type PropertyType } from "@/lib/types/db";
import { tsFields } from "@/app/input/type-specific";
import type { Periode } from "@/lib/constants/periode";
import { budgetZone, BUDGET_ZONE_META } from "@/lib/pricing";
import { listUnknowns } from "@/lib/extraction/unknowns";
import { deriveVerdict, VERDICT_META, type VerdictInput } from "@/lib/scoring/verdict";
import { dataCoverage, DIM_LABEL } from "@/lib/scoring/score";
import { BottomNav } from "@/components/app/bottom-nav";
import { RadarChart } from "@/app/bandingkan/radar-chart";
import { ExplainPanel } from "./explain-panel";
import { StatusChanger } from "./status-changer";
import { RescoreButton } from "./rescore-button";
import { MapSection } from "./map-section";
import { PhotoSection } from "./photo-section";
import { DetailActionBar } from "./detail-action-bar";
import { DetailMenu } from "./detail-menu";
import { NegotiationControl } from "./negotiation-control";
import { TimelineNote } from "./timeline-note";
import { PoiGate } from "./poi-section";
import { MapSkeleton, PhotoSkeleton, PoiSkeleton } from "./skeletons";

const rp = (n: number | null) => (n == null ? "—" : "Rp " + new Intl.NumberFormat("id-ID").format(n));
const yn = (b: boolean | null) => (b == null ? "—" : b ? "Ya" : "Tidak");
const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : null;

const PROPERTY_LABEL: Record<string, string> = { kontrakan: "KONTRAKAN", apartemen: "APARTEMEN", kost: "KOST" };
const MIN_SEWA_LABEL: Record<string, string> = { bulan: "Bulanan", "3bulan": "3 bulan", "6bulan": "6 bulan", tahun: "Tahunan" };

const STATUS_META: Record<CandidateStatus, { label: string; cls: string; dot: string }> = {
  tersedia: { label: "Tersedia", cls: "bg-emerald-50 text-emerald-700", dot: "bg-emerald-500" },
  sudah_disurvey: { label: "Disurvey", cls: "bg-blue-50 text-blue-700", dot: "bg-blue-500" },
  sudah_tersewa: { label: "Tersewa", cls: "bg-zinc-100 text-zinc-500", dot: "bg-zinc-400" },
};

const DB_LABELS: Record<string, string> = {
  no_parkir_motor: "Tidak ada parkir motor",
  km_di_luar: "Kamar mandi di luar",
  no_memasak: "Tidak boleh masak",
  bayar_setahun_dimuka: "Bayar tahunan di muka",
  no_dapur: "Tidak ada dapur",
  lantai_3_tanpa_lift: "Lantai >3 tanpa lift",
  no_pasutri: "Tidak boleh pasutri",
};

// 08xx / +62 / 62xx -> wa.me e.164 tanpa "+". Hanya membuka link, tidak mengirim apa pun.
function waLink(kontak: string | null): string | null {
  if (!kontak) return null;
  let d = kontak.replace(/[^\d]/g, "");
  if (d.startsWith("0")) d = "62" + d.slice(1);
  else if (!d.startsWith("62")) d = d.length >= 8 ? "62" + d : d;
  return d.length >= 9 ? `https://wa.me/${d}` : null;
}

const dimColor = (v: number | null) => (v == null ? "bg-zinc-300" : v >= 80 ? "bg-emerald-500" : v >= 70 ? "bg-teal-500" : "bg-amber-500");

function SectionHeader({ title, note }: { title: string; note?: string }) {
  return (
    <div className="mb-3.5 mt-6 flex items-center gap-2">
      <h2 className="text-sm font-bold tracking-tight text-zinc-900">{title}</h2>
      {note && <span className="text-xs text-zinc-400">{note}</span>}
      <span className="h-px flex-1 bg-[#E4E3DF]" />
    </div>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="flex items-center gap-2 text-[13px] font-bold text-zinc-900">{children}</h3>;
}

function SpecPill({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-[5px] rounded-lg border border-[#E4E3DF] bg-[#F4F3F0] px-[11px] py-[5px] text-[12.5px] font-medium text-zinc-700">
      {icon && <span className="text-zinc-400">{icon}</span>}
      {children}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-[#E4E3DF] py-2 last:border-0">
      <dt className="text-[12.5px] text-zinc-500">{label}</dt>
      <dd className="text-right text-[13px] font-medium text-zinc-900">{value}</dd>
    </div>
  );
}

// Ikon verdict per kind (selaras VERDICT_META).
function VerdictIcon({ kind, className }: { kind: string; className?: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className };
  if (kind === "pertahankan") return <svg {...common}><path d="M20 6 9 17l-5-5" /></svg>;
  if (kind === "cek_db") return <svg {...common}><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>;
  if (kind === "sisihkan") return <svg {...common}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>;
}

const TONE_BORDER: Record<string, string> = {
  emerald: "border-l-emerald-500",
  amber: "border-l-amber-500",
  rose: "border-l-rose-500",
  zinc: "border-l-zinc-300",
};

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const { data: c } = await supabaseAdmin
    .from("candidates")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (!c) notFound();

  // Query inti (semua independen) → satu batch paralel. Kerja LAMBAT (geocode/route/Overpass/foto)
  // sengaja TIDAK di sini — dipindah ke seksi <Suspense> (map-section/photo-section/poi-gate).
  const [{ data: prefs }, { data: commute }, { data: flags }, { data: survey }, { data: events }, { data: poolRows }] = await Promise.all([
    supabaseAdmin
      .from("user_preferences")
      .select("budget_ideal, budget_max, dest_address, dest_lat, dest_lng, deadline_pindah, transport_modes")
      .eq("user_id", userId)
      .maybeSingle(),
    supabaseAdmin
      .from("candidate_commute")
      .select("distance_km, duration_min, route_summary, transport_mode")
      .eq("candidate_id", id)
      .limit(1)
      .maybeSingle(),
    supabaseAdmin
      .from("candidate_deal_breaker_flags")
      .select("id, user_deal_breakers(deal_breaker_key, custom_text)")
      .eq("candidate_id", id),
    supabaseAdmin.from("candidate_surveys").select("*").eq("candidate_id", id).maybeSingle(),
    supabaseAdmin
      .from("candidate_events")
      .select("event_type, source, event_data, occurred_at")
      .eq("candidate_id", id)
      .eq("user_id", userId)
      .order("occurred_at", { ascending: true }),
    supabaseAdmin
      .from("candidates")
      .select("id, title, status, score_total, score_harga, score_lokasi, score_fasilitas")
      .eq("user_id", userId)
      .neq("status", "sudah_tersewa"),
  ]);

  // ── Pool kandidat aktif (untuk verdict turunan: cek dominasi).
  const poolIds = (poolRows ?? []).map((r) => r.id as string);
  const poolDist: Record<string, number | null> = {};
  const poolFlags: Record<string, number> = {};
  if (poolIds.length > 0) {
    const [{ data: pc }, { data: pf }] = await Promise.all([
      supabaseAdmin.from("candidate_commute").select("candidate_id, distance_km").in("candidate_id", poolIds),
      supabaseAdmin.from("candidate_deal_breaker_flags").select("candidate_id").in("candidate_id", poolIds),
    ]);
    for (const r of pc ?? []) {
      const k = r.candidate_id as string;
      if (poolDist[k] == null) poolDist[k] = (r.distance_km as number) ?? null;
    }
    for (const r of pf ?? []) {
      const k = r.candidate_id as string;
      poolFlags[k] = (poolFlags[k] ?? 0) + 1;
    }
  }
  const verdictPool: VerdictInput[] = (poolRows ?? []).map((r) => ({
    id: r.id as string,
    title: r.title as string,
    score_total: (r.score_total as number) ?? null,
    score_harga: (r.score_harga as number) ?? null,
    score_lokasi: (r.score_lokasi as number) ?? null,
    score_fasilitas: (r.score_fasilitas as number) ?? null,
    distanceKm: poolDist[r.id as string] ?? null,
    flagCount: poolFlags[r.id as string] ?? 0,
  }));

  // Input lokasi (dipakai bersama MapSection & PoiGate; objek SAMA → cache() resolveHome dedup).
  const homeInput = {
    id,
    title: c.title as string,
    location_lat: (c.location_lat as number | null) ?? null,
    location_lng: (c.location_lng as number | null) ?? null,
    alamat: (c.alamat as string | null) ?? null,
  };

  const status = c.status as CandidateStatus;
  const s = STATUS_META[status];

  // ── Survei (Slice 2)
  const surveyed = !!survey;
  const scoreKondisi = c.score_kondisi as number | null;
  const scoreOwner = c.score_owner as number | null;
  const surveyedAt = surveyed ? fmtDate(survey!.surveyed_at as string) : null;
  const SURVEY_DIMS: { key: string; label: string; emoji: string }[] = [
    { key: "kebersihan", label: "Kebersihan", emoji: "🧹" },
    { key: "kebisingan", label: "Kebisingan", emoji: "🔊" },
    { key: "parkir", label: "Parkir", emoji: "🅿️" },
    { key: "keamanan", label: "Keamanan", emoji: "🛡️" },
    { key: "kondisi_bangunan", label: "Kondisi bangunan", emoji: "🏠" },
    { key: "owner", label: "Owner/Pemilik", emoji: "👤" },
  ];

  // ── Timeline (S2-3): event → tampilan.
  const fmtDateTime = (d: string) => new Date(d).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const TL_DOT: Record<string, string> = { teal: "bg-teal-600 border-teal-600", emerald: "bg-emerald-500 border-emerald-500", amber: "bg-amber-500 border-amber-500", zinc: "border-zinc-300 bg-white" };
  const timelineItems = (events ?? []).map((e) => {
    const data = (e.event_data as Record<string, unknown>) ?? {};
    const t = e.event_type as string;
    let text = t;
    let dot = "zinc";
    if (t === "added") { text = `Ditambahkan ke shortlist${data.via === "paste" ? " — dari teks (AI extraction)" : " — manual"}`; dot = "teal"; }
    else if (t === "status_changed") { const to = data.to as string; text = `Status diubah ke ${STATUS_META[to as CandidateStatus]?.label ?? to}`; dot = "emerald"; }
    else if (t === "data_updated") { text = "Data hunian diperbarui"; dot = "zinc"; }
    else if (t === "survey_completed") { text = "Survey lapangan diisi"; dot = "emerald"; }
    else if (t === "price_changed") { text = `Harga diperbarui: ${rp((data.from as number) ?? null)} → ${rp((data.to as number) ?? null)}`; dot = "emerald"; }
    else if (t === "user_note") { text = `📝 ${data.text as string}`; dot = "amber"; }
    return { date: fmtDateTime(e.occurred_at as string), text, dot };
  });

  const periode = (c.periode_asli as Periode | null) ?? null;
  const perBulan = c.harga_efektif_bulanan as number | null;
  const hargaAwal = c.harga_sewa_bulanan as number | null;
  const savings = perBulan != null && hargaAwal != null && hargaAwal > perBulan ? hargaAwal - perBulan : null;
  const ideal = (prefs?.budget_ideal as number) ?? null;
  const max = (prefs?.budget_max as number) ?? null;
  const zone = budgetZone(perBulan, ideal, max);
  const pctOfIdeal = perBulan != null && ideal ? Math.round((perBulan / ideal) * 100) : null;
  const distanceKm = (commute?.distance_km as number) ?? null;
  const wa = waLink(c.kontak_owner as string | null);
  const scoreTotal = c.score_total as number | null;

  const unknowns = listUnknowns(
    {
      kamar_tidur: c.kamar_tidur as number | null,
      kamar_mandi: c.kamar_mandi as number | null,
      furnished: c.furnished as string | null,
      carport: c.carport as boolean | null,
      dapur: c.dapur as boolean | null,
      luas_bangunan_m2: c.luas_bangunan_m2 as number | null,
      deposit: c.deposit as number | null,
    },
    distanceKm,
  );

  type DbRel = { deal_breaker_key: string | null; custom_text: string | null };
  const flagLabels = (flags ?? []).map((f) => {
    const raw = f.user_deal_breakers as unknown as DbRel | DbRel[] | null;
    const u = Array.isArray(raw) ? raw[0] : raw;
    return u?.custom_text || (u?.deal_breaker_key ? DB_LABELS[u.deal_breaker_key] ?? u.deal_breaker_key : "Deal breaker");
  });

  const verdict = deriveVerdict(
    {
      id: id,
      title: c.title as string,
      score_total: scoreTotal,
      score_harga: c.score_harga as number | null,
      score_lokasi: c.score_lokasi as number | null,
      score_fasilitas: c.score_fasilitas as number | null,
      distanceKm,
      flagCount: flagLabels.length,
    },
    verdictPool,
  );
  const vm = VERDICT_META[verdict.kind];

  // Fakta verdict dari data nyata.
  const verdictReasons: string[] = [];
  if (perBulan != null && zone) verdictReasons.push(`Harga ${rp(perBulan)}/bln — ${BUDGET_ZONE_META[zone].label.toLowerCase()}${pctOfIdeal ? ` (${pctOfIdeal}% budget ideal)` : ""}`);
  if (distanceKm != null) verdictReasons.push(`Jarak ${distanceKm} km ke tujuan`);
  verdictReasons.push(flagLabels.length ? `${flagLabels.length} deal breaker perlu dikonfirmasi` : "Tidak ada deal breaker yang dilanggar");

  // Kelengkapan data dimensi (coverage) — skor dihitung dari dimensi yang diketahui saja.
  const cov = dataCoverage({
    score_harga: c.score_harga as number | null,
    score_lokasi: c.score_lokasi as number | null,
    score_fasilitas: c.score_fasilitas as number | null,
    score_kondisi: scoreKondisi,
    score_owner: scoreOwner,
  });
  if (cov.missing.length)
    verdictReasons.push(`Data ${cov.missing.map((k) => DIM_LABEL[k]).join(" & ")} belum ada — skor dari dimensi yang diketahui saja`);

  // Deadline (dari user_preferences).
  const deadlineRaw = (prefs?.deadline_pindah as string) ?? null;
  let daysLeft: number | null = null;
  if (deadlineRaw) {
    const d = new Date(deadlineRaw);
    if (!Number.isNaN(d.getTime())) daysLeft = Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000));
  }

  const platform = (c.platform_asal as string) ?? null;
  const addedDate = fmtDate(c.created_at as string);
  const area = (c.alamat as string) ?? null;

  // ── Data spesifik tipe (S2-6, apartemen/kost) dari type_specific_data.
  const propertyType = ((c.property_type as PropertyType) ?? "kontrakan");
  const tsd = (c.type_specific_data as Record<string, unknown> | null) ?? {};
  const tsRows = tsFields(propertyType)
    .map((f) => ({ label: f.label, kind: f.kind, value: tsd[f.key] }))
    .filter((r) => r.value != null && r.value !== "");

  // ── Biaya all-in (S2-5, DISPLAY-ONLY — tak masuk skor). Kolom numerik dari migration S2-5.
  const listrikN = (c.biaya_listrik_nominal as number | null) ?? null;
  const airN = (c.biaya_air_nominal as number | null) ?? null;
  const iplN = (c.biaya_ipl as number | null) ?? null;
  const deposit = (c.deposit as number | null) ?? null;
  const allInTotal = perBulan != null ? perBulan + (listrikN ?? 0) + (airN ?? 0) + (iplN ?? 0) : null;
  const allInComplete = listrikN != null && airN != null; // IPL opsional
  const upfront = perBulan != null ? perBulan + (deposit ?? 0) : null;

  const specs: { icon?: React.ReactNode; label: string }[] = [];
  if (c.kamar_tidur != null)
    specs.push({ icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 0 4H2" /><path d="M2 16h14a2 2 0 0 1 0 4H2" /></svg>, label: `${c.kamar_tidur} Kamar Tidur` });
  if (c.kamar_mandi != null)
    specs.push({ icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" /><line x1="10" x2="8" y1="5" y2="7" /></svg>, label: `${c.kamar_mandi} Kamar Mandi` });
  if (c.luas_bangunan_m2 != null)
    specs.push({ icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /></svg>, label: `${c.luas_bangunan_m2} m²` });
  if (c.furnished) specs.push({ label: String(c.furnished) });
  if (c.carport) specs.push({ icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="10" x="4" y="10" rx="2" /><path d="M2 20h20" /><path d="M4 10 6 4h12l2 6" /></svg>, label: "Carport" });
  if (c.dapur) specs.push({ icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /></svg>, label: "Dapur" });
  if (c.deposit != null) specs.push({ label: `Deposit ${rp(c.deposit as number)}` });

  const known: string[] = [];
  if (scoreTotal != null) known.push("Skor 3 aspek terhitung");
  if (perBulan != null) known.push("Harga efektif per bulan");
  if (distanceKm != null) known.push(`Jarak ke tujuan (${distanceKm} km)`);
  if (flagLabels.length === 0) known.push("Tidak ada deal breaker yang dilanggar");
  if (area) known.push("Alamat & lokasi di peta");

  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      {/* TOPBAR — sticky, mepet ujung ke ujung */}
      <div className="sticky top-0 z-30 flex h-[54px] items-center gap-3 border-b border-[#E4E3DF] bg-white/95 px-4 backdrop-blur sm:px-6">
        <Link href="/dashboard" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E4E3DF] px-3 py-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-[#F4F3F0] hover:text-zinc-900">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <span className="min-w-0 flex-1 truncate text-[15px] font-bold tracking-tight text-zinc-900">{c.title as string}</span>
        <div className="flex shrink-0 items-center gap-2">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-[7px] rounded-[9px] bg-[#25D366] px-3.5 py-[7px] text-[13px] font-semibold text-white transition-opacity hover:opacity-90">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.477-.911z" /></svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
          <DetailMenu id={id} />
        </div>
      </div>

      {/* STATUS STRIP */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-[#E4E3DF] bg-white px-4 py-2.5 sm:px-6">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${s.cls}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
          {s.label}
        </span>
        <a href="#status" className="rounded-lg border border-[#E4E3DF] px-2.5 py-1 text-xs text-zinc-500 transition-colors hover:bg-[#F4F3F0]">Ubah Status</a>
        {addedDate && (
          <>
            <span className="h-3.5 w-px bg-[#E4E3DF]" />
            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
              Ditambah {addedDate}
            </span>
          </>
        )}
        {surveyedAt && (
          <>
            <span className="h-3.5 w-px bg-[#E4E3DF]" />
            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              Disurvey {surveyedAt}
            </span>
          </>
        )}
        {platform && (
          <>
            <span className="h-3.5 w-px bg-[#E4E3DF]" />
            <span className="flex items-center gap-1.5 text-xs text-zinc-400">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              Platform: {platform}
            </span>
          </>
        )}
      </div>

      <div className="mx-auto max-w-[1200px] px-4 pb-28 pt-6 sm:px-6">
        {/* HEADER PROPERTI */}
        <div className="rounded-2xl border border-[#E4E3DF] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-extrabold leading-[1.2] tracking-tight text-zinc-900 sm:text-[22px]">{c.title as string}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white">{PROPERTY_LABEL[c.property_type as string] ?? String(c.property_type).toUpperCase()}</span>
                {area && <span className="text-[13px] text-zinc-500">{area}</span>}
              </div>
            </div>
            <div className="shrink-0 sm:text-right">
              <div>
                <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-900 sm:text-[26px]">{rp(perBulan)}</span>
                <span className="ml-0.5 text-[13px] text-zinc-500">/bln</span>
              </div>
              {savings != null && hargaAwal != null && (
                <>
                  <div className="mt-0.5 text-xs text-zinc-400 line-through">{rp(hargaAwal)} (harga awal)</div>
                  <div className="mt-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11.5px] font-semibold text-emerald-600">↓ Hemat {rp(savings)}/bln</span>
                  </div>
                </>
              )}
              <NegotiationControl id={id} hargaAkhir={(c.harga_akhir_bulanan as number | null) ?? null} />
            </div>
          </div>

          {(zone || specs.length > 0) && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#E4E3DF] pt-4">
              {zone && (
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-[11px] py-[5px] text-[12.5px] font-semibold ${BUDGET_ZONE_META[zone].pill}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${BUDGET_ZONE_META[zone].dot}`} />
                  {BUDGET_ZONE_META[zone].label}{pctOfIdeal ? ` · ${pctOfIdeal}% budget` : ""}
                </span>
              )}
              {specs.map((sp, i) => (
                <SpecPill key={i} icon={sp.icon}>{sp.label}</SpecPill>
              ))}
            </div>
          )}
        </div>

        {/* GALERI FOTO — di-stream (signed URL Storage tak memblok scaffold) */}
        <div className="mt-5">
          <Suspense fallback={<PhotoSkeleton />}>
            <PhotoSection candidateId={id} />
          </Suspense>
        </div>

        {/* GRID 2 KOLOM */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
          {/* KIRI */}
          <div className="flex flex-col gap-4">
            {/* VERDICT */}
            <div className={`rounded-[14px] border border-l-4 border-[#E4E3DF] bg-white p-5 shadow-sm ${TONE_BORDER[vm.tone]}`}>
              <div className="flex items-center gap-3">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${vm.iconBg}`}>
                  <VerdictIcon kind={verdict.kind} className={vm.iconColor} />
                </span>
                <div className="min-w-0">
                  <div className={`text-lg font-extrabold tracking-tight ${vm.labelColor}`}>{verdict.label}</div>
                  <div className="text-[13px] text-zinc-500">Berdasarkan kriteria yang kamu set — kamu yang tetap memutuskan.</div>
                </div>
              </div>
              <ul className="mt-3.5 flex flex-col gap-1.5">
                {verdictReasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-zinc-700">
                    <span className={`mt-1.5 h-[5px] w-[5px] shrink-0 rounded-full ${vm.iconColor.replace("text-", "bg-")}`} />
                    {r}
                  </li>
                ))}
              </ul>
              <div className="mb-3 mt-3.5 h-px bg-[#E4E3DF]" />
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Yang baru terasa setelah tinggal</div>
              {["Kecocokan tetangga & kenyamanan lingkungan", "Responsivitas owner setelah kontrak berjalan"].map((u) => (
                <div key={u} className="flex items-center gap-1.5 py-0.5 text-[12.5px] text-zinc-500">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-amber-500" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                  {u}
                </div>
              ))}
            </div>

            {/* PENJELASAN AI */}
            <ExplainPanel candidateId={id} />

            {/* PETA — di-stream (geocode + Directions tak lagi memblok render) */}
            <Suspense fallback={<MapSkeleton />}>
              <MapSection candidate={homeInput} prefs={prefs} commute={commute} userId={userId} />
            </Suspense>
          </div>

          {/* KANAN */}
          <div className="flex flex-col gap-4">
            {/* RADAR */}
            <div className="rounded-[14px] border border-[#E4E3DF] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E4E3DF] px-[18px] py-3.5">
                <CardTitle>Evaluasi Aspek</CardTitle>
                <div className="text-right">
                  <div className="text-[22px] font-semibold tabular-nums text-teal-700">{scoreTotal == null ? "—" : Math.round(scoreTotal)}</div>
                  <div className="text-[11px] text-zinc-400">skor total</div>
                  {cov.known < cov.total && <div className="mt-0.5 text-[10px] font-semibold text-amber-600">data {cov.known}/{cov.total}</div>}
                </div>
              </div>
              <div className="px-4 pt-3">
                {scoreTotal == null ? (
                  <p className="px-1 py-6 text-center text-sm text-zinc-500">Belum bisa diskor — data inti (mis. harga/budget) belum cukup.</p>
                ) : (
                  <RadarChart
                    axes={surveyed ? ["Harga", "Lokasi", "Fasilitas", "Kondisi", "Owner"] : ["Harga", "Lokasi", "Fasilitas"]}
                    series={[{
                      label: c.title as string,
                      color: "#0f766e",
                      values: surveyed
                        ? [(c.score_harga as number) ?? 0, (c.score_lokasi as number) ?? 0, (c.score_fasilitas as number) ?? 0, scoreKondisi ?? 0, scoreOwner ?? 0]
                        : [(c.score_harga as number) ?? 0, (c.score_lokasi as number) ?? 0, (c.score_fasilitas as number) ?? 0],
                    }]}
                    size={260}
                  />
                )}
              </div>
              {scoreTotal != null && (
                <div className="flex flex-col gap-1.5 px-[18px] pb-3.5">
                  {([
                    { l: "Harga", v: c.score_harga as number | null },
                    { l: "Lokasi", v: c.score_lokasi as number | null },
                    { l: "Fasilitas", v: c.score_fasilitas as number | null },
                    ...(surveyed ? [{ l: "Kondisi", v: scoreKondisi }, { l: "Owner", v: scoreOwner }] : []),
                  ]).map((d) => (
                    <div key={d.l} className="flex items-center gap-2">
                      <span className="w-[68px] shrink-0 text-[11.5px] text-zinc-500">{d.l}</span>
                      <span className="h-[5px] flex-1 overflow-hidden rounded-full bg-[#F4F3F0]"><span className={`block h-full rounded-full ${dimColor(d.v)}`} style={{ width: `${d.v ?? 0}%` }} /></span>
                      <span className="w-6 shrink-0 text-right text-[11.5px] tabular-nums text-zinc-700">{d.v == null ? "—" : Math.round(d.v)}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between gap-2 border-t border-[#E4E3DF] px-[18px] py-2.5">
                <span className="text-[11px] text-zinc-400">{surveyed ? "5 aspek · termasuk hasil survei" : "Kunjungi tempatnya untuk aktifkan 2 penilaian tambahan"}</span>
                <RescoreButton id={id} />
              </div>
            </div>

            {/* RINCIAN BIAYA ALL-IN — S2-5 (display-only, tak masuk skor) */}
            <div className="rounded-[14px] border border-[#E4E3DF] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E4E3DF] px-[18px] py-3.5">
                <CardTitle>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  Rincian Biaya All-in
                </CardTitle>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10.5px] font-semibold text-zinc-500">estimasi</span>
              </div>
              <div className="px-[18px] py-3">
                <Detail label="Sewa pokok" value={<span className="font-mono text-[12.5px]">{rp(perBulan)}</span>} />
                <Detail label="Listrik" value={listrikN != null ? <span className="font-mono text-[12.5px]">{rp(listrikN)}</span> : <span className="text-amber-600">{(c.biaya_listrik as string) || "Belum diisi"}</span>} />
                <Detail label="Air" value={airN != null ? <span className="font-mono text-[12.5px]">{rp(airN)}</span> : <span className="text-amber-600">{(c.biaya_air as string) || "Belum diisi"}</span>} />
                <Detail label="IPL / service" value={iplN != null ? <span className="font-mono text-[12.5px]">{rp(iplN)}</span> : "—"} />
                <Detail label="Internet" value={<span className="text-zinc-400">Segera</span>} />
                <div className="flex items-baseline justify-between gap-3 border-t-2 border-[#E4E3DF] pt-2.5 mt-1">
                  <dt className="text-[13px] font-bold text-zinc-900">Total all-in</dt>
                  <dd className="font-mono text-[15px] font-semibold text-zinc-900">{rp(allInTotal)}</dd>
                </div>
                <Detail label="Bayar di awal (deposit + sewa 1 bln)" value={<span className="font-mono text-[12.5px] text-zinc-600">{rp(upfront)}</span>} />
                {!allInComplete && (
                  <div className="mt-2.5 rounded-lg bg-amber-50 px-3 py-2 text-[11.5px] text-amber-700">⚠ Biaya listrik/air belum lengkap — total masih estimasi. Lengkapi lewat <strong>Update Survey</strong>.</div>
                )}
                <p className="mt-2 text-[11px] text-zinc-400">Hanya tampilan — biaya all-in tidak memengaruhi skor.</p>
              </div>
            </div>

            {/* DEAL BREAKER CHECK */}
            <div className="rounded-[14px] border border-[#E4E3DF] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E4E3DF] px-[18px] py-3.5">
                <CardTitle>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={flagLabels.length ? "#d97706" : "#059669"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
                  Deal Breaker Check
                </CardTitle>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${flagLabels.length ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-600"}`}>{flagLabels.length ? `${flagLabels.length} ditandai` : "Semua clear"}</span>
              </div>
              <div className="px-[18px] py-3">
                {flagLabels.length === 0 ? (
                  <p className="text-[13px] text-zinc-500">Tidak ada kondisi yang kamu hindari terdeteksi pada hunian ini.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {flagLabels.map((l, i) => (
                      <li key={i} className="flex items-start gap-2 border-l-2 border-amber-400 pl-2.5 text-[13px] text-amber-800">
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {flagLabels.length > 0 && <p className="mt-2.5 text-[11.5px] text-amber-700/80">Ditandai, bukan dihapus — kamu yang putuskan.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* AKSES & LINGKUNGAN SEKITAR — POI nyata dari OpenStreetMap (streaming, tak memblok render) */}
        <Suspense fallback={<PoiSkeleton />}>
          <PoiGate candidate={homeInput} userId={userId} />
        </Suspense>

        {/* HASIL SURVEY — Slice 2 (nyata bila sudah disurvey) */}
        <SectionHeader title="Hasil Survey" note={surveyedAt ?? undefined} />
        {surveyed ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SURVEY_DIMS.map((d) => {
              const rating = (survey![`${d.key}_rating`] as number | null) ?? null;
              const dimTags = (survey![`${d.key}_tags`] as string[] | null) ?? [];
              return (
                <div key={d.key} className="rounded-2xl border border-[#E4E3DF] bg-white p-4 shadow-sm">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="text-[12.5px] font-semibold text-zinc-600">{d.emoji} {d.label}</span>
                    <span className="text-[15px] leading-none tracking-tight">
                      <span className="text-amber-400">{"★".repeat(rating ?? 0)}</span>
                      <span className="text-zinc-300">{"★".repeat(5 - (rating ?? 0))}</span>
                    </span>
                  </div>
                  {dimTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {dimTags.map((t) => (
                        <span key={t} className="rounded-full border border-[#E4E3DF] bg-[#F4F3F0] px-2 py-0.5 text-[11px] text-zinc-600">{t}</span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11.5px] text-zinc-400">Tanpa catatan</span>
                  )}
                </div>
              );
            })}
            {(survey!.catatan_survey as string | null) && (
              <div className="rounded-2xl border border-[#E4E3DF] bg-white p-4 shadow-sm sm:col-span-2 lg:col-span-3">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-zinc-400">Catatan survei</span>
                <p className="whitespace-pre-line text-[13px] leading-relaxed text-zinc-700">{survey!.catatan_survey as string}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#E4E3DF] bg-white p-6 text-center shadow-sm">
            <p className="text-sm font-medium text-zinc-700">Kamu belum mengunjungi tempat ini</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-400">Setelah kunjungan langsung, isi kesan dan kondisi yang kamu lihat. Hunian akan segera perbarui evaluasinya — termasuk nilai kondisi fisik dan penilaian owner.</p>
            <Link href={`/shortlist/${id}/survey`} className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800">Isi Hasil Kunjungan →</Link>
          </div>
        )}

        {/* TIMELINE — S2-3 (nyata dari candidate_events) */}
        <SectionHeader title="Timeline" />
        <div className="rounded-2xl border border-[#E4E3DF] bg-white p-5 shadow-sm">
          {timelineItems.length === 0 ? (
            <p className="text-[13px] text-zinc-500">Belum ada aktivitas tercatat.</p>
          ) : (
            <div className="relative pl-1">
              <span className="absolute bottom-1 left-[5px] top-1 w-px bg-[#E4E3DF]" />
              <div className="flex flex-col gap-3.5">
                {timelineItems.map((it, i) => (
                  <div key={i} className="relative flex gap-3.5 pl-4">
                    <span className={`absolute left-0 top-[5px] z-[1] h-[11px] w-[11px] rounded-full border-2 ${TL_DOT[it.dot]}`} />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[11px] text-zinc-400">{it.date}</div>
                      <div className="text-[13px] leading-relaxed text-zinc-700">{it.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 border-t border-[#E4E3DF] pt-3">
            <TimelineNote id={id} />
          </div>
        </div>

        {/* INFORMASI LENGKAP */}
        <SectionHeader title="Informasi Lengkap" />
        <div className="rounded-2xl border border-[#E4E3DF] bg-white p-5 shadow-sm">
          <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Finansial</div>
              <dl>
                <Detail label="Harga awal" value={`${rp(hargaAwal)}/bln`} />
                {savings != null ? <Detail label="Harga akhir" value={<span className="text-emerald-600">{rp(perBulan)}/bln</span>} /> : <Detail label="Harga efektif" value={`${rp(perBulan)}/bln`} />}
                <Detail label="Periode" value={periode ? MIN_SEWA_LABEL[periode] ?? periode : "—"} />
                <Detail label="Min. sewa" value={c.periode_minimum ? MIN_SEWA_LABEL[c.periode_minimum as string] ?? (c.periode_minimum as string) : "—"} />
                <Detail label="Deposit" value={rp(c.deposit as number | null)} />
                <Detail label="Listrik" value={(c.biaya_listrik as string) ?? "—"} />
                <Detail label="Air" value={(c.biaya_air as string) ?? "—"} />
              </dl>
            </div>
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Properti</div>
              <dl>
                {propertyType === "kontrakan" ? (
                  <>
                    <Detail label="Luas bangunan" value={c.luas_bangunan_m2 ? `${c.luas_bangunan_m2} m²` : "—"} />
                    <Detail label="Kamar tidur" value={(c.kamar_tidur as number | null) ?? "—"} />
                    <Detail label="Kamar mandi" value={(c.kamar_mandi as number | null) ?? "—"} />
                    <Detail label="Furnished" value={(c.furnished as string) ?? "—"} />
                    <Detail label="Carport" value={yn(c.carport as boolean | null)} />
                    <Detail label="Dapur" value={yn(c.dapur as boolean | null)} />
                  </>
                ) : (
                  <>
                    {tsRows.map((r) => (
                      <Detail key={r.label} label={r.label} value={r.kind === "rupiah" ? rp(Number(r.value)) : String(r.value)} />
                    ))}
                    <Detail label="Furnished" value={(c.furnished as string) ?? "—"} />
                  </>
                )}
                <Detail label="Kontak owner" value={(c.kontak_owner as string) ?? "—"} />
              </dl>
            </div>
          </div>

          <div className="mt-5 grid gap-x-8 gap-y-4 border-t border-[#E4E3DF] pt-4 sm:grid-cols-2">
            <div>
              <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600">Yang sudah diketahui</div>
              {known.length === 0 ? (
                <p className="text-[13px] text-zinc-400">—</p>
              ) : (
                known.map((k) => (
                  <div key={k} className="flex items-start gap-2 py-1 text-[13px] text-zinc-700">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
                    {k}
                  </div>
                ))
              )}
            </div>
            <div>
              <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-amber-600">Yang belum lengkap</div>
              {unknowns.length === 0 ? (
                <p className="text-[13px] text-emerald-600">✓ Semua data inti sudah lengkap.</p>
              ) : (
                unknowns.map((u) => (
                  <div key={u} className="flex items-start gap-2 py-1 text-[13px] text-zinc-700">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                    {u}
                  </div>
                ))
              )}
              <Link href={`/shortlist/${id}/edit`} className="mt-2.5 inline-block text-[13px] font-semibold text-teal-700 hover:underline">Lengkapi data →</Link>
            </div>
          </div>
        </div>

        {/* CATATAN */}
        {c.deskripsi ? (
          <div className="mt-4 rounded-2xl border border-[#E4E3DF] bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">Catatan</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">{c.deskripsi as string}</p>
          </div>
        ) : null}

        {/* SUMBER */}
        {c.source_text ? (
          <details className="mt-4 rounded-2xl border border-[#E4E3DF] bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-zinc-600">Lihat teks sumber</summary>
            <p className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-zinc-500">{c.source_text as string}</p>
          </details>
        ) : null}

        {/* STATUS & HAPUS (target anchor #status) */}
        <div id="status" className="mt-4 scroll-mt-20">
          <StatusChanger candidateId={id} status={status} />
        </div>
      </div>

      {/* FOOTER ACTION BAR */}
      <DetailActionBar
        id={id}
        title={c.title as string}
        score={scoreTotal}
        verdictLabel={verdict.label}
        daysLeft={daysLeft}
        archived={status === "sudah_tersewa"}
        surveyed={surveyed}
      />

      {/* Bottom nav hanya di layar kecil */}
      <BottomNav />
    </div>
  );
}
