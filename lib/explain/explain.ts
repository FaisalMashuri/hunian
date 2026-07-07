import "server-only";
import OpenAI from "openai";

// AI MENJELASKAN hunian secara MENYELURUH (bukan cuma skor). Skor per aspek SUDAH dihitung
// rule-based — AI tidak menghitung ulang / mengubah angka (FR-SC-3). AI mempertimbangkan SEMUA
// data yang ditampilkan di halaman detail: harga & biaya all-in, lokasi & jarak, lingkungan
// sekitar (POI "dekat apa saja"), fasilitas fisik, hasil survei, deal breaker, data yang belum ada.
export type ExplainInput = {
  title: string;
  propertyType: string;
  area: string | null;

  // Harga & biaya
  hargaAwal: number | null;
  hargaEfektif: number | null;
  deposit: number | null;
  periode: string | null;
  biayaListrik: number | null;
  biayaAir: number | null;
  biayaIpl: number | null;
  allInTotal: number | null;
  budgetIdeal: number | null;
  budgetMax: number | null;
  budgetZone: string | null;

  // Skor (rule-based, referensi saja)
  scoreTotal: number | null;
  scoreHarga: number | null;
  scoreLokasi: number | null;
  scoreFasilitas: number | null;
  scoreKondisi: number | null;
  scoreOwner: number | null;

  // Fisik
  kamarTidur: number | null;
  kamarMandi: number | null;
  luas: number | null;
  furnished: string | null;
  carport: boolean | null;
  dapur: boolean | null;
  typeSpecific: Record<string, unknown> | null;

  // Lokasi / commute
  distanceKm: number | null;
  durationMin: number | null;
  transportMode: string | null;

  // Lingkungan sekitar (POI OpenStreetMap)
  poiTotal: number | null;
  nearby: string[]; // "dekat apa saja" — mis. "Stasiun MRT X ~0.6 km"

  // Survei lapangan (bila sudah)
  surveyed: boolean;
  surveyRatings: Record<string, number | null> | null;
  surveyTags: string[];
  surveyNote: string | null;

  // Risiko / gap
  dealBreakers: string[];
  unknowns: string[];
};

const SYS = `Kamu penasihat hunian sewa yang membantu calon penyewa MEMAHAMI sebuah hunian secara menyeluruh sebelum memutuskan. Skor tiap aspek SUDAH dihitung sistem rule-based — JANGAN menghitung ulang atau mengubah angka; pakai hanya sebagai konteks.

Pertimbangkan SEMUA data yang diberikan, bukan cuma skor:
- Harga & biaya all-in (listrik/air/IPL, deposit) dibanding budget.
- Lokasi: jarak & waktu ke tujuan.
- LINGKUNGAN SEKITAR: apa saja yang dekat (transportasi, belanja, kesehatan, sekolah, ibadah, kuliner) — sebutkan yang relevan dari data "nearby".
- Fasilitas fisik: kamar, luas, furnished, carport, dapur (dan data tipe khusus apartemen/kost bila ada).
- Hasil survei lapangan bila ada: kebersihan, kebisingan, keamanan, kondisi bangunan, owner, plus catatan/tag.
- Deal breaker aktif & data yang masih belum diketahui.

Gaya: Bahasa Indonesia, seperti teman yang jujur dan seimbang. 5-8 kalimat, mengalir (boleh 2 paragraf pendek), TANPA heading kaku.
Isi yang harus ada:
1) Kelebihan utama (mis. harga, lokasi, atau lingkungan).
2) Trade-off / yang perlu diperhatikan (mis. jauh dari X, biaya listrik tinggi, kebisingan dari survei).
3) Satu kalimat tentang lingkungan sekitar ("dekat apa saja") bila datanya ada.
4) Bila ada deal breaker aktif atau data penting yang belum diketahui, tutup dengan kalimat diawali "Perlu dicek:".
Jangan mengarang fakta di luar data. Jangan menyuruh mengambil keputusan — penyewa yang memutuskan.`;

export async function explainCandidate(input: ExplainInput): Promise<string> {
  const client = new OpenAI();
  const res = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.4,
    messages: [
      { role: "system", content: SYS },
      { role: "user", content: `Data hunian lengkap (JSON):\n${JSON.stringify(input)}\n\nBeri penjelasan menyeluruh yang mempertimbangkan semua data di atas.` },
    ],
  });
  return res.choices[0]?.message?.content?.trim() ?? "Penjelasan tidak tersedia.";
}
