import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FIELDS, CRITICAL } from './schema.mjs';
import { score } from './score.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

// --- .env loader minimal (tanpa dependency) ---
const envPath = join(HERE, '.env');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

// --- args ---
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const which = getArg('model', 'all');         // openai | anthropic | rule | all
const datasetFile = getArg('dataset', 'dataset.json');
const threshold = parseFloat(getArg('threshold', '0.85'));

const dataset = JSON.parse(readFileSync(join(HERE, datasetFile), 'utf8'));
if (!Array.isArray(dataset) || dataset.length === 0) {
  console.error(`Dataset ${datasetFile} kosong. Isi minimal beberapa contoh berlabel dulu.`);
  process.exit(1);
}

const ALL = ['rule', 'openai', 'anthropic'];
const selected = which === 'all' ? ALL : [which];

async function loadExtractor(id) {
  if (id === 'openai') return import('./extractors/openai.mjs');
  if (id === 'anthropic') return import('./extractors/anthropic.mjs');
  if (id === 'rule') return import('./extractors/ruleBased.mjs');
  throw new Error(`model tak dikenal: ${id}`);
}

const pct = (x) => (x * 100).toFixed(1).padStart(5) + '%';

async function runOne(id) {
  let mod;
  try { mod = await loadExtractor(id); }
  catch (e) { console.error(`! gagal load ${id}: ${e.message}`); return null; }

  process.stdout.write(`\n▶ ${mod.meta.label} — ${dataset.length} listing\n`);
  const preds = [];
  for (let i = 0; i < dataset.length; i++) {
    try {
      preds.push(await mod.extract(dataset[i].text));
      process.stdout.write('.');
    } catch (e) {
      preds.push(null);
      process.stdout.write('x');
      if (i === 0) console.error(`\n  (error listing 0: ${e.message})`);
    }
  }
  process.stdout.write('\n');
  const result = score(dataset, preds);
  return { id, label: mod.meta.label, result, preds };
}

const runs = [];
for (const id of selected) {
  const r = await runOne(id);
  if (r) runs.push(r);
}

if (runs.length === 0) { console.error('Tidak ada run yang berhasil.'); process.exit(1); }

// --- Tabel per-field (model = kolom) ---
console.log('\n=== Akurasi per field ===');
const head = ['field'.padEnd(22), ...runs.map((r) => r.id.padStart(10))].join(' | ');
console.log(head);
console.log('-'.repeat(head.length));
for (const f of FIELDS) {
  const star = CRITICAL.has(f.key) ? '*' : ' ';
  const cells = runs.map((r) => pct(r.result.perField[f.key]));
  console.log(`${star}${f.key.padEnd(21)} | ${cells.join(' | ')}`);
}
console.log('-'.repeat(head.length));
console.log(` ${'OVERALL'.padEnd(21)} | ${runs.map((r) => pct(r.result.overall)).join(' | ')}`);
console.log(` ${'CRITICAL (*)'.padEnd(21)} | ${runs.map((r) => pct(r.result.critical)).join(' | ')}`);
console.log(` ${'errors'.padEnd(21)} | ${runs.map((r) => String(r.result.errors).padStart(10)).join(' | ')}`);

// --- Verdict GO/NO-GO terhadap threshold ---
console.log(`\n=== GO/NO-GO (threshold overall ${(threshold * 100).toFixed(0)}%) ===`);
for (const r of runs) {
  const go = r.result.overall >= threshold;
  console.log(`  ${go ? 'GO  ✓' : 'NO  ✗'}  ${r.id.padEnd(10)} overall ${pct(r.result.overall)}  critical ${pct(r.result.critical)}`);
}

// --- Simpan hasil ---
const outDir = join(HERE, 'results');
mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outFile = join(outDir, `${which}-${stamp}.json`);
writeFileSync(outFile, JSON.stringify({
  datasetFile, n: dataset.length, threshold,
  runs: runs.map((r) => ({ id: r.id, label: r.label, ...r.result })),
}, null, 2));
console.log(`\nDetail tersimpan: benchmark/results/${which}-${stamp}.json`);
console.log('Tip: buka file itu untuk lihat per-listing & cari listing mana yang sering salah.');
