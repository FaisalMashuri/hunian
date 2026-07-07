// "Worth It" tier — pemetaan skor total (0-100) → label + warna untuk Maps view.
// Selaras legenda desain: 90+ Excellent, 80-89 Strong, 70-79 Fair. <70 = nilai rendah.
// Skor tetap rule-based (dari engine); ini hanya presentasi.

export type WorthTier = "excellent" | "strong" | "fair" | "low" | "none";

export type WorthMeta = { tier: WorthTier; label: string; color: string; pillBg: string; pillText: string };

const META: Record<WorthTier, Omit<WorthMeta, "tier">> = {
  excellent: { label: "Worth It Pick", color: "#059669", pillBg: "#059669", pillText: "#ffffff" },
  strong: { label: "Strong Value", color: "#0f766e", pillBg: "#0f766e", pillText: "#ffffff" },
  fair: { label: "Fair Value", color: "#d97706", pillBg: "#d97706", pillText: "#ffffff" },
  low: { label: "Nilai Rendah", color: "#e11d48", pillBg: "#e11d48", pillText: "#ffffff" },
  none: { label: "Perlu Data", color: "#a1a1aa", pillBg: "#e4e4e7", pillText: "#52525b" },
};

export function worthTier(score: number | null): WorthTier {
  if (score == null) return "none";
  if (score >= 90) return "excellent";
  if (score >= 80) return "strong";
  if (score >= 70) return "fair";
  return "low";
}

export function worthMeta(score: number | null): WorthMeta {
  const tier = worthTier(score);
  return { tier, ...META[tier] };
}
