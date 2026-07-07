"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { worthMeta } from "@/lib/scoring/worth-it";
import type { Basemap } from "./peta-leaflet";
import type { MapItem, Office } from "./types";

const PetaLeaflet = dynamic(() => import("./peta-leaflet"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-[#eceae5]" />,
});

const rp = (n: number | null) => (n == null ? "—" : "Rp " + new Intl.NumberFormat("id-ID").format(n));
const outOf10 = (s: number | null) => (s == null ? "—" : (Math.round(s) / 10).toFixed(1));
const barLabel = (s: number | null) => (s == null ? "Belum ada data" : s >= 90 ? "Unggul" : s >= 80 ? "Baik" : s >= 70 ? "Cukup" : "Kurang");

const MAX_COMPARE = 4;
const TYPE_LABEL: Record<string, string> = { kontrakan: "Kontrakan", apartemen: "Apartemen", kost: "Kost" };
const rpShort = (n: number) => (n >= 1_000_000 ? `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} jt` : `${Math.round(n / 1000)} rb`);
const BASEMAP_OPTS: { v: Basemap; label: string }[] = [
  { v: "voyager", label: "Warna" },
  { v: "positron", label: "Terang" },
  { v: "dark", label: "Gelap" },
];

// Baris trade-off (Harga / Perjalanan / Fasilitas) dengan bar 0-100.
function TradeRow({ label, score, note }: { label: string; score: number | null; note?: string | null }) {
  const pct = score == null ? 0 : Math.max(0, Math.min(100, score));
  const color = score == null ? "#d4d4d8" : score >= 80 ? "#059669" : score >= 70 ? "#0f766e" : "#d97706";
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="mb-1 flex items-baseline justify-between gap-2 text-[12px]">
        <span className="text-zinc-600">
          {label}: <span className="font-semibold text-zinc-800">{barLabel(score)}</span>
          {note && <span className="ml-1 text-[11px] text-zinc-400">· {note}</span>}
        </span>
        <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-zinc-500">{outOf10(score)}/10</span>
      </div>
      <div className="h-[6px] overflow-hidden rounded-full bg-[#F0EFEB]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function PetaMap({ items, office, user }: { items: MapItem[]; office: Office | null; user: { name: string; initial: string } }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);

  // Filter navbar (semua fungsional).
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [maxCommute, setMaxCommute] = useState<number | null>(null);
  const [types, setTypes] = useState<Set<string>>(new Set());
  const [dbSafe, setDbSafe] = useState(false);
  const [sharedOnly, setSharedOnly] = useState(false);
  const [basemap, setBasemap] = useState<Basemap>("voyager");

  const hasShared = items.some((i) => !!i.sharedBy);

  // Batas nilai dari data (untuk slider) + tipe yang tersedia.
  const bounds = useMemo(() => {
    const prices = items.map((i) => i.perBulan).filter((n): n is number => n != null);
    const durs = items.map((i) => i.durationMin).filter((n): n is number => n != null);
    const priceMin = prices.length ? Math.min(...prices) : 0;
    const priceMax = prices.length ? Math.max(...prices) : 10_000_000;
    const durMax = durs.length ? Math.max(...durs) : 60;
    const typesPresent = [...new Set(items.map((i) => i.propertyType))];
    return { priceMin, priceMax, durMax, typesPresent };
  }, [items]);

  const shown = useMemo(
    () =>
      items.filter((i) => {
        if (minScore > 0 && (i.score == null || i.score < minScore)) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          if (!`${i.title} ${i.alamat ?? ""}`.toLowerCase().includes(q)) return false;
        }
        if (maxPrice != null && i.perBulan != null && i.perBulan > maxPrice) return false;
        if (maxCommute != null && i.durationMin != null && i.durationMin > maxCommute) return false;
        if (types.size > 0 && !types.has(i.propertyType)) return false;
        if (dbSafe && i.flagCount > 0) return false;
        if (sharedOnly && !i.sharedBy) return false;
        return true;
      }),
    [items, minScore, search, maxPrice, maxCommute, types, dbSafe, sharedOnly],
  );

  const anyActive = minScore > 0 || !!search.trim() || maxPrice != null || maxCommute != null || types.size > 0 || dbSafe || sharedOnly;
  const resetAll = () => { setSearch(""); setMinScore(0); setMaxPrice(null); setMaxCommute(null); setTypes(new Set()); setDbSafe(false); setSharedOnly(false); };
  const toggleType = (t: string) =>
    setTypes((prev) => { const n = new Set(prev); if (n.has(t)) n.delete(t); else n.add(t); return n; });

  const selected = items.find((i) => i.id === selectedId) ?? null;

  const toggleCompare = (id: string) =>
    setCompare((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= MAX_COMPARE ? prev : [...prev, id]));

  const goCompare = () => {
    if (compare.length === 0) return;
    router.push(`/bandingkan?ids=${compare.join(",")}`);
  };

  const sm = selected ? worthMeta(selected.score) : null;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#eceae5]">
      {/* MAP */}
      <div className="absolute inset-0">
        <PetaLeaflet items={shown} office={office} selectedId={selectedId} onSelect={setSelectedId} basemap={basemap} />
      </div>

      {/* TOP BAR — filter fungsional selaras data kita */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] p-3 sm:p-4">
        <div className="pointer-events-auto mx-auto flex max-w-[1200px] flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex h-10 items-center gap-2 rounded-xl border border-[#E4E3DF] bg-white/95 px-3 shadow-sm backdrop-blur">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama / area" className="w-28 bg-transparent text-[13px] text-zinc-800 outline-none placeholder:text-zinc-400 sm:w-40" />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Hapus pencarian" className="text-zinc-400 transition-colors hover:text-zinc-700">✕</button>}
          </div>

          {/* Harga */}
          <FilterPopover label="Harga" active={maxPrice != null}>
            <PopTitle>Harga maksimum / bln</PopTitle>
            <input type="range" min={bounds.priceMin} max={bounds.priceMax} step={250_000} value={maxPrice ?? bounds.priceMax} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-teal-700" />
            <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
              <span className="font-semibold text-zinc-700">≤ Rp {rpShort(maxPrice ?? bounds.priceMax)}</span>
              {maxPrice != null && <button type="button" onClick={() => setMaxPrice(null)} className="font-semibold text-teal-700 hover:underline">Reset</button>}
            </div>
          </FilterPopover>

          {/* Perjalanan */}
          <FilterPopover label="Perjalanan" active={maxCommute != null}>
            <PopTitle>Waktu tempuh maksimum</PopTitle>
            <input type="range" min={5} max={Math.max(15, bounds.durMax)} step={5} value={maxCommute ?? Math.max(15, bounds.durMax)} onChange={(e) => setMaxCommute(Number(e.target.value))} className="w-full accent-teal-700" />
            <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
              <span className="font-semibold text-zinc-700">≤ {maxCommute ?? Math.max(15, bounds.durMax)} mnt ke kantor</span>
              {maxCommute != null && <button type="button" onClick={() => setMaxCommute(null)} className="font-semibold text-teal-700 hover:underline">Reset</button>}
            </div>
            <p className="mt-1.5 text-[10.5px] text-zinc-400">Hunian yang rutenya belum dihitung tetap tampil.</p>
          </FilterPopover>

          {/* Tipe */}
          <FilterPopover label="Tipe" active={types.size > 0}>
            <PopTitle>Tipe hunian</PopTitle>
            <div className="flex flex-col gap-1.5">
              {bounds.typesPresent.length === 0 && <span className="text-[12px] text-zinc-400">Belum ada data.</span>}
              {bounds.typesPresent.map((t) => (
                <label key={t} className="flex cursor-pointer items-center gap-2 text-[13px] text-zinc-700">
                  <input type="checkbox" checked={types.has(t)} onChange={() => toggleType(t)} className="h-3.5 w-3.5 accent-teal-700" />
                  {TYPE_LABEL[t] ?? t}
                </label>
              ))}
            </div>
          </FilterPopover>

          {/* Worth It Score */}
          <FilterPopover label="Worth It" active={minScore > 0}>
            <PopTitle>Skor minimum</PopTitle>
            <input type="range" min={0} max={90} step={5} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-full accent-teal-700" />
            <div className="mt-1.5 flex items-center justify-between text-[11.5px]">
              <span className="font-semibold text-zinc-700">{minScore > 0 ? `Skor ≥ ${minScore}` : "Semua skor"}</span>
              {minScore > 0 && <button type="button" onClick={() => setMinScore(0)} className="font-semibold text-teal-700 hover:underline">Reset</button>}
            </div>
          </FilterPopover>

          {/* Toggle: sembunyikan yang kena deal breaker */}
          <ToggleChip active={dbSafe} onClick={() => setDbSafe((v) => !v)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>
            Deal breaker aman
          </ToggleChip>

          {/* Toggle: hanya hunian yang dibagikan partner */}
          {hasShared && (
            <ToggleChip active={sharedOnly} onClick={() => setSharedOnly((v) => !v)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              Dibagikan partner
            </ToggleChip>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden h-10 items-center rounded-xl border border-[#E4E3DF] bg-white/95 px-3 text-[12px] font-semibold text-zinc-600 shadow-sm backdrop-blur sm:inline-flex">{shown.length} hunian</span>
            {anyActive && (
              <button type="button" onClick={resetAll} className="h-10 rounded-xl border border-[#E4E3DF] bg-white/95 px-3 text-[12.5px] font-medium text-rose-600 shadow-sm backdrop-blur transition-colors hover:bg-rose-50">Reset filter</button>
            )}
            <Link href="/pengaturan" aria-label="Pengaturan" title={user.name} className="grid h-10 w-10 place-items-center rounded-full bg-teal-700 text-[13px] font-bold text-white shadow-sm transition-opacity hover:opacity-90">{user.initial}</Link>
          </div>
        </div>
      </div>

      {/* DETAIL CARD */}
      {selected && sm && (
        <div className="absolute right-3 top-[64px] z-[600] w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[#E4E3DF] bg-white shadow-[0_12px_40px_rgba(24,24,27,0.18)] sm:top-[72px] sm:right-4">
          <div className="relative h-[132px] w-full bg-[#e6e4df]">
            {selected.photoUrl ? (
              <Image src={selected.photoUrl} alt={selected.title} fill unoptimized className="object-cover" sizes="360px" />
            ) : (
              <div className="grid h-full place-items-center text-[12px] text-zinc-400">Belum ada foto</div>
            )}
            <button type="button" onClick={() => setSelectedId(null)} aria-label="Tutup" className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/65">✕</button>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {selected.sharedBy && <div className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-violet-600">Dibagikan {selected.sharedBy}</div>}
                <h3 className="text-[15px] font-extrabold leading-tight tracking-tight text-zinc-900">{selected.title}</h3>
                <div className="mt-0.5 text-[13px] font-semibold text-zinc-700">{rp(selected.perBulan)}<span className="text-[11px] font-normal text-zinc-400">/bln</span></div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-[22px] font-extrabold leading-none tabular-nums" style={{ color: sm.color }}>{selected.score == null ? "—" : Math.round(selected.score)}</div>
                <div className="text-[9.5px] font-semibold uppercase tracking-wide text-zinc-400">score</div>
              </div>
            </div>

            <div className="my-3 h-px bg-[#E4E3DF]" />
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Analisis Trade-off</div>
            <TradeRow label="Harga" score={selected.scoreHarga} />
            <TradeRow label="Perjalanan" score={selected.scoreLokasi} note={selected.durationMin != null ? `~${selected.durationMin} mnt ke kantor` : selected.distanceKm != null ? `${selected.distanceKm} km` : null} />
            <TradeRow label="Fasilitas" score={selected.scoreFasilitas} />

            <div className="mt-3 rounded-xl border border-teal-100 bg-teal-50/60 p-3">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-teal-800">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                Worth It Logic
              </div>
              <p className="text-[12px] leading-relaxed text-teal-900/90">{selected.logic}</p>
            </div>

            <div className="mt-3.5 flex gap-2">
              <button type="button" onClick={() => router.push(`/shortlist/${selected.id}`)} className="h-9 flex-1 rounded-lg border border-[#E4E3DF] text-[13px] font-semibold text-zinc-700 transition-colors hover:bg-[#F4F3F0]">Lihat Detail</button>
              <button
                type="button"
                onClick={() => toggleCompare(selected.id)}
                className={`h-9 flex-1 rounded-lg text-[13px] font-semibold text-white transition-colors ${compare.includes(selected.id) ? "bg-zinc-800 hover:bg-zinc-900" : "bg-teal-700 hover:bg-teal-800"}`}
              >
                {compare.includes(selected.id) ? "✓ Dipilih" : "Bandingkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KIRI-BAWAH: Bandingkan terpilih + switcher basemap */}
      <div className="absolute bottom-20 left-4 z-[600] flex flex-col items-start gap-2 sm:bottom-5">
        {compare.length > 0 && (
          <button
            type="button"
            onClick={goCompare}
            className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-[13.5px] font-semibold text-white shadow-[0_8px_24px_rgba(15,118,110,0.4)] transition-colors hover:bg-teal-800"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect width="5" height="18" x="3" y="3" rx="1" /><rect width="5" height="18" x="16" y="3" rx="1" /></svg>
            Bandingkan Terpilih ({compare.length})
          </button>
        )}
        <div className="flex gap-0.5 rounded-xl border border-[#E4E3DF] bg-white/95 p-1 shadow-sm backdrop-blur">
          {BASEMAP_OPTS.map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => setBasemap(o.v)}
              aria-pressed={basemap === o.v}
              className={`rounded-lg px-2.5 py-1 text-[11.5px] font-medium transition-colors ${basemap === o.v ? "bg-teal-700 text-white" : "text-zinc-600 hover:bg-[#F4F3F0]"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* LEGEND */}
      <div className="absolute bottom-20 right-4 z-[500] rounded-xl border border-[#E4E3DF] bg-white/95 px-3.5 py-2.5 shadow-sm backdrop-blur sm:bottom-5">
        {([
          { c: "#059669", t: "90+", l: "Excellent Value" },
          { c: "#0f766e", t: "80–89", l: "Strong Value" },
          { c: "#d97706", t: "70–79", l: "Fair Value" },
        ] as const).map((r) => (
          <div key={r.t} className="flex items-center gap-2 py-0.5 text-[11.5px]">
            <span className="grid h-4 w-9 place-items-center rounded-md text-[9px] font-bold text-white" style={{ background: r.c }}>{r.t}</span>
            <span className="text-zinc-600">{r.l}</span>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {items.length === 0 && (
        <div className="absolute left-1/2 top-1/2 z-[400] w-[min(340px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#E4E3DF] bg-white/95 p-6 text-center shadow-lg backdrop-blur">
          <p className="text-sm font-bold text-zinc-900">Belum ada hunian berlokasi</p>
          <p className="mx-auto mt-1 max-w-xs text-[12.5px] text-zinc-500">Tambah hunian dengan alamat, atau buka detailnya sekali agar lokasinya terpetakan.</p>
        </div>
      )}
    </div>
  );
}

function PopTitle({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">{children}</div>;
}

// Chip toggle on/off (bukan dropdown) — untuk filter boolean.
function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 text-[12.5px] font-medium shadow-sm backdrop-blur transition-colors ${active ? "border-teal-600 bg-teal-700 text-white" : "border-[#E4E3DF] bg-white/95 text-zinc-600 hover:bg-white"}`}
    >
      {children}
    </button>
  );
}

// Chip filter dengan dropdown (open state + klik-luar untuk menutup).
function FilterPopover({ label, active, children }: { label: string; active: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`flex h-10 items-center gap-1.5 rounded-xl border px-3 text-[12.5px] font-medium shadow-sm backdrop-blur transition-colors ${active ? "border-teal-300 bg-teal-50 text-teal-800" : "border-[#E4E3DF] bg-white/95 text-zinc-600 hover:bg-white"}`}
      >
        {label}
        {active && <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6" /></svg>
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-[700] w-60 rounded-xl border border-[#E4E3DF] bg-white p-3.5 shadow-[0_12px_32px_rgba(24,24,27,0.16)]">
          {children}
        </div>
      )}
    </div>
  );
}
