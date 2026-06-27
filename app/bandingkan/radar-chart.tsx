export type RadarSeries = { label: string; color: string; values: number[] }; // values 0–100, sejajar dgn axes

// Radar chart SVG murni (tanpa lib). Overlay beberapa kandidat di sumbu yang sama.
export function RadarChart({
  axes,
  series,
  size = 300,
}: {
  axes: string[];
  series: RadarSeries[];
  size?: number;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 44; // ruang untuk label
  const n = axes.length;
  const angle = (i: number) => (-90 + (360 / n) * i) * (Math.PI / 180);
  const pt = (i: number, r: number) => ({
    x: cx + Math.cos(angle(i)) * r,
    y: cy + Math.sin(angle(i)) * r,
  });
  const polyOf = (vals: number[]) =>
    vals.map((v, i) => { const p = pt(i, (radius * Math.max(0, Math.min(100, v))) / 100); return `${p.x},${p.y}`; }).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[340px]" role="img" aria-label="Perbandingan multi-aspek">
      {/* rings */}
      {[25, 50, 75, 100].map((rv) => (
        <polygon
          key={rv}
          points={axes.map((_, i) => { const p = pt(i, (radius * rv) / 100); return `${p.x},${p.y}`; }).join(" ")}
          fill="none"
          stroke="#e4e4e7"
          strokeWidth={1}
        />
      ))}
      {/* axes + label */}
      {axes.map((ax, i) => {
        const e = pt(i, radius);
        const l = pt(i, radius + 18);
        return (
          <g key={ax}>
            <line x1={cx} y1={cy} x2={e.x} y2={e.y} stroke="#e4e4e7" strokeWidth={1} />
            <text x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle" className="fill-zinc-500 text-[9px] font-semibold">
              {ax}
            </text>
          </g>
        );
      })}
      {/* series */}
      {series.map((s, si) => (
        <polygon key={si} points={polyOf(s.values)} fill={s.color} fillOpacity={0.1} stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
      ))}
      {/* vertices */}
      {series.map((s, si) =>
        s.values.map((v, i) => { const p = pt(i, (radius * Math.max(0, Math.min(100, v))) / 100); return <circle key={`${si}-${i}`} cx={p.x} cy={p.y} r={2.5} fill={s.color} />; }),
      )}
    </svg>
  );
}
