import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

// Skeleton sidebar "Distribusi budget" (meniru CtxCard di sidebar-context).
export function SidebarZoneSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-stone-50/70 p-3">
      <Skeleton className="mb-2 h-2.5 w-24" />
      <Skeleton className="mb-2 h-2 w-full rounded-full" />
      <div className="space-y-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-2.5 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton konten utama dashboard — meniru layout DashboardClient (insights → budget map → stats → grid).
export function DashboardSkeleton() {
  return (
    <div className="px-4 pb-24 pt-4 sm:px-6 sm:pt-5">
      {/* Insights */}
      <div className="mb-4 grid gap-2.5 sm:mb-[18px] md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="h-[88px]" />
        ))}
      </div>
      {/* Budget map (desktop) */}
      <SkeletonCard className="mb-[18px] hidden h-[180px] sm:block" />
      {/* Stats */}
      <div className="mb-[18px] hidden grid-cols-5 gap-2.5 sm:grid">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} className="h-[68px]" />
        ))}
      </div>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} className="h-[62px]" />
        ))}
      </div>
      {/* Toolbar */}
      <div className="mb-3.5 flex items-center gap-2.5">
        <Skeleton className="h-[34px] w-full sm:max-w-[280px] sm:flex-1" />
        <Skeleton className="ml-auto h-[34px] w-28" />
      </div>
      {/* Grid kartu */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="h-[188px]" />
        ))}
      </div>
    </div>
  );
}
