// Tipe bersama untuk Maps view (server loader → client map).

export type MapItem = {
  id: string;
  title: string;
  propertyType: string;
  lat: number;
  lng: number;
  score: number | null;
  scoreHarga: number | null;
  scoreLokasi: number | null;
  scoreFasilitas: number | null;
  perBulan: number | null;
  periode: string | null;
  alamat: string | null;
  distanceKm: number | null;
  durationMin: number | null;
  flagCount: number; // jumlah deal breaker yang dilanggar (0 = aman)
  photoUrl: string | null;
  sharedBy: string | null;
  logic: string; // "Worth It Logic" — alasan verdict rule-based
  route: { lat: number; lng: number }[] | null; // rute tersimpan hunian→kantor (decoded polyline)
};

export type Office = { lat: number; lng: number; label: string };
