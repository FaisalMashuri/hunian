"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { recordDecisionAction } from "./actions";
import { formatHargaListing, rpShort, budgetZone, BUDGET_ZONE_META } from "@/lib/pricing";
import type { Periode } from "@/lib/constants/periode";
import { CompareRadar, type RadarSeriesDef } from "./compare-radar";

export type CompareCandidate = {
  id: string;
  title: string;
  harga: number | null;
  hargaAwal: number | null;
  periode: Periode | null;
  deposit: number | null;
  upfront: number | null;
  scoreTotal: number | null;
  scoreHarga: number | null;
  scoreLokasi: number | null;
  scoreFasilitas: number | null;
  scoreKondisi: number | null;
  scoreOwner: number | null;
  survey: Record<string, number | null> | null; // rating per aspek (kebersihan/kebisingan/kondisi_bangunan/owner)
  distanceKm: number | null;
  durationMin: number | null;
  dealBreakers: string[];
  furnished: string | null;
  dapur: boolean | null;
  carport: boolean | null;
  kamarTidur: number | null;
  kamarMandi: number | null;
  luas: number | null;
  biayaListrik: string | null;
  completeness: number;
};

type Budget = { ideal: number | null; max: number | null };
type Weights = { harga: number; lokasi: number; fasilitas: number };

// Warna per kandidat (A teal, B oranye — selaras mockup; lalu violet, cyan utk 3–4).
const TONES = [
  { color: "#0F766E", bg: "#F0FDFA", border: "#99F6E4" },
  { color: "#E8621A", bg: "#FFF7F0", border: "#FED7AA" },
  { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
  { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC" },
];
const tone = (i: number) => TONES[i % TONES.length];

const PRIO_TAG: Record<string, { label: string; cls: string }> = {
  harga: { label: "Harga", cls: "bg-[#EDE9FE] text-[#5B21B6]" },
  lokasi: { label: "Lokasi", cls: "bg-[#DBEAFE] text-[#1D4ED8]" },
  fasilitas: { label: "Fasilitas", cls: "bg-[#FCE7F3] text-[#9D174D]" },
};

const rp = (n: number | null | undefined) => (n == null ? "—" : "Rp " + new Intl.NumberFormat("id-ID").format(n));
const fmtKm = (n: number | null) => (n == null ? "—" : n.toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " km");

// Bintang dari skor 0–100 (÷20) atau rating 1–5 langsung.
function Stars5({ n }: { n: number }) {
  const v = Math.max(0, Math.min(5, Math.round(n)));
  return <span className="tracking-tight text-[13px]"><span className="text-amber-400">{"★".repeat(v)}</span><span className="text-zinc-300">{"★".repeat(5 - v)}</span></span>;
}
function ScoreStars({ score }: { score: number }) {
  return <Stars5 n={score / 20} />;
}

function minBy<T>(arr: T[], f: (x: T) => number | null): T | null {
  let best: T | null = null;
  let bv = Infinity;
  for (const x of arr) {
    const v = f(x);
    if (v != null && v < bv) { bv = v; best = x; }
  }
  return best;
}
function maxBy<T>(arr: T[], f: (x: T) => number | null): T | null {
  let best: T | null = null;
  let bv = -Infinity;
  for (const x of arr) {
    const v = f(x);
    if (v != null && v > bv) { bv = v; best = x; }
  }
  return best;
}

export function CompareClient({
  candidates,
  initialSelected,
  budget,
  weights,
}: {
  candidates: CompareCandidate[];
  initialSelected: string[];
  budget: Budget;
  weights: Weights;
}) {
  const byId = useMemo(() => Object.fromEntries(candidates.map((c) => [c.id, c])), [candidates]);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const base = initialSelected.length >= 2 ? initialSelected : candidates.slice(0, Math.min(2, candidates.length)).map((c) => c.id);
    return base.slice(0, 4);
  });
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirm, setConfirm] = useState<CompareCandidate | null>(null);
  const [chosen, setChosen] = useState<CompareCandidate | null>(null);
  const [memo, setMemo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();

  const sel = selectedIds.map((id) => byId[id]).filter(Boolean) as CompareCandidate[];

  const prioOrder = useMemo(() => {
    return (["harga", "lokasi", "fasilitas"] as const)
      .map((k) => ({ k, w: weights[k] }))
      .sort((a, b) => b.w - a.w)
      .map((x) => x.k);
  }, [weights]);

  const cheapest = minBy(sel, (c) => c.harga);
  const dearest = maxBy(sel, (c) => c.harga);
  const nearest = minBy(sel, (c) => c.distanceKm);
  const farthest = maxBy(sel, (c) => c.distanceKm);
  const minUpfront = minBy(sel, (c) => c.upfront);
  const maxUpfront = maxBy(sel, (c) => c.upfront);
  const hargaDiff = cheapest && dearest && cheapest.harga != null && dearest.harga != null ? dearest.harga - cheapest.harga : null;
  const distDiff = nearest && farthest && nearest.distanceKm != null && farthest.distanceKm != null ? Math.round((farthest.distanceKm - nearest.distanceKm) * 10) / 10 : null;
  const dbCand = sel.find((c) => c.dealBreakers.length > 0) ?? null;

  const toggle = (id: string) => {
    setSelectedIds((cur) => {
      if (cur.includes(id)) return cur.length <= 2 ? cur : cur.filter((x) => x !== id);
      return cur.length >= 4 ? cur : [...cur, id];
    });
  };

  function buildMemo(c: CompareCandidate): string {
    const tgl = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const lines: string[] = [];
    lines.push(`Kamu memilih ${c.title} pada ${tgl}.`);
    lines.push("");
    const reasons: string[] = [];
    if (cheapest?.id === c.id && hargaDiff) reasons.push(`harga ${rp(c.harga)}/bln — termurah di antara pilihan (hemat hingga ${rp(hargaDiff)}/bln, setara ${rp(hargaDiff * 12)}/tahun)`);
    else if (c.harga != null) reasons.push(`harga ${rp(c.harga)}/bln`);
    if (nearest?.id === c.id && c.distanceKm != null) reasons.push(`jarak ${fmtKm(c.distanceKm)} ke tujuan — terdekat`);
    else if (c.distanceKm != null) reasons.push(`jarak ${fmtKm(c.distanceKm)} ke tujuan`);
    reasons.push(c.dealBreakers.length === 0 ? "tidak ada deal breaker yang dilanggar" : `ada ${c.dealBreakers.length} deal breaker (${c.dealBreakers.join(", ")}) yang perlu dikonfirmasi`);
    lines.push("Alasan & data: " + reasons.join("; ") + ".");
    lines.push("");
    if (c.dealBreakers.length > 0) {
      lines.push(`⚠ Penting: konfirmasi deal breaker (${c.dealBreakers.join(", ")}) ke pemilik sebelum tanda tangan kontrak.`);
      lines.push("");
    }
    lines.push("Yang belum bisa diketahui dari data: kondisi saat hujan deras, kecocokan tetangga, dan kenyamanan jangka panjang — hanya bisa dirasakan setelah tinggal.");
    return lines.join("\n");
  }

  const doConfirm = () => {
    if (!confirm) return;
    const c = confirm;
    const text = buildMemo(c);
    start(async () => {
      setError(null);
      const res = await recordDecisionAction(c.id, selectedIds, text);
      if (res.ok) {
        setChosen(c);
        setMemo(text);
        setConfirm(null);
        window.scrollTo(0, 0);
      } else setError(res.error);
    });
  };

  const copyMemo = async () => {
    try {
      await navigator.clipboard.writeText(memo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  // ── Trade-off bullets per kandidat (dari data nyata).
  type Bullet = { t: "ok" | "mid" | "bad"; text: string };
  const bulletsFor = (c: CompareCandidate): Bullet[] => {
    const out: Bullet[] = [];
    if (cheapest?.id === c.id && hargaDiff) out.push({ t: "ok", text: `Hemat ${rp(hargaDiff)} per bulan dibanding pilihan termahal` });
    if (c.dealBreakers.length === 0) out.push({ t: "ok", text: "Tidak ada deal breaker — sesuai syarat wajibmu" });
    if (nearest?.id === c.id && c.distanceKm != null) out.push({ t: "ok", text: `Paling dekat ke tujuan — ${fmtKm(c.distanceKm)}${c.durationMin ? ` · ~${c.durationMin} mnt` : ""}` });
    if (c.furnished === "furnished") out.push({ t: "ok", text: "Full furnished — langsung bisa tinggal" });
    if (cheapest?.id !== c.id && hargaDiff && c.harga != null && cheapest?.harga != null) out.push({ t: "mid", text: `${rp(c.harga - cheapest.harga)} lebih mahal/bln dibanding termurah` });
    if (nearest?.id !== c.id && c.distanceKm != null && nearest?.distanceKm != null) out.push({ t: "mid", text: `${Math.round((c.distanceKm - nearest.distanceKm) * 10) / 10} km lebih jauh dari pilihan terdekat` });
    if (c.furnished && c.furnished !== "furnished") out.push({ t: "mid", text: `${c.furnished === "semi" ? "Semi furnished" : "Unfurnished"} — perlu beli sebagian perabot` });
    for (const db of c.dealBreakers) out.push({ t: "bad", text: `${db} — deal breaker yang kamu tetapkan, konfirmasi dulu ke pemilik` });
    return out.slice(0, 5);
  };

  const zoneOf = (c: CompareCandidate) => budgetZone(c.harga, budget.ideal, budget.max);
  const pctOf = (c: CompareCandidate) => (c.harga != null && budget.ideal ? Math.round((c.harga / budget.ideal) * 100) : null);

  // ════════════════════ SUKSES ════════════════════
  if (chosen) {
    return (
      <div className="min-h-screen bg-[#F4F3F0]">
        <TopNav sel={sel} />
        <div className="mx-auto max-w-[560px] px-6 py-14 text-center">
          <div className="mx-auto mb-5 grid h-[72px] w-[72px] place-items-center rounded-[22px] bg-emerald-50 shadow-[0_4px_20px_rgba(5,150,105,.2)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
          </div>
          <h1 className="mb-2 text-[28px] font-extrabold tracking-tight text-zinc-900">Keputusan tercatat 🎉</h1>
          <p className="mb-7 text-[15px] leading-relaxed text-zinc-500">
            Kamu memilih <strong className="text-zinc-700">{chosen.title}</strong>. Keputusan ini berdasarkan data yang tersedia — apa pun yang terjadi nanti, kamu sudah mengambil keputusan yang bisa dipertanggungjawabkan.
          </p>
          <div className="mb-6 rounded-[18px] border border-[#E4E3DF] bg-white p-6 text-left shadow-sm">
            <div className="mb-3.5 flex items-center gap-2 text-[15px] font-bold text-zinc-900">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
              Catatan Keputusan
            </div>
            <p className="whitespace-pre-line text-[13.5px] leading-relaxed text-zinc-700">{memo}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            <button type="button" onClick={copyMemo} className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800">{copied ? "✓ Memo disalin" : "📋 Salin Memo"}</button>
            <Link href="/dashboard" className="inline-flex items-center rounded-xl border-[1.5px] border-[#E4E3DF] px-5 py-3 text-sm text-zinc-500 transition-colors hover:bg-[#F4F3F0]">← Ke Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  if (sel.length < 2) {
    return (
      <div className="min-h-screen bg-[#F4F3F0]">
        <TopNav sel={sel} />
        <div className="mx-auto max-w-[1100px] px-6 py-16 text-center">
          <h2 className="text-lg font-bold tracking-tight text-zinc-900">Butuh minimal 2 hunian</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-zinc-600">Tambah hunian lain dulu untuk bisa membandingkan.</p>
          <Link href="/input" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white hover:bg-teal-800">+ Tambah ke Shortlist</Link>
        </div>
      </div>
    );
  }

  const anyKondisi = sel.some((c) => c.scoreKondisi != null);
  const anyOwner = sel.some((c) => c.scoreOwner != null);
  const radarSeries: RadarSeriesDef[] = sel.map((c, i) => ({
    color: tone(i).color,
    values: [c.scoreHarga, c.scoreLokasi, c.scoreKondisi, c.scoreFasilitas, c.scoreOwner],
  }));

  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      <TopNav sel={sel} />

      <div className="mx-auto max-w-[1100px] px-4 py-7 sm:px-6">
        {/* PICKER */}
        {candidates.length > 2 && (
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500">Bandingkan (2–4):</span>
            {candidates.map((c) => {
              const idx = selectedIds.indexOf(c.id);
              const on = idx >= 0;
              return (
                <button key={c.id} type="button" onClick={() => toggle(c.id)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-semibold transition-colors ${on ? "text-white" : "border-[#E4E3DF] bg-white text-zinc-500 hover:text-zinc-900"}`} style={on ? { background: tone(idx).color, borderColor: tone(idx).color } : undefined}>
                  {on && <span className="h-1.5 w-1.5 rounded-full bg-white/80" />}
                  {c.title}
                </button>
              );
            })}
          </div>
        )}

        {/* ═══ KESIMPULAN CEPAT ═══ */}
        <div className="mb-5 overflow-hidden rounded-[20px] border border-[#E4E3DF] bg-white shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E3DF] px-6 py-3.5">
            <div className="flex items-center gap-2.5 text-lg font-extrabold tracking-tight text-zinc-900">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 2a8 8 0 0 1 8 8c0 3.5-2 6.5-5 8l-1 2H10l-1-2c-3-1.5-5-4.5-5-8a8 8 0 0 1 8-8z" /></svg>
              Kesimpulan Cepat
            </div>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
              Berdasarkan prioritasmu:
              {prioOrder.map((k, i) => (
                <span key={k} className={`rounded-full px-2 py-0.5 text-[11.5px] font-semibold ${PRIO_TAG[k].cls}`}>{["①", "②", "③"][i]} {PRIO_TAG[k].label}</span>
              ))}
            </div>
          </div>

          <div className="grid border-b border-[#E4E3DF]" style={{ gridTemplateColumns: `repeat(${sel.length}, minmax(0,1fr))` }}>
            {sel.map((c, i) => (
              <div key={c.id} className={`px-6 py-5 ${i < sel.length - 1 ? "border-r border-[#E4E3DF]" : ""}`}>
                <div className="mb-3.5 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: tone(i).color }} />
                  <span className="text-[15px] font-bold text-zinc-900">{c.title}</span>
                </div>
                <QvRow label="💰 Harga/bulan" val={rp(c.harga)} tag={cheapest?.id === c.id ? { t: "win", cls: tone(i), text: "Lebih murah" } : hargaDiff && cheapest?.harga != null && c.harga != null ? { t: "lose", text: `${rpShort(c.harga - cheapest.harga)} lebih mahal` } : null} />
                <QvRow label="📍 Jarak ke tujuan" val={fmtKm(c.distanceKm)} tag={c.distanceKm == null ? null : nearest?.id === c.id ? { t: "win", cls: tone(i), text: "Lebih dekat" } : { t: "lose", text: "Lebih jauh" }} />
                <QvRowRaw label="🛡️ Deal Breaker">
                  {c.dealBreakers.length === 0 ? (
                    <span className="font-bold text-emerald-600">✓ Tidak ada masalah</span>
                  ) : (
                    <span className="font-bold text-amber-600">⚠ {c.dealBreakers[0]}{c.dealBreakers.length > 1 ? ` +${c.dealBreakers.length - 1}` : ""}</span>
                  )}
                </QvRowRaw>
                <QvRowRaw label="👤 Owner/Pemilik">{c.scoreOwner != null ? <ScoreStars score={c.scoreOwner} /> : <span className="text-zinc-400">— Segera</span>}</QvRowRaw>
                <QvRowRaw label="🏠 Kondisi rumah" last>{c.scoreKondisi != null ? <ScoreStars score={c.scoreKondisi} /> : <span className="text-zinc-400">— Segera</span>}</QvRowRaw>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2.5 bg-[#FAFAF9] px-6 py-3.5">
            <div className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[9px] bg-amber-50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
            </div>
            <p className="text-[13px] leading-relaxed text-zinc-700">
              {cheapest && <><strong className="text-zinc-900">{cheapest.title} paling hemat di prioritas {PRIO_TAG[prioOrder[0]].label.toLowerCase()}.</strong> </>}
              {nearest && nearest.id !== cheapest?.id && <>{nearest.title} unggul di lokasi. </>}
              {dbCand && <>Tapi {dbCand.title} punya deal breaker ({dbCand.dealBreakers[0]}) yang perlu dikonfirmasi dulu ke pemilik. </>}
              Keputusan akhir tetap di tanganmu.
            </p>
          </div>
        </div>

        {/* ═══ RADAR + KEY FACTS ═══ */}
        <div className="mb-4 grid gap-4 lg:grid-cols-[420px_1fr]">
          <div className="rounded-2xl border border-[#E4E3DF] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm font-bold text-zinc-900">Perbandingan 5 Aspek</div>
              <div className="flex flex-wrap gap-3">
                {sel.map((c, i) => (
                  <span key={c.id} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: tone(i).color }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: tone(i).color }} />{c.title.length > 14 ? c.title.slice(0, 14) + "…" : c.title}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <CompareRadar dims={[{ name: "Harga" }, { name: "Lokasi" }, { name: "Kondisi", placeholder: !anyKondisi }, { name: "Fasilitas" }, { name: "Owner", placeholder: !anyOwner }]} series={radarSeries} />
            </div>
            <div className="mt-3.5 flex flex-col gap-1.5">
              {[{ label: "Harga", key: "scoreHarga" as const, ph: false }, { label: "Lokasi", key: "scoreLokasi" as const, ph: false }, { label: "Fasilitas", key: "scoreFasilitas" as const, ph: false }, { label: "Kondisi", key: "scoreKondisi" as const, ph: !anyKondisi }, { label: "Owner", key: "scoreOwner" as const, ph: !anyOwner }].map((d) => (
                <div key={d.label} className="flex items-center gap-2">
                  <span className="w-[72px] shrink-0 text-xs text-zinc-500">{d.label}</span>
                  {d.ph ? (
                    <span className="flex-1 text-[11px] text-zinc-400">Segera (setelah survey)</span>
                  ) : (
                    <div className="flex flex-1 items-center gap-2">
                      <div className="flex flex-1 gap-1">
                        {sel.map((c, i) => (
                          <div key={c.id} className="h-1.5 rounded-full" style={{ width: `${d.key ? c[d.key] ?? 0 : 0}%`, background: tone(i).color, opacity: 0.85 }} />
                        ))}
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        {sel.map((c, i) => (
                          <span key={c.id} className="w-6 text-right font-mono text-[11px] font-semibold" style={{ color: tone(i).color }}>{d.key && c[d.key] != null ? Math.round(c[d.key] as number) : "—"}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* KEY FACTS */}
          <div className="flex flex-col gap-2.5">
            <KeyFact icon="💰" iconBg="#EDE9FE" label="Selisih Harga" main={hargaDiff ? `${rp(hargaDiff)}/bulan` : "—"} badge={cheapest ? { text: `✓ ${cheapest.title} termurah`, color: tone(sel.findIndex((x) => x.id === cheapest.id)).color, bg: tone(sel.findIndex((x) => x.id === cheapest.id)).bg } : null}>
              {cheapest && hargaDiff ? <>{cheapest.title} lebih murah. Setara <strong>{rp(hargaDiff * 12)} per tahun</strong>.</> : "Harga setara / data belum lengkap."}
            </KeyFact>
            <KeyFact icon="📍" iconBg="#DBEAFE" label="Selisih Jarak ke Tujuan" main={distDiff != null ? `${distDiff} km` : "—"} badge={nearest ? { text: `✓ ${nearest.title} terdekat`, color: tone(sel.findIndex((x) => x.id === nearest.id)).color, bg: tone(sel.findIndex((x) => x.id === nearest.id)).bg } : null}>
              {nearest && nearest.distanceKm != null ? <>{nearest.title} {fmtKm(nearest.distanceKm)}{nearest.durationMin ? ` (~${nearest.durationMin} mnt)` : ""}{farthest && farthest.id !== nearest.id ? <>, {farthest.title} {fmtKm(farthest.distanceKm)}.</> : "."}</> : "Jarak belum terhitung untuk semua hunian."}
            </KeyFact>
            <KeyFact icon="⚠️" iconBg="#FFFBEB" label="Deal Breaker" main={dbCand ? `${dbCand.title}` : "Semua clear"} badge={dbCand ? { text: "⚠ Perlu konfirmasi", color: "#b45309", bg: "#FFFBEB" } : { text: "✓ Tidak ada", color: "#059669", bg: "#ECFDF5" }}>
              {dbCand ? <><strong>{dbCand.dealBreakers.join(", ")}</strong> — syarat wajib yang kamu tetapkan. Konfirmasi ke owner sebelum dipertimbangkan lebih lanjut.</> : "Tidak ada kondisi yang kamu hindari pada hunian manapun."}
            </KeyFact>
            <KeyFact icon="👤" iconBg="#ECFDF5" label="Owner / Pemilik" main="Segera" badge={{ text: "Setelah survey", color: "#71717a", bg: "#F4F3F0" }}>
              Penilaian owner (responsivitas, fleksibilitas) tersedia setelah fitur survey — <strong>Slice 2</strong>.
            </KeyFact>
          </div>
        </div>

        {/* ═══ INSIGHT CARDS ═══ */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Insight emoji="🤔" title="Waktu vs Uang" verdict={{ text: "Tergantung gaya hidupmu", cls: "bg-[#F4F3F0] text-zinc-500" }}>
            {nearest && cheapest ? <>{nearest.title} unggul jarak{cheapest.id !== nearest.id ? <>, {cheapest.title} hemat <strong>{hargaDiff ? rp(hargaDiff) : "biaya"}/bln</strong></> : ""}. Mana lebih berharga untukmu?</> : "Bandingkan hemat waktu vs hemat biaya."}
          </Insight>
          <Insight emoji="📦" title="Biaya Awal (Upfront)" verdict={minUpfront ? { text: `${minUpfront.title} lebih ringan`, cls: "bg-[#F0FDFA] text-teal-700" } : null}>
            {minUpfront && maxUpfront ? <>{minUpfront.title} butuh <strong>{rp(minUpfront.upfront)}</strong> di awal{minUpfront.id !== maxUpfront.id ? <>, {maxUpfront.title} <strong>{rp(maxUpfront.upfront)}</strong></> : ""} (deposit + sewa 1 bln).</> : "Deposit + sewa bulan pertama."}
          </Insight>
          <Insight emoji="🛋️" title="Siap Huni?" verdict={{ text: sel.some((c) => c.furnished === "furnished") ? "Ada yang full furnished" : "Perlu lengkapi perabot", cls: "bg-[#FFF7F0] text-[#E8621A]" }}>
            {sel.map((c) => `${c.title}: ${c.furnished ?? "—"}`).join(" · ")}. WiFi/internet → Segera.
          </Insight>
          <Insight emoji="🌧️" title="Yang Belum Bisa Diketahui" verdict={{ text: "Normal, ini wajar", cls: "bg-amber-50 text-amber-700" }}>
            Kondisi saat hujan deras, hubungan dengan tetangga, dan apakah kamu akan betah — <strong>hanya bisa dirasakan setelah tinggal</strong>, bukan dari data.
          </Insight>
        </div>

        {/* ═══ TRADE-OFF ═══ */}
        <div className="mb-3.5 flex items-center gap-2.5 text-[17px] font-extrabold tracking-tight text-zinc-900">
          Kalau kamu pilih…
          <span className="h-px flex-1 bg-[#E4E3DF]" />
        </div>
        <div className="mb-5 grid gap-3.5" style={{ gridTemplateColumns: `repeat(${Math.min(sel.length, 2)}, minmax(0,1fr))` }}>
          {sel.map((c, i) => {
            const t = tone(i);
            const z = zoneOf(c);
            return (
              <div key={c.id} className="overflow-hidden rounded-[18px] shadow-md">
                <div className="px-5 py-4" style={{ background: t.bg, borderBottom: `2px solid ${t.border}` }}>
                  <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: t.color, opacity: 0.75 }}>Pilihan {String.fromCharCode(65 + i)}</div>
                  <div className="text-[17px] font-extrabold tracking-tight" style={{ color: t.color }}>{c.title}</div>
                  <div className="font-mono text-[13px]" style={{ color: t.color, opacity: 0.8 }}>{formatHargaListing(c.harga, c.periode)}{z ? ` · ${BUDGET_ZONE_META[z].label}` : ""}</div>
                </div>
                <div className="bg-white px-5 py-4">
                  <div className="mb-4 flex flex-col gap-1.5">
                    {bulletsFor(c).map((b, bi) => (
                      <div key={bi} className="flex items-start gap-2 text-[13px] leading-relaxed text-zinc-700">
                        <span className={`mt-px grid h-5 w-5 shrink-0 place-items-center rounded text-[11px] font-bold ${b.t === "ok" ? "bg-emerald-50 text-emerald-600" : b.t === "mid" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-600"}`}>{b.t === "ok" ? "✓" : b.t === "mid" ? "~" : "!"}</span>
                        <span>{b.text}</span>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setConfirm(c)} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-bold transition-colors" style={{ borderColor: t.border, color: t.color }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
                    Pilih {c.title.length > 22 ? c.title.slice(0, 22) + "…" : c.title}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* DETAIL TABLE */}
        <button type="button" onClick={() => setDetailOpen((o) => !o)} className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E4E3DF] bg-white py-3 text-[13px] font-semibold text-zinc-500 transition-colors hover:bg-[#FAFAF9] hover:text-zinc-900">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect width="18" height="18" x="3" y="3" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
          {detailOpen ? "Sembunyikan perbandingan data" : "Lihat perbandingan data lengkap"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={detailOpen ? "rotate-180" : ""} aria-hidden><path d="m6 9 6 6 6-6" /></svg>
        </button>

        {detailOpen && <DetailTable sel={sel} zoneOf={zoneOf} pctOf={pctOf} nearest={nearest} />}

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      </div>

      {/* DIALOG */}
      {confirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 p-6" onClick={() => setConfirm(null)}>
          <div className="w-full max-w-[440px] rounded-[22px] bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-4xl">🏠</div>
            <h2 className="mb-2 text-[22px] font-extrabold tracking-tight text-zinc-900">Yakin pilih {confirm.title}?</h2>
            <p className="mb-4 text-sm leading-relaxed text-zinc-500">Dengan memilih ini, kamu menyatakan sudah memahami dan menerima kondisi di bawah ini.</p>
            <div className="mb-5 rounded-xl border border-[#E4E3DF] bg-[#FAFAF9] p-3.5">
              <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Kekurangan yang kamu terima</div>
              {bulletsFor(confirm).map((b, bi) => (
                <div key={bi} className="mb-2 flex items-start gap-2 text-[13px] leading-snug text-zinc-700 last:mb-0">
                  <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded text-[11px] font-bold ${b.t === "ok" ? "bg-emerald-50 text-emerald-600" : b.t === "mid" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-600"}`}>{b.t === "ok" ? "✓" : b.t === "mid" ? "~" : "!"}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2.5">
              <button type="button" onClick={() => setConfirm(null)} className="rounded-xl border-[1.5px] border-[#E4E3DF] px-4 py-3 text-sm text-zinc-500 transition-colors hover:bg-[#F4F3F0]">Belum yakin</button>
              <button type="button" onClick={doConfirm} disabled={pending} className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50" style={{ background: tone(sel.findIndex((x) => x.id === confirm.id)).color }}>
                {pending ? "Menyimpan…" : "Ya, ini pilihanku →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════ sub-komponen ════════════
function TopNav({ sel }: { sel: CompareCandidate[] }) {
  return (
    <nav className="sticky top-9 z-50 flex h-[54px] items-center gap-3.5 border-b border-[#E4E3DF] bg-white/95 px-4 backdrop-blur sm:px-7">
      <Link href="/dashboard" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E4E3DF] px-3 py-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-[#F4F3F0] hover:text-zinc-900">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
        Kembali
      </Link>
      <div className="hidden items-center gap-2 text-xs font-medium text-zinc-400 md:flex">
        <span className="text-teal-700">Cari</span><span className="text-zinc-300">›</span>
        <span className="text-teal-700">Survey</span><span className="text-zinc-300">›</span>
        <span className="font-bold text-[#E8621A]">Bandingkan</span><span className="text-zinc-300">›</span>
        <span>Pilih</span>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        {sel.slice(0, 4).map((c, i) => (
          <span key={c.id} className="hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold sm:inline-flex" style={{ background: tone(i).bg, color: tone(i).color, borderColor: tone(i).border }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone(i).color }} />
            {c.title.length > 14 ? c.title.slice(0, 14) + "…" : c.title}
          </span>
        ))}
      </div>
    </nav>
  );
}

function QvRow({ label, val, tag }: { label: string; val: string; tag: { t: "win"; cls: { color: string; bg: string; border: string }; text: string } | { t: "lose"; text: string } | null }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-[#E4E3DF] py-1.5 last:border-0">
      <span className="text-[13px] text-zinc-500">{label}</span>
      <span className="flex items-center gap-1.5 text-right text-[13px] font-semibold text-zinc-900">
        {val}
        {tag && (tag.t === "win" ? (
          <span className="rounded-full px-1.5 py-0.5 text-[11px] font-bold" style={{ background: tag.cls.bg, color: tag.cls.color }}>{tag.text}</span>
        ) : (
          <span className="rounded-full bg-[#F4F3F0] px-1.5 py-0.5 text-[11px] text-zinc-400">{tag.text}</span>
        ))}
      </span>
    </div>
  );
}

function QvRowRaw({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-2 py-1.5 ${last ? "" : "border-b border-[#E4E3DF]"}`}>
      <span className="text-[13px] text-zinc-500">{label}</span>
      <span className="text-right text-[13px]">{children}</span>
    </div>
  );
}

function KeyFact({ icon, iconBg, label, main, badge, children }: { icon: string; iconBg: string; label: string; main: string; badge: { text: string; color: string; bg: string } | null; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-[14px] border border-[#E4E3DF] bg-white p-4 shadow-sm">
      <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[11px] text-lg" style={{ background: iconBg }}>{icon}</div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">{label}</div>
        <div className="text-lg font-extrabold leading-tight tracking-tight text-zinc-900">{main}</div>
        <div className="mt-1 text-[12.5px] leading-snug text-zinc-500">{children}</div>
        {badge && <span className="mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11.5px] font-bold" style={{ background: badge.bg, color: badge.color }}>{badge.text}</span>}
      </div>
    </div>
  );
}

function Insight({ emoji, title, verdict, children }: { emoji: string; title: string; verdict: { text: string; cls: string } | null; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 rounded-[14px] border border-[#E4E3DF] bg-white p-4 shadow-sm">
      <div className="text-[22px] leading-none">{emoji}</div>
      <div className="text-[13.5px] font-bold leading-tight text-zinc-900">{title}</div>
      <div className="flex-1 text-[12.5px] leading-relaxed text-zinc-500">{children}</div>
      {verdict && <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${verdict.cls}`}>{verdict.text}</span>}
    </div>
  );
}

function DetailTable({ sel, zoneOf, pctOf, nearest }: { sel: CompareCandidate[]; zoneOf: (c: CompareCandidate) => ReturnType<typeof budgetZone>; pctOf: (c: CompareCandidate) => number | null; nearest: CompareCandidate | null }) {
  const Grp = ({ title }: { title: string }) => (
    <tr><td colSpan={sel.length + 1} className="bg-[#F4F3F0] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400">{title}</td></tr>
  );
  const sym = (kind: "ok" | "mid" | "bad" | "none", text: string) => {
    const cls = kind === "ok" ? "bg-emerald-50 text-emerald-600" : kind === "mid" ? "bg-amber-50 text-amber-700" : kind === "bad" ? "bg-rose-50 text-rose-600" : "bg-[#F4F3F0] text-zinc-400";
    const ic = kind === "ok" ? "✓" : kind === "mid" ? "~" : kind === "bad" ? "✗" : "—";
    return <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[12px] font-semibold ${cls}`}>{ic} {text}</span>;
  };
  const Row = ({ label, cells }: { label: string; cells: React.ReactNode[] }) => (
    <tr className="hover:bg-[#FAFAF9]">
      <td className="sticky left-0 z-[5] whitespace-nowrap border-b border-[#E4E3DF] bg-[#FAFAF9] px-4 py-2.5 text-[12.5px] font-semibold text-zinc-500">{label}</td>
      {cells.map((c, i) => <td key={i} className="border-b border-[#E4E3DF] px-4 py-2.5 text-[13px] text-zinc-700">{c}</td>)}
    </tr>
  );

  return (
    <div className="mb-5 overflow-hidden rounded-[14px] border border-[#E4E3DF] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 z-[5] bg-[#FAFAF9] px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-zinc-400">Detail</th>
              {sel.map((c, i) => (
                <th key={c.id} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider" style={{ background: tone(i).bg, color: tone(i).color }}>{c.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Grp title="Biaya" />
            <Row label="Harga sewa" cells={sel.map((c) => <span key={c.id}><span className="font-mono">{rp(c.harga)}</span>/bln</span>)} />
            <Row label="Budget zone" cells={sel.map((c) => { const z = zoneOf(c); const p = pctOf(c); return z ? sym(z === "comfort" || z === "ideal" ? "ok" : z === "stretch" ? "mid" : "bad", `${BUDGET_ZONE_META[z].label}${p ? ` (${p}%)` : ""}`) : sym("none", "—"); })} />
            <Row label="Upfront (deposit + 1 bln)" cells={sel.map((c) => <span key={c.id} className="font-mono">{rp(c.upfront)}</span>)} />
            <Row label="Listrik" cells={sel.map((c) => c.biayaListrik ?? <span key={c.id} className="text-zinc-400">— Belum diketahui</span>)} />
            <Grp title="Lokasi" />
            <Row label="Jarak ke tujuan" cells={sel.map((c) => c.distanceKm == null ? sym("none", "Belum dihitung") : <span key={c.id} style={nearest?.id === c.id ? { color: "#059669", fontWeight: 600 } : undefined}>{fmtKm(c.distanceKm)}{c.durationMin ? ` · ~${c.durationMin} mnt` : ""}{nearest?.id === c.id ? " ✓" : ""}</span>)} />
            <Grp title="Hasil Survey" />
            {([
              { label: "Kebersihan", key: "kebersihan" },
              { label: "Kebisingan", key: "kebisingan" },
              { label: "Kondisi bangunan", key: "kondisi_bangunan" },
              { label: "Owner/Pemilik", key: "owner" },
            ] as const).map((s) => (
              <Row key={s.key} label={s.label} cells={sel.map((c) => {
                const r = c.survey?.[s.key] ?? null;
                return r != null ? <Stars5 key={c.id} n={r} /> : <span key={c.id} className="text-zinc-400">— Segera</span>;
              })} />
            ))}
            <Grp title="Fasilitas" />
            <Row label="Parkir motor" cells={sel.map((c) => c.carport == null ? sym("none", "—") : c.carport ? sym("ok", "Carport") : sym("bad", "Tidak ada"))} />
            <Row label="Dapur" cells={sel.map((c) => c.dapur == null ? sym("none", "—") : c.dapur ? sym("ok", "Ada") : sym("bad", "Tidak ada"))} />
            <Row label="Furnished" cells={sel.map((c) => c.furnished ? sym(c.furnished === "furnished" ? "ok" : "mid", c.furnished === "furnished" ? "Full furnished" : c.furnished === "semi" ? "Semi" : "Unfurnished") : sym("none", "—"))} />
            <Row label="Internet" cells={sel.map(() => sym("none", "Segera"))} />
            <Grp title="Deal Breaker" />
            <Row label="Status" cells={sel.map((c) => c.dealBreakers.length === 0 ? sym("ok", "Semua clear") : sym("bad", c.dealBreakers.join(", ")))} />
            <Grp title="Skor (referensi)" />
            <Row label="Skor total" cells={sel.map((c) => <span key={c.id} className="font-mono text-zinc-400">{c.scoreTotal == null ? "—" : `${Math.round(c.scoreTotal)}/100`}</span>)} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
