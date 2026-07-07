"use client";

import { useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CandidateStatus } from "@/lib/types/db";
import type { Periode } from "@/lib/constants/periode";
import { formatHargaListing, BUDGET_ZONE_META, type BudgetZone } from "@/lib/pricing";
import { VERDICT_META, type VerdictKind } from "@/lib/scoring/verdict";
import { setStatusAction } from "./actions";

export type CardData = {
  id: string;
  title: string;
  property_type: string;
  status: CandidateStatus;
  score_total: number | null;
  perBulan: number | null;
  periode: Periode | null;
  zone: BudgetZone | null;
  distanceKm: number | null;
  flagCount: number;
  completeness: number;
  coverageKnown: number;
  coverageTotal: number;
  needsData: boolean;
  alamat: string | null;
  verdict: { kind: VerdictKind; label: string; reason: string };
  activity: string;
  sharedBy?: string | null; // nama owner bila kandidat ini dibagikan ke kita (bukan milik sendiri)
  photoUrl?: string | null; // foto sampul (signed URL) — null bila belum ada foto
};

// Badge "dibagikan oleh X" untuk kandidat milik partner (Collaboration C-1).
const SharedBadge = ({ by }: { by: string }) => (
  <span
    className="inline-flex shrink-0 items-center gap-[3px] rounded-full bg-violet-50 px-[7px] py-[1.5px] text-[10px] font-semibold text-violet-700"
    title={`Dibagikan oleh ${by} — kamu hanya bisa melihat`}
  >
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    {by}
  </span>
);

// Thumbnail foto sampul untuk list view (foto atau placeholder ikon).
const CardThumb = ({ url, title, size }: { url: string | null; title: string; size: number }) => (
  <div className="relative shrink-0 overflow-hidden rounded-lg bg-[#eceae5]" style={{ width: size, height: size }}>
    {url ? (
      <Image src={url} alt={title} fill unoptimized sizes={`${size}px`} className="object-cover" />
    ) : (
      <span className="grid h-full w-full place-items-center text-zinc-300">
        <svg width={Math.round(size * 0.45)} height={Math.round(size * 0.45)} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
      </span>
    )}
  </div>
);

const STATUS_META: Record<CandidateStatus, { label: string; dot: string; cls: string }> = {
  tersedia: { label: "Tersedia", dot: "bg-emerald-500", cls: "bg-emerald-50 text-emerald-700" },
  sudah_disurvey: { label: "Disurvey", dot: "bg-blue-500", cls: "bg-blue-50 text-blue-700" },
  sudah_tersewa: { label: "Tersewa", dot: "bg-zinc-400", cls: "bg-zinc-100 text-zinc-500" },
};

const TYPE_CLS: Record<string, string> = {
  kontrakan: "bg-zinc-900 text-white",
  apartemen: "bg-teal-700 text-white",
  kost: "bg-orange-600 text-white",
};

const rpFull = (n: number | null) => (n == null ? "—" : "Rp " + new Intl.NumberFormat("id-ID").format(n));
const completenessColor = (p: number) => (p >= 80 ? "bg-emerald-500" : p >= 50 ? "bg-teal-500" : "bg-amber-500");

const VerdictIcon = ({ kind }: { kind: VerdictKind }) => {
  if (kind === "sisihkan")
    return (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="m9.5 9.5 5 5" /><path d="m14.5 9.5-5 5" /></svg>);
  if (kind === "perlu_data")
    return (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>);
  return (<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>);
};

// Chip kelengkapan data dimensi — muncul hanya saat skor dihitung dari sebagian dimensi.
// Sinyal "skor 72 tapi data belum penuh" agar listing bolong tak terbaca sepasti yang lengkap.
const CoverageChip = ({ known, total }: { known: number; total: number }) =>
  known < total ? (
    <span
      className="inline-flex shrink-0 items-center rounded-full bg-amber-50 px-[6px] py-[1px] text-[10px] font-semibold text-amber-700"
      title={`Skor dihitung dari ${known} dari ${total} dimensi — sisanya datanya belum ada`}
    >
      data {known}/{total}
    </span>
  ) : null;

const Zone = ({ zone }: { zone: BudgetZone | null }) =>
  zone ? (
    <span className={`inline-flex items-center gap-[3px] rounded-full border px-[8px] py-[2px] text-[11px] font-semibold ${BUDGET_ZONE_META[zone].pill}`}>
      <span className={`h-[5px] w-[5px] rounded-full ${BUDGET_ZONE_META[zone].dot}`} />
      {BUDGET_ZONE_META[zone].label}
    </span>
  ) : null;

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span className={`flex h-[20px] w-[20px] items-center justify-center rounded-[6px] border-2 text-[12px] font-bold text-white shadow-sm transition-colors ${checked ? "border-teal-600 bg-teal-600" : "border-zinc-300 bg-white"}`}>
      {checked ? "✓" : ""}
    </span>
  );
}

export function CandidateCard({
  c,
  selected = false,
  onToggle,
  listView = false,
}: {
  c: CardData;
  selected?: boolean;
  onToggle?: (id: string) => void;
  listView?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const s = STATUS_META[c.status];
  const vm = VERDICT_META[c.verdict.kind];
  const archived = c.status === "sudah_tersewa";
  const shared = !!c.sharedBy; // kandidat milik partner → read-only bagi kita
  const dbFlag = c.flagCount > 0 && !archived;
  const selectable = !archived && !!onToggle;

  const archive = () =>
    start(async () => {
      await setStatusAction(c.id, archived ? "tersedia" : "sudah_tersewa");
      router.refresh();
    });

  const navigate = (e: React.MouseEvent<HTMLElement>) => {
    if ((e.target as HTMLElement).closest("[data-stop]")) return;
    router.push(`/shortlist/${c.id}`);
  };

  const CheckBtn = selectable ? (
    <button
      type="button"
      data-stop
      onClick={(e) => { e.stopPropagation(); onToggle?.(c.id); }}
      aria-label={selected ? "Batal pilih" : "Pilih untuk bandingkan"}
      aria-pressed={selected}
    >
      <Checkbox checked={selected} />
    </button>
  ) : null;

  // ── LIST VIEW ──
  if (listView) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={navigate}
        onKeyDown={(e) => { if (e.key === "Enter") router.push(`/shortlist/${c.id}`); }}
        className={`flex cursor-pointer items-center gap-3 rounded-[10px] border bg-white px-4 py-3 shadow-sm transition-all hover:shadow-md ${selected ? "border-teal-600 ring-2 ring-teal-100" : dbFlag ? "border-l-[3px] border-l-amber-500" : "border-[#E4E3DF]"} ${archived ? "opacity-60" : ""}`}
      >
        {selectable && <div data-stop>{CheckBtn}</div>}
        <CardThumb url={c.photoUrl ?? null} title={c.title} size={40} />
        <span className={`h-[7px] w-[7px] shrink-0 rounded-full ${s.dot}`} />
        <div className="min-w-0 flex-[2]">
          <div className="truncate text-[14px] font-bold text-zinc-900">{c.title}</div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className={`shrink-0 rounded-[4px] px-[5px] py-[1.5px] text-[9px] font-bold uppercase tracking-[0.05em] ${TYPE_CLS[c.property_type] ?? "bg-zinc-200 text-zinc-700"}`}>{c.property_type}</span>
            {c.sharedBy && <SharedBadge by={c.sharedBy} />}
            {c.alamat && <span className="truncate text-[11.5px] text-zinc-500">{c.alamat}</span>}
          </div>
        </div>
        <div className="hidden w-[150px] shrink-0 sm:block">
          <div className="text-[14px] font-bold tabular-nums text-zinc-900">{rpFull(c.perBulan)}<span className="text-[10px] font-normal text-zinc-500"> /bln</span></div>
          <div className="mt-1"><Zone zone={c.zone} /></div>
        </div>
        <div className="hidden flex-1 lg:block">
          <span className={`text-[11.5px] font-extrabold uppercase tracking-[0.04em] ${vm.labelColor}`}>{c.verdict.label}</span>
        </div>
        <div className="hidden w-14 shrink-0 text-center sm:block">
          <div className="text-[16px] font-extrabold tabular-nums text-teal-700">{c.score_total ?? "—"}</div>
          <div className="text-[9px] uppercase tracking-wide text-zinc-400">skor</div>
          {c.coverageKnown < c.coverageTotal && <div className="mt-0.5 text-[9px] font-semibold text-amber-600">data {c.coverageKnown}/{c.coverageTotal}</div>}
        </div>
        <span className={`hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold sm:inline-flex ${s.cls}`}>
          <span className={`h-[5px] w-[5px] rounded-full ${s.dot}`} />{s.label}
        </span>
        <button type="button" data-stop onClick={(e) => { e.stopPropagation(); router.push(`/shortlist/${c.id}`); }} className="shrink-0 rounded-[6px] bg-teal-700 px-[10px] py-[5px] text-[11.5px] font-semibold text-white hover:bg-teal-800">Detail →</button>
      </div>
    );
  }

  // ── GRID CARD ──
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={navigate}
      onKeyDown={(e) => { if (e.key === "Enter") router.push(`/shortlist/${c.id}`); }}
      className={`relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[14px] border bg-white text-left shadow-sm transition-all hover:-translate-y-px hover:shadow-md ${selected ? "border-teal-600 ring-2 ring-teal-100" : dbFlag ? "border-l-[3px] border-l-amber-500" : "border-[#E4E3DF]"} ${archived ? "opacity-60" : ""}`}
    >
      {selectable && <div className="absolute right-[10px] top-[10px] z-10" data-stop>{CheckBtn}</div>}

      {/* Cover foto — foto bila ada, placeholder bila belum diupload */}
      <div className="relative h-28 w-full overflow-hidden bg-gradient-to-br from-[#eceae5] to-[#e3e1db]">
        {c.photoUrl ? (
          <Image src={c.photoUrl} alt={c.title} fill unoptimized sizes="(max-width: 640px) 100vw, 320px" className="object-cover" />
        ) : (
          <span className="grid h-full w-full place-items-center text-zinc-300">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
          </span>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-[7px] px-[13px] pb-[9px] pt-[13px]">
        <span className={`mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full ${s.dot}`} />
        <div className={`min-w-0 flex-1 ${selectable ? "pr-7" : ""}`}>
          <h3 className="truncate text-[14px] font-bold leading-[1.25] text-zinc-900">{c.title}</h3>
          <div className="mt-[3px] flex items-center gap-[5px]">
            <span className={`shrink-0 rounded-[4px] px-[5px] py-[1.5px] text-[9px] font-bold uppercase tracking-[0.05em] ${TYPE_CLS[c.property_type] ?? "bg-zinc-200 text-zinc-700"}`}>{c.property_type}</span>
            {c.sharedBy && <SharedBadge by={c.sharedBy} />}
            {c.alamat && <span className="truncate text-[11.5px] text-zinc-500">{c.alamat}</span>}
          </div>
        </div>
      </div>

      {/* Price + zone */}
      <div className="px-[13px] pb-[10px]">
        <div className="flex flex-wrap items-baseline gap-x-[5px] gap-y-0.5">
          <span className={`text-[17px] font-semibold tabular-nums tracking-[-0.01em] ${c.needsData ? "text-zinc-500" : "text-zinc-900"}`}>{rpFull(c.perBulan)}</span>
          <span className="text-[11px] text-zinc-500">/bln</span>
          {c.periode && c.periode !== "bulan" && <span className="text-[10.5px] text-zinc-400">· {formatHargaListing(c.perBulan, c.periode)}</span>}
        </div>
        <div className="mt-[4px] flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-[6px]">
            <Zone zone={c.zone} />
            <span className={`text-[11px] ${c.distanceKm == null ? "text-amber-600" : "text-zinc-500"}`}>{c.distanceKm != null ? `· ${c.distanceKm} km` : "· Jarak belum diisi"}</span>
            <CoverageChip known={c.coverageKnown} total={c.coverageTotal} />
          </div>
          <span className="shrink-0 whitespace-nowrap text-[12px] font-extrabold tabular-nums text-teal-700">
            {c.score_total ?? "—"}<span className="ml-0.5 text-[9px] font-semibold uppercase tracking-wide text-zinc-400">skor</span>
          </span>
        </div>
      </div>

      {!archived && (
        <>
          <div className="h-px bg-[#E4E3DF]" />
          {/* Verdict */}
          <div className="flex-1 px-[13px] py-[10px]">
            <div className="flex items-start gap-[7px]">
              <span className={`mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-[6px] ${vm.iconBg} ${vm.iconColor}`}><VerdictIcon kind={c.verdict.kind} /></span>
              <div className="min-w-0">
                <div className={`text-[11.5px] font-extrabold uppercase tracking-[0.04em] ${vm.labelColor}`}>{c.verdict.label}</div>
                <div className="mt-[1.5px] text-[11.5px] leading-[1.4] text-zinc-500">{c.verdict.reason}</div>
              </div>
            </div>
            {c.flagCount > 0 && (
              <div className="mt-[7px] flex items-center gap-[5px] rounded-[6px] bg-amber-50 px-[8px] py-[5px] text-[11px] font-medium text-amber-700">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m14.5 9.5-5 5" /><path d="m9.5 9.5 5 5" /></svg>
                {c.flagCount} deal breaker terdeteksi
              </div>
            )}
          </div>

          {/* Meta-bottom: kelengkapan data + aktivitas */}
          <div className="flex items-center gap-[8px] border-t border-[#E4E3DF] px-[13px] py-[8px]">
            <div className="flex flex-1 items-center gap-[5px]">
              <div className="h-[3px] w-14 max-w-[56px] flex-1 overflow-hidden rounded-full bg-[#F4F3F0]"><div className={`h-full rounded-full ${completenessColor(c.completeness)}`} style={{ width: `${c.completeness}%` }} /></div>
              <span className="text-[10.5px] tabular-nums text-zinc-400">{c.completeness}% lengkap</span>
            </div>
            <span className="hidden text-[10.5px] text-zinc-400 min-[380px]:inline">Belum disurvey</span>
            <span className="ml-auto whitespace-nowrap text-[10.5px] text-zinc-400">{c.activity}</span>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="flex items-center gap-[6px] border-t border-[#E4E3DF] px-[13px] py-[9px]">
        <span className={`inline-flex items-center gap-[4px] rounded-full px-[8px] py-[3px] text-[11px] font-semibold ${s.cls}`}>
          <span className={`h-[5px] w-[5px] rounded-full ${s.dot}`} />{s.label}
        </span>
        <div className="ml-auto flex gap-[4px]" data-stop>
          {shared ? null : archived ? (
            <button type="button" onClick={(e) => { e.stopPropagation(); archive(); }} disabled={pending} className="rounded-[6px] border border-[#E4E3DF] px-[10px] py-[4px] text-[11.5px] font-medium text-zinc-600 transition-colors hover:bg-[#F4F3F0] disabled:opacity-50">{pending ? "…" : "Pulihkan"}</button>
          ) : c.needsData ? (
            <button type="button" onClick={(e) => { e.stopPropagation(); router.push(`/shortlist/${c.id}/edit`); }} className="rounded-[6px] border border-[#E4E3DF] px-[10px] py-[4px] text-[11.5px] font-medium text-zinc-600 transition-colors hover:bg-[#F4F3F0]">Lengkapi</button>
          ) : (
            <button type="button" onClick={(e) => { e.stopPropagation(); archive(); }} disabled={pending} className="rounded-[6px] border border-[#E4E3DF] px-[10px] py-[4px] text-[11.5px] font-medium text-zinc-600 transition-colors hover:bg-[#F4F3F0] disabled:opacity-50">{pending ? "…" : "Arsipkan"}</button>
          )}
          <button type="button" onClick={(e) => { e.stopPropagation(); router.push(`/shortlist/${c.id}`); }} className="rounded-[6px] bg-teal-700 px-[10px] py-[4px] text-[11.5px] font-semibold text-white transition-colors hover:bg-teal-800">Detail →</button>
        </div>
      </div>
    </div>
  );
}
