"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CandidateCard, type CardData } from "./candidate-card";

export type InsightData = {
  tone: "amber" | "teal" | "blue";
  title: string;
  body: string;
  href: string;
  cta: string;
};

export type Counts = {
  aktif: number;
  disurvey: number;
  pertahankan: number;
  dealBreaker: number;
  tersewa: number;
};

type StatusFilter = "semua" | "tersedia" | "sudah_disurvey" | "pertahankan" | "sisihkan";
type Sort = "skor" | "harga" | "jarak" | "terbaru";

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "semua", label: "Semua" },
  { id: "tersedia", label: "Tersedia" },
  { id: "sudah_disurvey", label: "Disurvey" },
  { id: "pertahankan", label: "Pertahankan" },
  { id: "sisihkan", label: "Sisihkan" },
];

const TONE = {
  amber: { border: "border-l-amber-500", iconBg: "bg-amber-50", iconColor: "#b45309" },
  teal: { border: "border-l-teal-600", iconBg: "bg-teal-50", iconColor: "#0f766e" },
  blue: { border: "border-l-blue-500", iconBg: "bg-blue-50", iconColor: "#2563eb" },
};

function InsightIcon({ tone, color }: { tone: "amber" | "teal" | "blue"; color: string }) {
  if (tone === "amber")
    return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>);
  if (tone === "blue")
    return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /></svg>);
  return (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect width="5" height="18" x="3" y="3" rx="1" /><rect width="5" height="18" x="16" y="3" rx="1" /></svg>);
}

export function DashboardClient({
  cards,
  archived,
  title,
  sub,
  counts,
  insights,
  budgetMap,
}: {
  cards: CardData[];
  archived: CardData[];
  title: string;
  sub: string;
  counts: Counts;
  insights: InsightData[];
  budgetMap: React.ReactNode;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("semua");
  const [sort, setSort] = useState<Sort>("skor");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string[]>([]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = cards.filter((c) => {
      if (q && !c.title.toLowerCase().includes(q)) return false;
      if (status === "pertahankan") return c.verdict.kind === "pertahankan" || c.verdict.kind === "cek_db";
      if (status === "sisihkan") return c.verdict.kind === "sisihkan";
      if (status === "tersedia" || status === "sudah_disurvey") return c.status === status;
      return true;
    });
    out = [...out];
    if (sort === "skor")
      out.sort(
        (a, b) =>
          (b.score_total ?? -1) - (a.score_total ?? -1) ||
          // Tiebreak: skor sama → data lebih lengkap di atas (jangan menang gara-gara dimensi bolong).
          b.coverageKnown / b.coverageTotal - a.coverageKnown / a.coverageTotal,
      );
    else if (sort === "harga") out.sort((a, b) => (a.perBulan ?? Infinity) - (b.perBulan ?? Infinity));
    else if (sort === "jarak") out.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    return out;
  }, [cards, query, status, sort]);

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 4 ? cur : [...cur, id]));

  const STATS = [
    { v: counts.aktif, label: "Di shortlist", cls: "text-teal-700", hint: "" },
    { v: counts.disurvey, label: "Sudah disurvey", cls: "text-emerald-600", hint: `${counts.aktif - counts.disurvey} belum` },
    { v: counts.pertahankan, label: "Pertahankan", cls: "text-zinc-900", hint: "" },
    { v: counts.dealBreaker, label: "Deal breaker aktif", cls: "text-amber-600", hint: counts.dealBreaker ? "Perlu konfirmasi" : "" },
    { v: counts.tersewa, label: "Tersewa / arsip", cls: "text-rose-600", hint: counts.tersewa ? "Di arsip" : "" },
  ];

  const colors = ["#0f766e", "#e8621a", "#2563eb", "#7c3aed"];
  const grid = view === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-2.5";

  return (
    <>
      {/* Topbar — sticky, mepet ujung ke ujung (flush ke sidebar & tepi kanan) */}
      <div className="sticky top-9 z-20 flex h-14 items-center justify-between gap-3 border-b border-[#E4E3DF] bg-white/95 px-4 backdrop-blur sm:h-[54px] sm:px-6">
        <div className="min-w-0">
          <div className="truncate text-[15px] font-extrabold tracking-tight text-zinc-900 sm:text-[17px]">{title}</div>
          <div className="truncate text-[11.5px] text-zinc-500 sm:text-[12.5px]">{sub}</div>
        </div>
        <Link href="/input" className="inline-flex h-[34px] shrink-0 items-center gap-1.5 rounded-[9px] bg-teal-700 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-teal-800 sm:px-4">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14" /><path d="M12 5v14" /></svg>
          <span className="hidden sm:inline">Tambah ke Shortlist</span>
          <span className="sm:hidden">Tambah</span>
        </Link>
      </div>

      <div className="px-4 pb-24 pt-4 sm:px-6 sm:pt-5">
        {/* Insights — carousel geser di HP, grid di desktop */}
        {insights.length > 0 && (
          <div className="-mx-4 mb-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:mb-[18px] sm:grid sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3 [&::-webkit-scrollbar]:hidden">
            {insights.map((it, i) => {
              const t = TONE[it.tone];
              return (
                <div key={i} className={`flex w-[82%] shrink-0 snap-start gap-[11px] rounded-xl border border-l-[3px] border-[#E4E3DF] bg-white p-3.5 shadow-sm sm:w-auto ${t.border}`}>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-[9px] ${t.iconBg}`}><InsightIcon tone={it.tone} color={t.iconColor} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-bold leading-[1.3] text-zinc-900">{it.title}</div>
                    <p className="mt-[3px] text-[12px] leading-[1.45] text-zinc-500">{it.body}</p>
                    <Link href={it.href} className="mt-[7px] inline-block text-[12px] font-semibold text-teal-700 hover:underline">{it.cta} →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Peta budget — sembunyi di HP */}
        <div className="mb-[18px] hidden sm:block">{budgetMap}</div>

        {/* Stats: 5 (desktop) / 3 (HP) */}
        <div className="mb-[18px] hidden grid-cols-5 gap-2.5 sm:grid">
          {STATS.map((st) => (
            <div key={st.label} className="rounded-[10px] border border-[#E4E3DF] bg-white px-[13px] py-[11px] shadow-sm">
              <div className={`text-[20px] font-extrabold leading-none tabular-nums ${st.cls}`}>{st.v}</div>
              <div className="mt-[3px] text-[11px] text-zinc-500">{st.label}</div>
              {st.hint && <div className="mt-[3px] text-[10.5px] text-zinc-400">{st.hint}</div>}
            </div>
          ))}
        </div>
        <div className="mb-4 grid grid-cols-3 gap-2 sm:hidden">
          {[STATS[0], STATS[1], STATS[3]].map((st) => (
            <div key={st.label} className="rounded-xl border border-[#E4E3DF] bg-white px-3 py-2.5 text-center shadow-sm">
              <div className={`text-[22px] font-extrabold leading-none tabular-nums ${st.cls}`}>{st.v}</div>
              <div className="mt-1 text-[10.5px] leading-tight text-zinc-500">{st.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
          <div className="relative w-full sm:w-auto sm:min-w-[160px] sm:max-w-[280px] sm:flex-1">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            </span>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari di shortlist..." className="h-[34px] w-full rounded-[9px] border border-[#E4E3DF] bg-white pl-8 pr-3 text-[13px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-teal-600" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-[34px] rounded-lg border border-[#E4E3DF] bg-white px-2.5 text-[12.5px] text-zinc-700 outline-none">
              <option value="skor">Skor tertinggi</option>
              <option value="harga">Harga terendah</option>
              <option value="jarak">Jarak terdekat</option>
              <option value="terbaru">Terbaru</option>
            </select>
            <div className="flex items-center gap-0.5 rounded-lg border border-[#E4E3DF] bg-[#F4F3F0] p-0.5">
              <button type="button" onClick={() => setView("grid")} className={`grid h-[30px] w-[30px] place-items-center rounded-md ${view === "grid" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400"}`} title="Grid" aria-label="Grid">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
              </button>
              <button type="button" onClick={() => setView("list")} className={`grid h-[30px] w-[30px] place-items-center rounded-md ${view === "list" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400"}`} title="List" aria-label="List">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Filter chips — 1 baris scroll di HP, wrap di desktop */}
        <div className="mb-3.5 -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" onClick={() => setStatus(f.id)} className={`shrink-0 whitespace-nowrap rounded-full border px-[13px] py-1.5 text-[12.5px] font-medium transition-colors ${status === f.id ? "border-teal-700 bg-teal-700 text-white" : "border-[#E4E3DF] bg-white text-zinc-500 hover:text-zinc-900"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Hint pilih */}
        {selected.length === 0 && cards.length >= 2 && (
          <p className="mb-3 text-[11.5px] text-zinc-400">Pilih 2–4 hunian yang ingin kamu bandingkan trade-off-nya — centang ☑ di pojok kartu.</p>
        )}

        {/* Grid */}
        {shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-10 text-center text-sm text-zinc-500">Tidak ada yang cocok dengan filter ini. Coba hapus filter atau ganti kriterianya.</p>
        ) : (
          <div className={grid}>
            {shown.map((c) => (
              <CandidateCard key={c.id} c={c} listView={view === "list"} selected={selected.includes(c.id)} onToggle={toggle} />
            ))}
          </div>
        )}

        {/* Arsip */}
        {archived.length > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-2.5 py-3.5 text-[11px] font-bold uppercase tracking-[0.07em] text-zinc-400">
              Tidak aktif ({archived.length})
              <span className="h-px flex-1 bg-[#E4E3DF]" />
            </div>
            <div className={grid}>
              {archived.map((c) => (
                <CandidateCard key={c.id} c={c} listView={view === "list"} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Compare bar — muncul saat ada pilihan */}
      {selected.length > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 flex items-center gap-2.5 bg-zinc-900 px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] sm:bottom-0 sm:left-64 sm:gap-3 sm:px-6 sm:py-3 sm:pb-3">
          <div className="hidden gap-1 sm:flex">
            {selected.slice(0, 4).map((id, i) => {
              const c = cards.find((x) => x.id === id);
              return (
                <span key={id} className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-white/20 text-[9px] font-bold text-white" style={{ background: colors[i] }}>
                  {(c?.title ?? "?").slice(0, 2).toUpperCase()}
                </span>
              );
            })}
          </div>
          <span className="flex-1 text-[13px] font-semibold text-white sm:text-[13.5px]">
            {selected.length} dipilih<span className="ml-1 hidden text-[12px] font-normal text-white/50 sm:inline">· pilih 2–4 untuk bandingkan</span>
          </span>
          <button type="button" onClick={() => setSelected([])} className="rounded-lg border border-white/20 px-3 py-1.5 text-[13px] text-white/60 transition-colors hover:text-white sm:px-3.5 sm:py-2">Batal</button>
          <button type="button" disabled={selected.length < 2} onClick={() => router.push(`/bandingkan?ids=${selected.join(",")}`)} className="rounded-lg bg-[#e8621a] px-4 py-1.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40 sm:px-5 sm:py-2 sm:text-[13.5px]">Bandingkan →</button>
        </div>
      )}
    </>
  );
}
