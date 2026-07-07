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

// Emoji per aspek — dipakai onboarding, pengaturan, sidebar (single source).
export const PRIO_EMOJI: Record<string, string> = { harga: "💰", lokasi: "📍", fasilitas: "🛋️", kondisi: "🛡️", owner: "👤" };
export const PRIO_LABEL: Record<string, string> = Object.fromEntries(PRIORITIES.map((p) => [p.id, p.label]));

// Urutan default 5 aspek (dipakai sebagai ranking awal & pengisi id yang belum diurutkan).
export const ALL_PRIORITY_IDS = ["harga", "lokasi", "fasilitas", "kondisi", "owner"] as const;
// Bobot per posisi ranking (posisi 1..5). Jumlah = 1.00 pas. Matematika ini disembunyikan dari user.
export const RANK_WEIGHTS = [0.3, 0.25, 0.2, 0.15, 0.1];

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

// Jadikan input (bisa subset / kosong / urutan lama) menjadi ranking penuh 5 aspek:
// id valid yang diberikan (urut, tanpa duplikat) lalu sisanya menyusul dengan urutan default.
// Kompatibel mundur: priority_selection lama (subset "terpilih") jadi peringkat teratas.
export function normalizeRanking(list: string[] | null | undefined): string[] {
  const valid = new Set(ALL_PRIORITY_IDS as readonly string[]);
  const seen = new Set<string>();
  const ranked: string[] = [];
  for (const id of list ?? []) {
    if (valid.has(id) && !seen.has(id)) { ranked.push(id); seen.add(id); }
  }
  for (const id of ALL_PRIORITY_IDS) if (!seen.has(id)) ranked.push(id);
  return ranked;
}

// Geser satu aspek naik (-1) / turun (+1) dalam ranking.
export function moveRank(list: string[], id: string, dir: -1 | 1): string[] {
  const r = normalizeRanking(list);
  const i = r.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= r.length) return r;
  const next = [...r];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

// Bobot 5 dimensi (Slice 2) dari RANKING (FR-ON-3, FR-SC-1): weight[aspek] = RANK_WEIGHTS[posisi].
// kondisi/owner = dimensi survei (skor terisi setelah survey); bobotnya tetap dihitung agar
// "bobot = pilihan user" (G1=A). Kolom DB: weight_keamanan(←kondisi), weight_owner(←owner).
export function computeWeights(priorities: string[]) {
  const ranked = normalizeRanking(priorities);
  const w = (id: string) => RANK_WEIGHTS[ranked.indexOf(id)] ?? 0;
  return { harga: w("harga"), lokasi: w("lokasi"), fasilitas: w("fasilitas"), kondisi: w("kondisi"), owner: w("owner") };
}

// Kalimat feedback bahasa manusia — konsekuensi ranking langsung terlihat.
export function rankingSentence(list: string[]): string {
  const r = normalizeRanking(list);
  const top = PRIO_LABEL[r[0]]?.toLowerCase() ?? r[0];
  const bottom = PRIO_LABEL[r[r.length - 1]]?.toLowerCase() ?? r[r.length - 1];
  return `Buat kamu, ${top} paling menentukan, dan ${bottom} paling tidak berpengaruh.`;
}
