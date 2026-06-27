// Verdict TURUNAN (rule-based) — SARAN app, bukan keputusan final user.
// Selaras prinsip: scoring rule-based, AI tak memutuskan. Keputusan tercatat tetap via halaman Bandingkan.

export type VerdictKind = "pertahankan" | "cek_db" | "sisihkan" | "perlu_data";

export type VerdictInput = {
  id: string;
  title: string;
  score_total: number | null;
  score_harga: number | null;
  score_lokasi: number | null;
  score_fasilitas: number | null;
  distanceKm: number | null;
  flagCount: number;
};

export type Verdict = { kind: VerdictKind; label: string; reason: string };

export const VERDICT_META: Record<
  VerdictKind,
  { label: string; tone: "emerald" | "amber" | "rose" | "zinc"; iconBg: string; iconColor: string; labelColor: string }
> = {
  pertahankan: { label: "Pertahankan", tone: "emerald", iconBg: "bg-emerald-50", iconColor: "text-emerald-600", labelColor: "text-emerald-600" },
  cek_db: { label: "Pertahankan — cek syarat dulu", tone: "amber", iconBg: "bg-amber-50", iconColor: "text-amber-600", labelColor: "text-amber-600" },
  sisihkan: { label: "Sisihkan", tone: "rose", iconBg: "bg-rose-50", iconColor: "text-rose-600", labelColor: "text-rose-600" },
  perlu_data: { label: "Perlu data tambahan", tone: "zinc", iconBg: "bg-zinc-100", iconColor: "text-zinc-500", labelColor: "text-zinc-500" },
};

// X mendominasi c: semua dimensi ≥, minimal satu >, dan total lebih tinggi (butuh dim non-null).
function dominates(x: VerdictInput, c: VerdictInput): boolean {
  const dims: (keyof VerdictInput)[] = ["score_harga", "score_lokasi", "score_fasilitas"];
  let strictlyBetter = false;
  for (const d of dims) {
    const xv = x[d] as number | null;
    const cv = c[d] as number | null;
    if (xv == null || cv == null) return false;
    if (xv < cv) return false;
    if (xv > cv) strictlyBetter = true;
  }
  return strictlyBetter && (x.score_total ?? -1) > (c.score_total ?? -1);
}

export function deriveVerdict(c: VerdictInput, allActive: VerdictInput[]): Verdict {
  if (c.score_total == null || c.distanceKm == null) {
    return { kind: "perlu_data", label: VERDICT_META.perlu_data.label, reason: "Jarak/skor belum lengkap — skor belum valid." };
  }
  // Caveat coverage: dimensi listing yang masih bolong (lokasi sudah dijamin ada di atas).
  // Skor dihitung dari dimensi yang diketahui saja → tandai agar skor tak terbaca sepasti yang berdata penuh.
  const missing: string[] = [];
  if (c.score_harga == null) missing.push("harga");
  if (c.score_fasilitas == null) missing.push("fasilitas");
  const dataCaveat = missing.length ? ` Data ${missing.join(" & ")} belum ada — skor dari dimensi yang diketahui saja.` : "";

  if (c.flagCount > 0) {
    return {
      kind: "cek_db",
      label: VERDICT_META.cek_db.label,
      reason: `Skor bagus, tapi ada ${c.flagCount} deal breaker aktif — konfirmasi dulu.${dataCaveat}`,
    };
  }
  const dominator = allActive.find((x) => x.id !== c.id && dominates(x, c));
  if (dominator) {
    return { kind: "sisihkan", label: VERDICT_META.sisihkan.label, reason: `Didominasi ${dominator.title} di semua aspek.` };
  }
  const facts: string[] = [];
  if ((c.score_harga ?? 0) >= 80) facts.push("harga ideal");
  if ((c.score_lokasi ?? 0) >= 70) facts.push("lokasi dekat");
  facts.push("deal breaker clear");
  const reason = facts.slice(0, 3).join(", ");
  return {
    kind: "pertahankan",
    label: VERDICT_META.pertahankan.label,
    reason: reason.charAt(0).toUpperCase() + reason.slice(1) + "." + dataCaveat,
  };
}
