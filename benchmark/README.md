# Extraction Benchmark — Gate GO/NO-GO

Mengukur seberapa akurat AI mengubah teks listing bebas (gaya WA broker) menjadi field terstruktur form Kontrakan. Ini **gate paling berisiko di MVP**: kalau akurasi rendah, premis "user memverifikasi, bukan mengetik dari nol" runtuh.

**Target tim: overall accuracy > 85%** sebelum lanjut membangun Slice 2.

Harness ini menguji 3 extractor di dataset yang sama:
- `openai` — GPT-4o mini (keputusan stack tim)
- `anthropic` — Claude Haiku 4.5 (pembanding)
- `rule` — regex murni tanpa AI (baseline/lantai; menunjukkan lift yang diberi AI)

---

## 1. Setup

```bash
cd benchmark
npm install
cp .env.example .env      # lalu isi OPENAI_API_KEY (dan ANTHROPIC_API_KEY kalau mau banding)
```

> Catatan keamanan: aku (Claude) tidak memasukkan API key. Isi sendiri di `.env` — file itu sudah di-gitignore.

## 2. Isi dataset (ini bagian kerjamu)

Edit `dataset.json`. Sudah ada **3 contoh** sebagai pola. Tambahkan **≥17 teks broker WA nyata** (total 20+) supaya angkanya bermakna. Tiap entri:

```json
{
  "id": "label-bebas",
  "text": "tempel teks listing apa adanya di sini (boleh ada emoji, typo, baris baru)",
  "gold": {
    "harga_sewa_bulanan": 3500000,   // SUDAH per bulan (kalau listing per tahun, bagi 12)
    "periode_asli": "bulan",          // bulan | 3bulan | 6bulan | tahun
    "deposit": 7000000,               // null kalau tak disebut
    "kamar_tidur": 2,
    "kamar_mandi": 1,
    "luas_bangunan_m2": null,
    "furnished": null,                // furnished | semi | unfurnished | null
    "carport": true,                  // true | false | null
    "dapur": true,
    "alamat": "Jatibening Bekasi",
    "kontak_owner": "081234567890"
  }
}
```

**Aturan label `gold` (penting supaya skor jujur):**
- Isi `null` kalau info memang tidak ada di teks. Jangan diisi tebakan — model juga diminta `null` untuk yang tak diketahui, dan keduanya `null` dihitung benar.
- `harga_sewa_bulanan` selalu per bulan. Periode asli dicatat terpisah di `periode_asli`.
- Deposit "N bulan" → isi nominalnya (N × harga per bulan).

## 3. Jalankan

```bash
npm run bench            # ketiga extractor sekaligus, tabel perbandingan
npm run bench:openai     # GPT-4o mini saja
npm run bench:anthropic  # Claude Haiku saja
npm run bench:rule       # baseline, tanpa API key

# threshold / dataset custom:
node run.mjs --model openai --threshold 0.9 --dataset dataset.json
```

## 4. Baca hasilnya

- Tabel **akurasi per field** — kolom = extractor. Baris bertanda `*` = field kritikal (harga, KT, KM, deposit, furnished); ini yang paling menentukan value.
- **OVERALL** = micro-average semua field. Ini angka utama untuk GO/NO-GO 85%.
- **CRITICAL** = micro-average field bertanda `*` saja. Kalau overall lulus tapi critical jeblok, hati-hati.
- Baris **GO/NO-GO** memberi verdict per extractor terhadap threshold.
- Detail per-listing tersimpan di `results/*.json` — pakai untuk menemukan listing mana yang sering bikin model salah, lalu perbaiki prompt (`prompt.mjs`) atau pre-processing.

## Kalau hasilnya NO-GO (< 85%)

Urutan termurah dulu:
1. Lihat `results/*.json`, cari pola error (field apa, listing seperti apa).
2. Perbaiki `prompt.mjs` (aturan normalisasi yang kurang jelas) — iterasi cepat, gratis.
3. Tambah pre-processing lokal sebelum kirim ke model.
4. Baru pertimbangkan model lain (Haiku sudah jadi kolom pembanding di sini).

## Struktur

```
benchmark/
  schema.mjs            field + tipe + comparator (sumber kebenaran)
  prompt.mjs            prompt ekstraksi bersama (dibangun dari schema)
  extractors/
    openai.mjs          GPT-4o mini
    anthropic.mjs       Claude Haiku 4.5
    ruleBased.mjs       baseline regex
  score.mjs             logika skor per tipe field
  run.mjs               CLI: jalankan + tabel + GO/NO-GO + simpan hasil
  dataset.json          ← kamu isi di sini (3 contoh sudah ada)
  results/              output (gitignored)
```
