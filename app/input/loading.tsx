import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

// Skeleton route-level wizard /input (navigasi pertama): topnav + stepper + area form.
export default function Loading() {
  return (
    <div className="min-h-screen bg-[#F4F3F0]">
      <div className="flex h-[54px] items-center gap-3 border-b border-[#E4E3DF] bg-white px-4 sm:px-6">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-4 w-32 flex-1" />
      </div>
      <div className="mx-auto max-w-[760px] px-4 py-6 sm:px-6">
        {/* Stepper */}
        <div className="mb-6 flex items-center justify-center gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-24 rounded-full" />
          ))}
        </div>
        {/* Form card */}
        <SkeletonCard className="h-[360px]" />
        <div className="mt-4 flex justify-end gap-2.5">
          <Skeleton className="h-11 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
