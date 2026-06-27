import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

// Skeleton halaman Bandingkan — topnav + pemilih kandidat + area tabel banding.
export function CompareSkeleton() {
  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      <div className="flex h-[54px] items-center gap-3 border-b border-[#E4E3DF] bg-white px-4 sm:px-6">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-4 w-40 flex-1" />
      </div>
      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6">
        {/* Pemilih kandidat */}
        <div className="mb-5 flex gap-2.5 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} className="h-20 flex-1" />
          ))}
        </div>
        {/* Area banding */}
        <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
          <SkeletonCard className="hidden h-[420px] lg:block" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} className="h-[420px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
