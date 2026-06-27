import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

// Skeleton route-level untuk detail kandidat (navigasi pertama), meniru layout halaman:
// topbar + status strip + header properti + galeri + grid 2 kolom.
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      <div className="flex h-[54px] items-center gap-3 border-b border-[#E4E3DF] bg-white px-4 sm:px-6">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-4 w-48 flex-1" />
        <Skeleton className="h-8 w-24 rounded-[9px]" />
      </div>
      <div className="flex items-center gap-3 border-b border-[#E4E3DF] bg-white px-4 py-2.5 sm:px-6">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="mx-auto max-w-[1200px] px-4 pb-28 pt-6 sm:px-6">
        <SkeletonCard className="h-32" />
        <Skeleton className="mt-5 h-48 rounded-2xl sm:h-64" />
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-4">
            <SkeletonCard className="h-44" />
            <SkeletonCard className="h-32" />
            <SkeletonCard className="h-[360px]" />
          </div>
          <div className="flex flex-col gap-4">
            <SkeletonCard className="h-80" />
            <SkeletonCard className="h-56" />
            <SkeletonCard className="h-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
