import Link from "next/link";
import type { BudgetZone } from "@/lib/pricing";

const rpShort = (n: number | null) =>
  n == null ? "—" : "Rp " + new Intl.NumberFormat("id-ID").format(n);
const starRow = (w: number | null) => {
  const n = Math.min(5, Math.max(0, Math.round((w ?? 0) * 5)));
  return { on: n, off: 5 - n };
};

const ZONE_BARS: { z: BudgetZone; label: string; color: string }[] = [
  { z: "comfort", label: "Hemat", color: "#14b8a6" },
  { z: "ideal", label: "Ideal", color: "#059669" },
  { z: "stretch", label: "Menekan", color: "#d97706" },
  { z: "over", label: "Di atas maks", color: "#e11d48" },
];

function CtxCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-stone-50/70 p-3">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.07em] text-zinc-400">{title}</div>
      {children}
    </div>
  );
}

// Distribusi budget — butuh data kandidat (dipisah agar bisa di-stream via <Suspense>,
// sementara Budget/Prioritas/Deadline dari prefs tampil instan).
export function SidebarZone({ zoneCount, zoneTotal }: { zoneCount: Record<BudgetZone, number>; zoneTotal: number }) {
  return (
    <CtxCard title="Distribusi budget">
      <div className="mb-2 flex h-2 gap-0.5 overflow-hidden rounded-full">
        {ZONE_BARS.map((b) => (
          <div key={b.z} style={{ width: `${zoneTotal ? (zoneCount[b.z] / zoneTotal) * 100 : 0}%`, background: b.color }} />
        ))}
      </div>
      <div className="space-y-1">
        {ZONE_BARS.map((b) => (
          <div key={b.z} className="flex items-center justify-between text-[11.5px]">
            <span className="flex items-center gap-1.5 text-zinc-500">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: b.color }} />
              {b.label}
            </span>
            <span className="tabular-nums text-zinc-700">{zoneCount[b.z]}</span>
          </div>
        ))}
      </div>
    </CtxCard>
  );
}

export function SidebarContext({
  ideal,
  max,
  priorities,
  zoneSlot,
  deadlineDate,
  deadlineDaysLeft,
}: {
  ideal: number | null;
  max: number | null;
  priorities: { label: string; w: number | null }[];
  zoneSlot: React.ReactNode;
  deadlineDate: string | null;
  deadlineDaysLeft: number | null;
}) {
  return (
    <>
      <CtxCard title="Budget">
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="text-zinc-500">Ideal</span>
          <span className="font-semibold tabular-nums text-teal-700">{rpShort(ideal)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-[12.5px]">
          <span className="text-zinc-500">Maksimal</span>
          <span className="font-medium tabular-nums text-zinc-700">{rpShort(max)}</span>
        </div>
      </CtxCard>

      <CtxCard title="Prioritasmu">
        <div className="space-y-1">
          {priorities.map((p) => {
            const { on, off } = starRow(p.w);
            return (
              <div key={p.label} className="flex items-center justify-between text-[12.5px]">
                <span className="text-zinc-500">{p.label}</span>
                <span className="tracking-tight">
                  <span className="text-amber-500">{"★".repeat(on)}</span>
                  <span className="text-zinc-300">{"★".repeat(off)}</span>
                </span>
              </div>
            );
          })}
        </div>
      </CtxCard>

      {zoneSlot}

      {/* Deadline — value penuh Slice 2; saat ini placeholder bila belum diset */}
      {deadlineDate && deadlineDaysLeft != null ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-amber-700">⏱ Deadline</div>
          <div className="mt-0.5 text-[17px] font-extrabold text-amber-900">{deadlineDaysLeft} hari lagi</div>
          <div className="text-[11px] text-amber-700">Target: {deadlineDate}</div>
        </div>
      ) : (
        <Link href="/pengaturan" className="block rounded-xl border border-dashed border-zinc-200 bg-stone-50/70 p-3 transition-colors hover:border-zinc-300">
          <div className="text-[9.5px] font-bold uppercase tracking-[0.06em] text-zinc-400">⏱ Deadline pindah</div>
          <div className="mt-0.5 text-[12.5px] font-medium text-zinc-500">Kapan kamu perlu pindah? Set targetnya →</div>
        </Link>
      )}
    </>
  );
}
