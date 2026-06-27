import { FIELDS, CRITICAL } from './schema.mjs';

const norm = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
const digits = (s) => String(s ?? '').replace(/\D/g, '');

function tokens(s) {
  return new Set(norm(s).split(/[^a-z0-9]+/).filter(Boolean));
}
function jaccard(a, b) {
  const A = tokens(a), B = tokens(b);
  if (A.size === 0 && B.size === 0) return 1;
  const inter = [...A].filter((x) => B.has(x)).length;
  return inter / (A.size + B.size - inter);
}

// Bandingkan satu field. Mengembalikan true (benar) / false (salah).
export function compareField(field, gold, pred) {
  const g = gold === undefined ? null : gold;
  const p = pred === undefined ? null : pred;
  if (g === null && p === null) return true;        // true negative — keduanya "tidak tahu"
  if (g === null || p === null) return false;       // satu tahu, satu tidak

  switch (field.type) {
    case 'number':
    case 'int':
      return Number(g) === Number(p);
    case 'bool':
      return Boolean(g) === Boolean(p);
    case 'enum':
      return norm(g) === norm(p);
    case 'phone':
      return digits(g) === digits(p) && digits(g).length > 0;
    case 'text':
      return norm(g) === norm(p) || jaccard(g, p) >= 0.5;
    default:
      return norm(g) === norm(p);
  }
}

// Skor seluruh dataset untuk satu set prediksi.
// preds[i] = objek hasil ekstraksi untuk listing i (atau null jika error).
export function score(dataset, preds) {
  const perField = Object.fromEntries(FIELDS.map((f) => [f.key, { correct: 0, total: 0 }]));
  let allCorrect = 0, allTotal = 0;
  let critCorrect = 0, critTotal = 0;
  const perListing = [];
  let errors = 0;

  dataset.forEach((row, i) => {
    const pred = preds[i];
    if (pred == null) errors++;
    let rowCorrect = 0;
    for (const f of FIELDS) {
      const ok = pred == null ? false : compareField(f, row.gold[f.key], pred[f.key]);
      perField[f.key].total++;
      if (ok) perField[f.key].correct++;
      allTotal++; if (ok) allCorrect++;
      if (CRITICAL.has(f.key)) { critTotal++; if (ok) critCorrect++; }
      rowCorrect += ok ? 1 : 0;
    }
    perListing.push({ id: row.id ?? i, correct: rowCorrect, total: FIELDS.length });
  });

  return {
    overall: allCorrect / allTotal,
    critical: critCorrect / critTotal,
    errors,
    perField: Object.fromEntries(
      Object.entries(perField).map(([k, v]) => [k, v.correct / v.total]),
    ),
    perListing,
    counts: { allCorrect, allTotal, critCorrect, critTotal },
  };
}
