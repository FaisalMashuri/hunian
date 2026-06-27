import { Skeleton } from "@/components/ui/skeleton";

// Skeleton kartu peta (meniru MapPanel: header + area peta + footer).
export function MapSkeleton() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#E4E3DF] bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#E4E3DF] px-[18px] py-3.5">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-2.5 w-24" />
      </div>
      <Skeleton className="h-56 w-full rounded-none sm:h-[280px]" />
      <div className="flex items-center gap-4 border-t border-[#E4E3DF] px-[18px] py-3">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-2.5 w-20" />
      </div>
    </div>
  );
}

// Skeleton galeri foto (strip atas).
export function PhotoSkeleton() {
  return (
    <div className="flex gap-2.5">
      <Skeleton className="h-48 flex-[2] rounded-2xl sm:h-64" />
      <div className="hidden flex-1 flex-col gap-2.5 sm:flex">
        <Skeleton className="flex-1 rounded-2xl" />
        <Skeleton className="flex-1 rounded-2xl" />
      </div>
    </div>
  );
}

// Skeleton seksi POI (Overpass bisa lambat saat fetch pertama) — header + 4 kartu + peta.
export function PoiSkeleton() {
  return (
    <div className="mt-6">
      <div className="mb-3.5 flex items-center gap-2">
        <span className="text-sm font-bold tracking-tight text-zinc-900">Akses &amp; Lingkungan Sekitar</span>
        <span className="h-px flex-1 bg-[#E4E3DF]" />
        <span className="text-xs text-zinc-400">memuat data OpenStreetMap…</span>
      </div>
      <div className="mb-3.5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[88px] rounded-xl border border-[#E4E3DF]" />
        ))}
      </div>
      <Skeleton className="h-[300px] rounded-2xl border border-[#E4E3DF]" />
    </div>
  );
}
