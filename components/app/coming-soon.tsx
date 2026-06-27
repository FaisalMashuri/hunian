// Placeholder section untuk fitur Slice 2 yang belum punya data/tabel.
// Tampil redup + badge "Segera" — jujur bahwa fiturnya belum ada, tanpa angka palsu.

export function ComingSoon({
  title,
  detail,
  className = "",
}: {
  title: string;
  detail: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/60 p-5 ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {title}
        </h2>
        <span className="shrink-0 rounded-full bg-zinc-200/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
          Segera
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{detail}</p>
    </div>
  );
}
