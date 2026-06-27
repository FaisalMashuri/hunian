// Waktu relatif (id-ID) untuk aktivitas kartu, mis. "2 hari lalu", "3 minggu lalu".
// Server component memanggil dengan `new Date()` sebagai now (deterministik per-render).
export function relativeId(date: string | Date | null, now: Date = new Date()): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const ms = now.getTime() - d.getTime();
  if (Number.isNaN(ms)) return "—";
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day <= 0) return "hari ini";
  if (day === 1) return "kemarin";
  if (day < 7) return `${day} hari lalu`;
  const wk = Math.floor(day / 7);
  if (wk < 5) return `${wk} minggu lalu`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo} bulan lalu`;
  return `${Math.floor(day / 365)} tahun lalu`;
}
