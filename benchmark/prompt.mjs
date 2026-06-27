import { FIELDS } from './schema.mjs';

// Prompt ekstraksi bersama untuk semua model AI. Dibangun dari schema agar selalu sinkron.

function fieldSpecText() {
  return FIELDS.map((f) => {
    let t = f.type;
    if (f.type === 'enum') t = `enum salah satu dari ${JSON.stringify(f.values)}`;
    if (f.type === 'phone') t = 'string (nomor telepon)';
    if (f.type === 'int') t = 'integer';
    return `  "${f.key}": ${t}  // ${f.label}`;
  }).join('\n');
}

export const SYSTEM_PROMPT = `Kamu mesin ekstraksi data properti sewa Indonesia. Tugasmu mengubah teks listing bebas (gaya WhatsApp/OLX/Mamikos, sering berantakan) menjadi JSON terstruktur.

ATURAN KERAS:
- Kembalikan HANYA satu objek JSON, tanpa penjelasan, tanpa markdown.
- Jika sebuah info TIDAK ADA di teks, isi null. JANGAN menebak. Lebih baik null daripada salah.
- Normalisasi angka uang ke Rupiah penuh: "3,5jt" / "3,5 juta" -> 3500000, "850rb" / "850 ribu" -> 850000, "Rp 1.200.000" -> 1200000.
- "harga_sewa_bulanan" HARUS per bulan. Jika listing per tahun, bagi 12; per 3 bulan, bagi 3; per 6 bulan, bagi 6. Bulatkan ke rupiah terdekat. Catat periode asli di "periode_asli".
- Deposit: jika dinyatakan "deposit/DP N bulan", hitung N * harga per bulan. Jika nominal langsung, pakai nominalnya.
- "kamar_tidur"/"kamar_mandi": baca pola seperti "2KT 1KM", "2 kamar tidur", "3BR". Kamar mandi "dalam" tetap dihitung jumlahnya (default 1 jika disebut ada tapi tak ada angka).
- furnished: "full furnished" -> "furnished"; "semi furnished" -> "semi"; "kosongan"/"unfurnished"/"belum furnish" -> "unfurnished"; tak disebut -> null.
- carport: true jika ada carport/garasi/parkir mobil; dapur: true jika ada dapur atau boleh masak.
- kontak_owner: ambil nomor telepon/WA apa adanya.`;

export function buildUserPrompt(listingText) {
  return `Ekstrak teks berikut ke JSON dengan struktur PERSIS ini (urutan & key sama, isi null jika tak diketahui):

{
${fieldSpecText()}
}

TEKS LISTING:
"""
${listingText}
"""`;
}
