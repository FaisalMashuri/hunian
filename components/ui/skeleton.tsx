import { cn } from "@/lib/utils";

// Primitif skeleton tunggal untuk seluruh app (NFR-11 — perceived performance).
// Bukan spinner: blok berdenyut yang MENIRU layout asli agar transisi terasa mulus.
// `animate-pulse` otomatis dihormati oleh prefers-reduced-motion (Tailwind mematikan animasi).
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-zinc-100", className)} aria-hidden />;
}

// Kartu skeleton selaras token kartu eksisting (border-[#E4E3DF], rounded, shadow-sm).
export function SkeletonCard({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-[14px] border border-[#E4E3DF] bg-zinc-100", className)} aria-hidden />;
}
