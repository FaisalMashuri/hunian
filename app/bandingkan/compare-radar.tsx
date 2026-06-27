"use client";

// Radar perbandingan gaya mockup — N seri (2–4 kandidat). Dimensi Slice-2 (placeholder)
// di-ghost: spoke & label tetap tampil ("Segera"), tapi tak ada titik data (jujur, tanpa angka karangan).
// Komponen TERPISAH dari lib radar lama (app/bandingkan/radar-chart.tsx) agar tak merusak detail page.

export type RadarDimDef = { name: string; placeholder?: boolean };
export type RadarSeriesDef = { color: string; values: (number | null)[] };

export function CompareRadar({
  dims,
  series,
  size = 300,
}: {
  dims: RadarDimDef[];
  series: RadarSeriesDef[];
  size?: number;
}) {
  const n = dims.length;
  const cx = 150;
  const cy = 132;
  const R = 100;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const angleOf = (i: number) => -90 + i * (360 / n);
  const pt = (ang: number, r: number) => ({ x: cx + r * Math.cos(toRad(ang)), y: cy + r * Math.sin(toRad(ang)) });

  const realIdx = dims.map((d, i) => (d.placeholder ? -1 : i)).filter((i) => i >= 0);

  const polyStr = (pts: { x: number; y: number }[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <svg viewBox="0 0 300 270" width="100%" style={{ maxWidth: size }} xmlns="http://www.w3.org/2000/svg">
      {/* Grid */}
      {[25, 50, 75, 100].map((pct) => (
        <polygon
          key={pct}
          points={polyStr(dims.map((_, i) => pt(angleOf(i), (R * pct) / 100)))}
          fill="none"
          stroke="#E4E3DF"
          strokeWidth="1"
          strokeDasharray={pct < 100 ? "3,2" : ""}
        />
      ))}
      {/* Axis spokes */}
      {dims.map((d, i) => {
        const p = pt(angleOf(i), R);
        return <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="#E4E3DF" strokeWidth="1" />;
      })}

      {/* Series polygons (hanya dimensi nyata) */}
      {series.map((s, si) => {
        const pts = realIdx.map((i) => pt(angleOf(i), (R * (s.values[i] ?? 0)) / 100));
        return (
          <g key={si}>
            <polygon points={polyStr(pts)} fill={s.color} fillOpacity={0.16} stroke={s.color} strokeWidth="2" strokeLinejoin="round" />
            {pts.map((p, pi) => (
              <circle key={pi} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4" fill="#fff" stroke={s.color} strokeWidth="2.5" />
            ))}
          </g>
        );
      })}

      {/* Labels + skor per sumbu */}
      {dims.map((d, i) => {
        const lp = pt(angleOf(i), R + 24);
        const ax = angleOf(i);
        const anchor = Math.abs(Math.cos(toRad(ax))) < 0.3 ? "middle" : Math.cos(toRad(ax)) > 0 ? "start" : "end";
        return (
          <g key={i}>
            <text x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor={anchor} fontFamily="Inter,sans-serif" fontSize="11" fill="#71717A" fontWeight="500">
              {d.name}
            </text>
            {d.placeholder ? (
              <text x={lp.x.toFixed(1)} y={(lp.y + 13).toFixed(1)} textAnchor={anchor} fontFamily="Inter,sans-serif" fontSize="9.5" fill="#A1A1AA">
                Segera
              </text>
            ) : (
              series.map((s, si) => (
                <text
                  key={si}
                  x={(lp.x + (si - (series.length - 1) / 2) * 18).toFixed(1)}
                  y={(lp.y + 13).toFixed(1)}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono,monospace"
                  fontSize="11"
                  fill={s.color}
                  fontWeight="600"
                >
                  {s.values[i] == null ? "—" : Math.round(s.values[i] as number)}
                </text>
              ))
            )}
          </g>
        );
      })}

      {series.length === 2 && (
        <text x={cx} y={cy - 3} textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="10" fill="#A1A1AA">vs</text>
      )}
    </svg>
  );
}
