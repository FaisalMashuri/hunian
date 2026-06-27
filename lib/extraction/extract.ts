import "server-only";
import OpenAI from "openai";
import { PERIODE_VALUES, PERIODE_TO_MONTHS, type Periode } from "@/lib/constants/periode";
import { FURNISHED_STATUSES, PROPERTY_TYPES, type FurnishedStatus, type PropertyType } from "@/lib/types/db";
import type { ExtractedDraft, ExtractionResult } from "./types";

const SYSTEM = `Kamu mesin ekstraksi data properti sewa Indonesia. Jenis bisa Kontrakan/Rumah, Apartemen, atau Kost. Ubah teks listing bebas (gaya WhatsApp/OLX/Mamikos, sering berantakan) menjadi JSON.
ATURAN KERAS:
- Kembalikan HANYA objek JSON, tanpa penjelasan, tanpa markdown.
- Info yang TIDAK ADA di teks -> null. JANGAN menebak.
- property_type: klasifikasikan jenis properti -> "kontrakan" | "apartemen" | "kost".
  • "apartemen": menyebut apartemen/apartment/unit di tower/lantai ke-N/studio/1BR/2BR/3BR.
  • "kost": menyebut kos/kost/indekos/kamar kos/kosan, atau khusus putra/putri.
  • selain itu (rumah/kontrakan/disewakan rumah/ruko) -> "kontrakan". Bila ragu, pilih "kontrakan".
- Angka uang: gunakan Rupiah penuh sebagai integer. Titik = pemisah ribuan: "43.000.000" -> 43000000, "3,5jt" -> 3500000, "850rb" -> 850000.
- harga_sewa = ANGKA harga APA ADANYA sesuai tertulis (Rupiah penuh) — JANGAN dikali/dibagi sendiri, sistem yang menghitung per-bulan.
- periode_asli = SATUAN yang MENEMPEL pada angka harga: "/bln"/"per bulan" -> "bulan"; "/3 bulan"/"per 3 bln"/"per triwulan" -> "3bulan"; "/6 bulan"/"/6bln"/"per semester" -> "6bulan"; "/thn"/"/tahun"/"per tahun" -> "tahun"; (atau null). CONTOH: "43.000.000/tahun" -> harga_sewa=43000000, periode_asli="tahun"; "46 juta/6 bulan" -> harga_sewa=46000000, periode_asli="6bulan"; "30jt/3 bulan" -> harga_sewa=30000000, periode_asli="3bulan". Bila harga tak menyebut satuan sama sekali, default periode_asli="bulan".
- minimum_sewa_bulan = lama KOMITMEN MINIMUM sewa dalam BULAN, HANYA bila teks menyebut "minimum/min/minimal sewa" atau "kontrak minimal" ("6 bulan"->6, "1 tahun"->12, "minimal 3 bln"->3); null bila tak disebut. Ini BUKAN periode_asli (jangan ubah periode_asli karenanya) — periode_asli tetap satuan harga. Tetap sebut juga di deskripsi. CONTOH: "4,2 jt/bln minimum sewa 6 bulan" -> harga_sewa=4200000, periode_asli="bulan", minimum_sewa_bulan=6 (sistem yang melipat). CONTOH (harga sudah per-periode, tetap tulis minimum bila ada): "46 juta/6 bulan, min 6 bln" -> harga_sewa=46000000, periode_asli="6bulan", minimum_sewa_bulan=6.
- deposit: nominal Rupiah penuh bila disebut nominal; bila "N bulan", null saja (sistem hitung terpisah).
- furnished: "full furnished"->"furnished"; "semi"->"semi"; "kosongan"/"unfurnished"/"belum furnish"->"unfurnished"; tak disebut->null.
- carport: true jika ada carport/garasi/parkir mobil. dapur: true jika ada dapur atau boleh masak. (Untuk apartemen/kost sering null.)
- alamat: lokasi properti se-SPESIFIK yang tertulis. TIDAK harus ada nomor jalan — area/kelurahan/kecamatan/kota/landmark sudah cukup. Contoh valid: "Mampang, Jakarta Selatan", "Jatibening, Bekasi", "Cibubur, Jaktim". Untuk apartemen, gabungkan nama gedung + area bila ada (mis. "Apartemen Nine Residence, Mampang, Jakarta Selatan"). JANGAN pakai patokan jarak ("10 menit ke Kuningan") sebagai alamat — itu masuk deskripsi. Null hanya bila benar-benar tak ada petunjuk lokasi.
- kamar_tidur/kamar_mandi/luas_bangunan_m2: jumlah kamar/luas bila disebut. Kost umumnya 1 kamar; null bila tak jelas.
- title: nama/label properti. Untuk apartemen pakai NAMA GEDUNG-nya (mis. "Apartemen Nine Residence"); untuk kost pakai NAMA KOST-nya (mis. "Kost Putri Tebet"); untuk kontrakan label singkat (mis. "Kontrakan Koja 2KT"). Null jika benar-benar tak ada.
- deskripsi: rangkum info KUALITATIF/tambahan yang tak masuk field lain — mis. bebas banjir, akses jalan, lingkungan, plus/minus ("Minus: ..."). Ringkas, apa adanya dari teks. Null bila tak ada.
- FIELD KHUSUS — isi HANYA yang relevan dengan property_type, sisanya null:
  • Apartemen: lantai (angka), tower, nomor_unit, tipe_unit ("Studio"|"1BR"|"2BR"|"3BR"), ipl (iuran/service charge, Rupiah penuh).
  • Kost: km_posisi ("Di Dalam"|"Di Luar"), tipe_penghuni ("Putra"|"Putri"|"Campur"), jam_malam (mis. "Pukul 22.00").`;

function buildUser(text: string) {
  return `Ekstrak teks berikut ke JSON dengan key PERSIS ini: property_type, title, harga_sewa, periode_asli, minimum_sewa_bulan, deposit, kamar_tidur, kamar_mandi, luas_bangunan_m2, furnished, carport, dapur, alamat, kontak_owner, deskripsi, lantai, tower, nomor_unit, tipe_unit, ipl, km_posisi, tipe_penghuni, jam_malam. Isi null bila tidak diketahui.

TEKS LISTING:
"""
${text}
"""`;
}

// Angka umum (kamar, luas) — boleh desimal.
const num = (v: unknown): number | null => {
  if (typeof v === "number") return isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v.replace(/[^\d.,-]/g, "").replace(",", "."));
    return isFinite(n) ? n : null;
  }
  return null;
};
// Uang — integer Rupiah; titik/koma/spasi/"Rp" diabaikan sebagai pemisah.
const money = (v: unknown): number | null => {
  if (typeof v === "number") return isFinite(v) ? Math.round(v) : null;
  if (typeof v === "string") {
    const d = v.replace(/[^\d]/g, "");
    return d ? Number(d) : null;
  }
  return null;
};
const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
const bool = (v: unknown): boolean | null => (typeof v === "boolean" ? v : null);

export async function extractListing(text: string): Promise<ExtractionResult> {
  const client = new OpenAI();
  const res = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: buildUser(text) },
    ],
  });

  const raw = JSON.parse(res.choices[0]?.message?.content ?? "{}") as Record<string, unknown>;

  const periodeStr = str(raw.periode_asli)?.toLowerCase() ?? null;
  const periode: Periode | null =
    periodeStr && (PERIODE_VALUES as readonly string[]).includes(periodeStr)
      ? (periodeStr as Periode)
      : null;

  // Harga + periode DI KODE (deterministik) — bukan diandalkan ke model.
  // Dua kasus: (a) harga sudah per-periode ("46jt/6 bulan") → pakai apa adanya;
  // (b) harga per-BULAN + "minimum sewa N bulan" → lipat: harga_asli = perBulan × N, periode = N-bulan.
  const hargaRaw = money(raw.harga_sewa);
  // Minimum sewa → periode resmi (hanya yang punya padanan periode).
  const MIN_TO_PERIODE: Record<number, Periode> = { 1: "bulan", 3: "3bulan", 6: "6bulan", 12: "tahun" };
  const minRaw = num(raw.minimum_sewa_bulan);
  const minMonths = minRaw != null && minRaw > 0 ? Math.round(minRaw) : null;

  let hargaAsli = hargaRaw;
  let periodeFinal = periode;
  if (hargaRaw != null && minMonths != null && MIN_TO_PERIODE[minMonths]) {
    const curMonths = periode ? PERIODE_TO_MONTHS[periode] : 1; // anggap per-bulan bila satuan tak disebut
    // Lipat hanya bila komitmen minimum lebih panjang dari satuan harga
    // (guard mencegah dobel-kali saat harga sudah ditulis sebagai total periode).
    if (minMonths > curMonths) {
      const perBulan = Math.round(hargaRaw / curMonths);
      periodeFinal = MIN_TO_PERIODE[minMonths];
      hargaAsli = perBulan * minMonths;
    }
  }
  const hargaBulanan =
    hargaAsli != null && periodeFinal ? Math.round(hargaAsli / PERIODE_TO_MONTHS[periodeFinal]) : hargaAsli;

  const furnishedStr = str(raw.furnished)?.toLowerCase() ?? null;

  const ptStr = str(raw.property_type)?.toLowerCase() ?? null;
  const propertyType: PropertyType =
    ptStr && (PROPERTY_TYPES as readonly string[]).includes(ptStr) ? (ptStr as PropertyType) : "kontrakan";

  const draft: ExtractedDraft = {
    title: str(raw.title),
    harga_asli: hargaAsli,
    harga_sewa_bulanan: hargaBulanan,
    periode_asli: periodeFinal,
    deposit: money(raw.deposit),
    kamar_tidur: num(raw.kamar_tidur),
    kamar_mandi: num(raw.kamar_mandi),
    luas_bangunan_m2: num(raw.luas_bangunan_m2),
    furnished:
      furnishedStr && (FURNISHED_STATUSES as readonly string[]).includes(furnishedStr)
        ? (furnishedStr as FurnishedStatus)
        : null,
    carport: bool(raw.carport),
    dapur: bool(raw.dapur),
    alamat: str(raw.alamat),
    kontak_owner: str(raw.kontak_owner),
    deskripsi: str(raw.deskripsi),
  };

  // Field khusus (apartemen/kost) dikembalikan mentah; app yang memetakan & menormalkan
  // ke type_specific_data (lihat coerceTypeData) agar konfigurasi field tetap single-source.
  return { draft, propertyType, raw };
}
