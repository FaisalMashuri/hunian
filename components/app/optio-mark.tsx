// Logo mark Optio — "berlian" (rounded diamond) dengan titik di pusat.
// Vektor inline (bukan raster) supaya tajam di semua ukuran & ringan.
// Warna mengikuti `currentColor`, jadi atur lewat util teks (mis. text-teal-700 / text-primary).
export function OptioMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <rect
        x="12"
        y="1.5"
        width="14.85"
        height="14.85"
        rx="3"
        transform="rotate(45 12 1.5)"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </svg>
  );
}
