import type { TransportMode } from "@/lib/types/db";

// Opsi onboarding — dipakai onboarding & edit preferensi (Pengaturan).

export const BUDGET_MIN = 1_500_000;
export const BUDGET_MAX = 8_000_000;
export const BUDGET_STEP = 100_000;

export const TRANSPORTS: { id: TransportMode; icon: string; label: string }[] = [
  { id: "motor", icon: "🏍️", label: "Motor" },
  { id: "mobil", icon: "🚗", label: "Mobil" },
  { id: "transit", icon: "🚌", label: "Transportasi umum" },
  { id: "jalan_kaki_sepeda", icon: "🚶", label: "Jalan / sepeda" },
];

export const PRIORITIES = [
  { id: "harga", label: "Harga terjangkau", desc: "Sewa di dalam zona budgetmu" },
  { id: "lokasi", label: "Dekat tujuan", desc: "Jarak ke lokasi utama sehari-hari" },
  { id: "fasilitas", label: "Fasilitas lengkap", desc: "Furnitur, parkir, dapur, dll" },
  // Slice 2: dimensi dari survei fisik (skor terisi setelah kandidat disurvey).
  { id: "kondisi", label: "Kondisi & lingkungan", desc: "Kebersihan, kebisingan, keamanan, bangunan — dari survei" },
  { id: "owner", label: "Owner responsif", desc: "Pemilik mudah dihubungi & fleksibel — dari survei" },
];

export const DEAL_BREAKERS = [
  { id: "no_parkir_motor", label: "Tidak ada parkir motor" },
  { id: "km_di_luar", label: "Kamar mandi di luar" },
  { id: "no_memasak", label: "Tidak boleh masak" },
  { id: "bayar_setahun_dimuka", label: "Bayar tahunan di muka" },
  { id: "no_dapur", label: "Tidak ada dapur" },
  { id: "lantai_3_tanpa_lift", label: "Lantai >3 tanpa lift" },
  { id: "no_pasutri", label: "Tidak boleh pasutri" },
];

export function toggle<T>(arr: T[], id: T): T[] {
  return arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];
}

// Bobot 5 dimensi (Slice 2) dari prioritas (FR-ON-3, FR-SC-1). Dimensi terpilih 2x, dinormalisasi.
// kondisi/owner = dimensi survei (skor terisi setelah survey); bobotnya tetap dihitung di sini
// agar "bobot = pilihan user" (G1=A). Kolom DB: weight_keamanan(←kondisi), weight_owner(←owner).
export function computeWeights(priorities: string[]) {
  const dims = ["harga", "lokasi", "fasilitas", "kondisi", "owner"] as const;
  const sel = new Set(priorities);
  const raw = dims.map((d) => (sel.has(d) ? 2 : 1));
  const sum = raw.reduce((a, b) => a + b, 0);
  const [harga, lokasi, fasilitas, kondisi, owner] = raw.map((r) => Math.round((r / sum) * 100) / 100);
  return { harga, lokasi, fasilitas, kondisi, owner };
}
