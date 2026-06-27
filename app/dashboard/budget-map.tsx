import { type BudgetZone } from "@/lib/pricing";

export type BudgetPoint = {
  id: string;
  label: string;
  perBulan: number;
  zone: BudgetZone | null;
  archived: boolean;
};

const rpFull = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);

const initials = (s: string) =>
  s
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

const dotColor: Record<BudgetZone, string> = {
  comfort: "#14b8a6",
  ideal: "#059669",
  stretch: "#d97706",
  over: "#e11d48",
};

type Cluster = { center: number; items: (BudgetPoint & { x: number })[] };

// Peta budget — semua kandidat di satu skala harga. Properti yang harganya mirip/sama
// di-cluster jadi satu titik dengan ANGKA jumlah; hover → daftar nama & harga.
export function BudgetMap({
  ideal,
  max,
  points,
}: {
  ideal: number | null;
  max: number | null;
  points: BudgetPoint[];
}) {
  if (ideal == null) return null;
  const ceil = max ?? ideal * 1.25;
  const maxHarga = points.reduce((m, p) => Math.max(m, p.perBulan), 0);
  const rawMax = Math.max(ceil * 1.3, maxHarga * 1.05, ideal * 1.5);
  const scaleMax = Math.ceil(rawMax / 500_000) * 500_000;
  const pos = (n: number) => Math.min(100, Math.max(0, (n / scaleMax) * 100));

  const comfortEnd = pos(ideal * 0.85);
  const idealEnd = pos(ideal);
  const stretchEnd = pos(ceil);

  // Cluster: urut harga, gabung yang jaraknya < TH% pada skala.
  const TH = 4;
  const sorted = points
    .map((p) => ({ ...p, x: pos(p.perBulan) }))
    .sort((a, b) => a.x - b.x);
  const clusters: Cluster[] = [];
  for (const p of sorted) {
    const last = clusters[clusters.length - 1];
    if (last && p.x - last.items[last.items.length - 1].x <= TH) {
      last.items.push(p);
      last.center = last.items.reduce((s, it) => s + it.x, 0) / last.items.length;
    } else {
      clusters.push({ center: p.x, items: [p] });
    }
  }

  return (
    <div className="rounded-[14px] border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-900">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          Peta Budget
        </h2>
        <span className="text-[12px] text-zinc-500">Semua hunian · skala Rp 0 – {rpFull(scaleMax)}</span>
      </div>

      {/* Zone track */}
      <div className="relative mb-1 flex h-2.5 overflow-hidden rounded-md">
        <div style={{ width: `${comfortEnd}%`, background: "#ccfbf1" }} />
        <div style={{ width: `${idealEnd - comfortEnd}%`, background: "#a7f3d0" }} />
        <div style={{ width: `${stretchEnd - idealEnd}%`, background: "#fde68a" }} />
        <div style={{ flex: 1, background: "#fecdd3" }} />
        <div className="absolute top-0 h-2.5 w-0.5 bg-emerald-600/80" style={{ left: `${idealEnd}%` }} />
        <div className="absolute top-0 h-2.5 w-0.5 bg-amber-600/80" style={{ left: `${stretchEnd}%` }} />
      </div>

      {/* Dots / cluster (overflow visible agar tooltip tak terpotong) */}
      <div className="relative h-12">
        {clusters.length === 0 ? (
          <p className="pt-3 text-[11px] text-zinc-400">Belum ada hunian untuk dipetakan.</p>
        ) : (
          clusters.map((cl, ci) => {
            const multi = cl.items.length > 1;
            const allArchived = cl.items.every((it) => it.archived);
            const bg = multi ? "#3f3f46" : cl.items[0].zone ? dotColor[cl.items[0].zone] : "#a1a1aa";
            return (
              <div
                key={ci}
                className="group/dot absolute flex -translate-x-1/2 flex-col items-center gap-0.5"
                style={{ left: `${cl.center}%`, opacity: allArchived ? 0.4 : 1 }}
              >
                <span
                  className="flex h-6 w-6 cursor-default items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white shadow"
                  style={{ background: bg }}
                >
                  {multi ? cl.items.length : initials(cl.items[0].label)}
                </span>
                {!multi && (
                  <span className="max-w-[64px] truncate text-[9px] text-zinc-500">{cl.items[0].label}</span>
                )}
                {/* Tooltip (putih, estetik) */}
                <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 group-hover/dot:block">
                  <div className="relative whitespace-nowrap rounded-xl border border-zinc-200/80 bg-white px-3 py-2 shadow-[0_8px_24px_rgba(24,24,27,0.12)] ring-1 ring-black/[0.02]">
                    {cl.items.length > 1 && (
                      <div className="mb-1 text-[9px] font-bold uppercase tracking-wide text-zinc-400">{cl.items.length} properti</div>
                    )}
                    {cl.items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between gap-3 py-px">
                        <span className="text-[11.5px] font-semibold text-zinc-800">{it.label}</span>
                        <span className="text-[11px] font-medium tabular-nums text-teal-700">{rpFull(it.perBulan)}/bln</span>
                      </div>
                    ))}
                    {/* caret */}
                    <span className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-zinc-200/80 bg-white" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Axis */}
      <div className="relative mb-2 mt-1 text-[10.5px] text-zinc-400">
        <span>Rp 0</span>
        <span className="absolute -translate-x-1/2 font-semibold text-emerald-600" style={{ left: `${idealEnd}%` }}>
          {rpFull(ideal)}
        </span>
        <span className="absolute -translate-x-1/2 font-semibold text-amber-600" style={{ left: `${stretchEnd}%` }}>
          {rpFull(ceil)}
        </span>
        <span className="float-right">{rpFull(scaleMax)}</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-3">
        {(
          [
            { z: "comfort", label: "Hemat" },
            { z: "ideal", label: "Ideal" },
            { z: "stretch", label: "Menekan" },
            { z: "over", label: "Di atas maks" },
          ] as { z: BudgetZone; label: string }[]
        ).map((b) => (
          <span key={b.z} className="flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span className="h-2 w-2 rounded-full" style={{ background: dotColor[b.z] }} />
            {b.label}
          </span>
        ))}
        <span className="ml-auto text-[10.5px] text-zinc-400">Angka = jumlah properti · hover untuk detail</span>
      </div>
    </div>
  );
}
