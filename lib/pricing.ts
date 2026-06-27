import { PERIODE_TO_MONTHS, type Periode } from "@/lib/constants/periode";

// SSoT logika harga multi-skema. Periode SELALU dari lib/constants/periode.ts (jangan redefinisi).

export type PriceBasis = "per_bulan" | "total";

export type PriceScheme = {
  periode: Periode;
  harga: number;
  basis: PriceBasis; // 'per_bulan' = harga sudah per bulan; 'total' = total utk periode -> dibagi
  basis_confirmed: boolean; // user wajib konfirmasi sebelum save (Q2)
};

// Per-bulan dari satu skema: total dibagi jumlah bulan, atau apa adanya bila sudah per bulan.
export function perMonthOf(s: Pick<PriceScheme, "periode" | "harga" | "basis">): number {
  return s.basis === "total" ? Math.round(s.harga / PERIODE_TO_MONTHS[s.periode]) : s.harga;
}

// Skema dengan per-bulan TERMURAH = default terpilih (komitmen terbaik).
export function defaultScheme(schemes: PriceScheme[]): PriceScheme | null {
  if (schemes.length === 0) return null;
  return schemes.reduce((best, s) => (perMonthOf(s) < perMonthOf(best) ? s : best));
}

const PERIODE_LABEL: Record<Periode, string> = {
  bulan: "bulanan",
  "3bulan": "per 3 bulan",
  "6bulan": "per 6 bulan",
  tahun: "tahunan",
};

// < 1 juta -> "ribu" (700000 -> "Rp 700 ribu"); >= 1 juta -> "jt".
export const rpShort = (n: number) =>
  n < 1_000_000
    ? "Rp " + Math.round(n / 1000) + " ribu"
    : "Rp " + (n / 1_000_000).toFixed(1).replace(".0", "") + " jt";

// Zona budget — selaras ambang scoreHarga (lib/scoring/score.ts). Dipakai pill di dashboard & detail.
// comfort: jauh di bawah ideal · ideal: <= ideal · stretch: ideal..max · over: > max.
export type BudgetZone = "comfort" | "ideal" | "stretch" | "over";

export function budgetZone(
  perBulan: number | null,
  ideal: number | null,
  max: number | null,
): BudgetZone | null {
  if (perBulan == null || ideal == null) return null;
  if (perBulan <= ideal * 0.85) return "comfort";
  if (perBulan <= ideal) return "ideal";
  const ceil = max ?? ideal * 1.25;
  if (perBulan <= ceil) return "stretch";
  return "over";
}

export const BUDGET_ZONE_META: Record<
  BudgetZone,
  { label: string; pill: string; dot: string }
> = {
  comfort: { label: "Hemat", pill: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  ideal: { label: "Zona ideal", pill: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  stretch: { label: "Agak menekan", pill: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  over: { label: "Di atas maks", pill: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500" },
};

export const PERIODE_SUFFIX: Record<Periode, string> = {
  bulan: "/bln",
  "3bulan": "/3 bln",
  "6bulan": "/6 bln",
  tahun: "/thn",
};

// Harga sesuai listing (asli) = per-bulan × jumlah bulan periode (rekonstruksi).
export function asliFromPerBulan(perBulan: number, periode: Periode | null): number {
  return periode && periode !== "bulan" ? perBulan * PERIODE_TO_MONTHS[periode] : perBulan;
}

// Tampilan harga sesuai listing, format "jt" (menyembunyikan drift rekonstruksi).
// Contoh: 3.583.333/bln + "tahun" -> "Rp 43 jt/thn".
export function formatHargaListing(perBulan: number | null, periode: Periode | null): string {
  if (perBulan == null) return "—";
  return rpShort(asliFromPerBulan(perBulan, periode)) + (periode ? PERIODE_SUFFIX[periode] : "/bln");
}

// Label komitmen — WAJIB ditampilkan bersama angka per-bulan (Rilis 2), agar tak menyesatkan.
// Contoh: "Rp1.5 jt/bln · bayar Rp18 jt tahunan di muka".
export function formatKomitmen(s: PriceScheme): string {
  const perBulan = perMonthOf(s);
  if (s.basis === "per_bulan" || s.periode === "bulan") {
    return `${rpShort(perBulan)}/bln (skema ${PERIODE_LABEL[s.periode]})`;
  }
  return `${rpShort(perBulan)}/bln · bayar ${rpShort(s.harga)} ${PERIODE_LABEL[s.periode]} di muka`;
}
