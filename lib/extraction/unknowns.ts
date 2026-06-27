// Daftar field penting yang BELUM diketahui dari sebuah kandidat — untuk transparansi
// ("tampilkan yang diketahui, tandai yang belum"). Dipakai detail page & kartu dashboard.

export type UnknownFields = {
  kamar_tidur?: number | null;
  kamar_mandi?: number | null;
  furnished?: string | null;
  carport?: boolean | null;
  dapur?: boolean | null;
  luas_bangunan_m2?: number | null;
  deposit?: number | null;
};

export function listUnknowns(c: UnknownFields, distanceKm: number | null): string[] {
  const out: string[] = [];
  if (c.kamar_tidur == null) out.push("jumlah kamar tidur");
  if (c.kamar_mandi == null) out.push("jumlah kamar mandi");
  if (c.furnished == null) out.push("status furnitur");
  if (c.carport == null) out.push("ketersediaan carport");
  if (c.dapur == null) out.push("ketersediaan dapur");
  if (c.luas_bangunan_m2 == null) out.push("luas bangunan");
  if (distanceKm == null) out.push("jarak ke tujuan");
  if (c.deposit == null) out.push("deposit");
  return out;
}
