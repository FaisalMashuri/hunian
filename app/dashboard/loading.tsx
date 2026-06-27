import { Skeleton } from "@/components/ui/skeleton";
import { DashboardSkeleton } from "./skeletons";

// Skeleton route-level (navigasi pertama ke /kandidat), sebelum page shell siap.
// Mengikuti layout AppShell: ruang sidebar (sm:pl-64) + topbar + konten dashboard.
export default function Loading() {
  return (
    <div className="min-h-screen sm:pl-64">
      {/* Topbar (sticky, mepet ujung) */}
      <div className="flex h-14 items-center justify-between gap-3 border-b border-[#E4E3DF] bg-white px-4 sm:h-[54px] sm:px-6">
        <div className="min-w-0 space-y-1.5">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-2.5 w-40" />
        </div>
        <Skeleton className="h-[34px] w-28 rounded-[9px]" />
      </div>
      <main className="w-full pb-28 sm:pb-12">
        <DashboardSkeleton />
      </main>
    </div>
  );
}
