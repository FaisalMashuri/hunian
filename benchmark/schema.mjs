// Skema field ekstraksi untuk form Kontrakan (turunan dari next-feature/mvp.md).
// Tiap field punya `type` yang menentukan cara normalisasi + cara skor.
//
// type:
//   number  — angka Rupiah / luas. Dibandingkan exact setelah normalisasi.
//   int     — bilangan bulat (jumlah kamar).
//   enum    — salah satu dari `values` (case-insensitive).
//   bool    — true/false/null.
//   phone   — nomor kontak; dibandingkan setelah ambil digit saja.
//   text    — string bebas (alamat); benar jika sama persis ATAU token Jaccard >= 0.5.
//
// Nilai `null` berarti "tidak diketahui dari teks". Model WAJIB mengembalikan null,
// bukan menebak. Gold label juga pakai null untuk info yang memang tidak ada.

export const FIELDS = [
  { key: 'harga_sewa_bulanan', type: 'number', label: 'Harga sewa per bulan (Rp, sudah dikonversi)' },
  { key: 'periode_asli',       type: 'enum',   values: ['bulan', '3bulan', '6bulan', 'tahun'], label: 'Periode harga di listing' },
  { key: 'deposit',            type: 'number', label: 'Deposit (Rp)' },
  { key: 'kamar_tidur',        type: 'int',    label: 'Jumlah kamar tidur' },
  { key: 'kamar_mandi',        type: 'int',    label: 'Jumlah kamar mandi' },
  { key: 'luas_bangunan_m2',   type: 'number', label: 'Luas bangunan (m2)' },
  { key: 'furnished',          type: 'enum',   values: ['furnished', 'semi', 'unfurnished'], label: 'Status furnitur' },
  { key: 'carport',            type: 'bool',   label: 'Ada carport/garasi' },
  { key: 'dapur',              type: 'bool',   label: 'Ada dapur / boleh masak' },
  { key: 'alamat',             type: 'text',   label: 'Alamat / area' },
  { key: 'kontak_owner',       type: 'phone',  label: 'Kontak owner' },
];

// Field yang paling menentukan scoring & dedup kandidat — dipakai untuk headline
// "critical accuracy" terpisah dari overall. Kalau yang ini jeblok, value inti hilang.
export const CRITICAL = new Set([
  'harga_sewa_bulanan', 'kamar_tidur', 'kamar_mandi', 'deposit', 'furnished',
]);
