import { FIELDS } from '../schema.mjs';

// Baseline regex murni — TANPA AI. Gunanya menunjukkan "lantai" akurasi:
// berapa yang bisa ditangkap aturan sederhana, dan berapa lift yang diberi AI.

export const meta = { id: 'rule', label: 'Rule-based (regex baseline)' };

function parseMoney(raw) {
  if (!raw) return null;
  let s = String(raw).toLowerCase().replace(/rp/g, '').trim();
  const jt = s.match(/([\d.,]+)\s*(jt|juta)/);
  if (jt) return Math.round(parseFloat(jt[1].replace(/\./g, '').replace(',', '.')) * 1_000_000);
  const rb = s.match(/([\d.,]+)\s*(rb|ribu|k)\b/);
  if (rb) return Math.round(parseFloat(rb[1].replace(/\./g, '').replace(',', '.')) * 1_000);
  const plain = s.match(/(\d[\d.]{5,})/); // angka panjang spt 3.500.000
  if (plain) return parseInt(plain[1].replace(/\./g, ''), 10);
  return null;
}

function detectPeriode(t) {
  if (/per\s*tahun|\/\s*tahun|\/thn|pertahun/.test(t)) return 'tahun';
  if (/6\s*bulan|\/\s*6\s*bln/.test(t)) return '6bulan';
  if (/3\s*bulan|\/\s*3\s*bln/.test(t)) return '3bulan';
  if (/per\s*bulan|\/\s*bulan|\/bln|perbulan/.test(t)) return 'bulan';
  return null;
}

export async function extract(listingText) {
  const t = listingText.toLowerCase();
  const out = Object.fromEntries(FIELDS.map((f) => [f.key, null]));

  // Harga: cari angka uang pertama, lalu konversi ke per bulan pakai periode.
  const periode = detectPeriode(t);
  out.periode_asli = periode;
  const hargaMatch = t.match(/(?:harga|sewa|kontrak)[^\d]{0,12}([\d.,]+\s*(?:jt|juta|rb|ribu|k)?)/) || t.match(/([\d.,]+\s*(?:jt|juta))/);
  let harga = hargaMatch ? parseMoney(hargaMatch[1]) : null;
  if (harga != null) {
    if (periode === 'tahun') harga = Math.round(harga / 12);
    else if (periode === '6bulan') harga = Math.round(harga / 6);
    else if (periode === '3bulan') harga = Math.round(harga / 3);
  }
  out.harga_sewa_bulanan = harga;

  // Deposit: "deposit/dp N bulan" -> N * harga; atau nominal langsung.
  const depBln = t.match(/(?:deposit|dp)\s*(\d+)\s*bulan/);
  if (depBln && harga != null) out.deposit = parseInt(depBln[1], 10) * harga;
  else {
    const depNom = t.match(/(?:deposit|dp)[^\d]{0,8}([\d.,]+\s*(?:jt|juta|rb|ribu)?)/);
    if (depNom) out.deposit = parseMoney(depNom[1]);
  }

  // Kamar
  const kt = t.match(/(\d+)\s*(?:kt|kamar tidur|br|bedroom)/);
  if (kt) out.kamar_tidur = parseInt(kt[1], 10);
  const km = t.match(/(\d+)\s*(?:km|kamar mandi|bathroom)/);
  if (km) out.kamar_mandi = parseInt(km[1], 10);
  else if (/kamar mandi (?:dalam|luar)/.test(t)) out.kamar_mandi = 1;

  // Luas bangunan
  const lb = t.match(/lb\s*([\d.,]+)/) || t.match(/luas (?:bangunan)?\s*([\d.,]+)\s*m/);
  if (lb) out.luas_bangunan_m2 = parseFloat(lb[1].replace(',', '.'));

  // Furnished
  if (/full\s*furnish|furnished/.test(t) && !/semi/.test(t)) out.furnished = 'furnished';
  else if (/semi\s*furnish/.test(t)) out.furnished = 'semi';
  else if (/unfurnish|kosongan|belum furnish|blm furnish|tanpa furnitur/.test(t)) out.furnished = 'unfurnished';

  // Carport / dapur
  if (/carport|garasi|parkir mobil/.test(t)) out.carport = true;
  if (/dapur|boleh masak|bisa masak|bisa buat masak/.test(t)) out.dapur = true;

  // Kontak: nomor telepon Indonesia
  const phone = listingText.match(/(?:\+?62|0)[\d\s().-]{8,14}\d/);
  if (phone) out.kontak_owner = phone[0].trim();

  return out;
}
