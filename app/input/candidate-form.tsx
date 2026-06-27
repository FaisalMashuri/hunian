"use client";

import { type ExtractedDraft } from "@/lib/extraction/types";
import { PERIODE_VALUES, PERIODE_TO_MONTHS, type Periode } from "@/lib/constants/periode";
import { FURNISHED_STATUSES } from "@/lib/types/db";
import { LocationAutocomplete } from "@/app/onboarding/location-autocomplete";

export type SetDraft = <K extends keyof ExtractedDraft>(k: K, v: ExtractedDraft[K]) => void;

const filled = (v: unknown) => v !== null && v !== undefined && v !== "";

const inputCls =
  "w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600";

const fmtRupiah = (n: number | null) =>
  n == null ? "" : "Rp " + new Intl.NumberFormat("id-ID").format(n);
const parseRupiah = (s: string): number | null => {
  const d = s.replace(/\D/g, "");
  return d === "" ? null : Number(d);
};

function Marker({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="text-emerald-600" title="Terisi" aria-label="terisi">
      ✓
    </span>
  ) : (
    <span className="text-amber-500" title="Perlu dicek" aria-label="perlu dicek">
      ⚠
    </span>
  );
}

function Field({
  label,
  required,
  value,
  children,
}: {
  label: string;
  required?: boolean;
  value: unknown;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-zinc-700">
        <Marker ok={filled(value)} />
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function BoolField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  const opts: { v: boolean | null; t: string }[] = [
    { v: true, t: "Ya" },
    { v: false, t: "Tidak" },
    { v: null, t: "—" },
  ];
  return (
    <div>
      <span className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-zinc-700">
        <Marker ok={filled(value)} />
        {label}
      </span>
      <div className="flex gap-1 rounded-xl border border-zinc-200 bg-white p-1">
        {opts.map((o) => (
          <button
            key={o.t}
            type="button"
            onClick={() => onChange(o.v)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
              value === o.v ? "bg-teal-700 text-white" : "text-zinc-600 hover:bg-stone-50"
            }`}
          >
            {o.t}
          </button>
        ))}
      </div>
    </div>
  );
}

// Form field kandidat — dipakai oleh Tambah (input) & Edit. State (draft) dikelola parent.
export function CandidateForm({ draft, set }: { draft: ExtractedDraft; set: SetDraft }) {
  const setNum = (k: keyof ExtractedDraft, raw: string) =>
    set(k, (raw === "" ? null : Number(raw)) as ExtractedDraft[typeof k]);

  // Harga ASLI (sesuai listing) yang diedit; per-bulan diturunkan otomatis utk skor.
  const perBulan = (asli: number | null, periode: Periode | null) =>
    asli == null ? null : periode && periode !== "bulan" ? Math.round(asli / PERIODE_TO_MONTHS[periode]) : asli;
  const setHargaAsli = (raw: string) => {
    const v = parseRupiah(raw);
    set("harga_asli", v);
    set("harga_sewa_bulanan", perBulan(v, draft.periode_asli));
  };
  const setPeriode = (p: Periode | null) => {
    set("periode_asli", p);
    set("harga_sewa_bulanan", perBulan(draft.harga_asli, p));
  };

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5">
      <Field label="Judul" required value={draft.title}>
        <input
          value={draft.title ?? ""}
          onChange={(e) => set("title", e.target.value || null)}
          placeholder="mis. Kontrakan Jatibening 2KT"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Harga sewa" required value={draft.harga_asli}>
          <input
            type="text"
            inputMode="numeric"
            value={fmtRupiah(draft.harga_asli)}
            onChange={(e) => setHargaAsli(e.target.value)}
            placeholder="Rp 3.500.000"
            className={inputCls}
          />
        </Field>
        <Field label="Periode" value={draft.periode_asli}>
          <select
            value={draft.periode_asli ?? ""}
            onChange={(e) => setPeriode((e.target.value || null) as Periode | null)}
            className={inputCls}
          >
            <option value="">—</option>
            {PERIODE_VALUES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {draft.periode_asli && draft.periode_asli !== "bulan" && draft.harga_sewa_bulanan != null && (
        <p className="-mt-2 text-xs font-medium text-teal-700">
          ≈ {fmtRupiah(draft.harga_sewa_bulanan)} / bulan — dipakai untuk skor & banding
        </p>
      )}

      <Field label="Deposit" value={draft.deposit}>
        <input
          type="text"
          inputMode="numeric"
          value={fmtRupiah(draft.deposit)}
          onChange={(e) => set("deposit", parseRupiah(e.target.value))}
          placeholder="Rp 7.000.000"
          className={inputCls}
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Kamar tidur" value={draft.kamar_tidur}>
          <input
            type="number"
            inputMode="numeric"
            value={draft.kamar_tidur ?? ""}
            onChange={(e) => setNum("kamar_tidur", e.target.value)}
            placeholder="2"
            className={inputCls}
          />
        </Field>
        <Field label="Kamar mandi" value={draft.kamar_mandi}>
          <input
            type="number"
            inputMode="numeric"
            value={draft.kamar_mandi ?? ""}
            onChange={(e) => setNum("kamar_mandi", e.target.value)}
            placeholder="1"
            className={inputCls}
          />
        </Field>
        <Field label="Luas (m²)" value={draft.luas_bangunan_m2}>
          <input
            type="number"
            inputMode="numeric"
            value={draft.luas_bangunan_m2 ?? ""}
            onChange={(e) => setNum("luas_bangunan_m2", e.target.value)}
            placeholder="45"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Furnished" value={draft.furnished}>
        <select
          value={draft.furnished ?? ""}
          onChange={(e) => set("furnished", (e.target.value || null) as ExtractedDraft["furnished"])}
          className={inputCls}
        >
          <option value="">—</option>
          {FURNISHED_STATUSES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <BoolField label="Carport" value={draft.carport} onChange={(v) => set("carport", v)} />
        <BoolField label="Dapur" value={draft.dapur} onChange={(v) => set("dapur", v)} />
      </div>

      <Field label="Alamat / area" value={draft.alamat}>
        <LocationAutocomplete
          value={draft.alamat ?? ""}
          onChange={(v) => set("alamat", v || null)}
          placeholder="mis. Jatibening, Bekasi"
          className={inputCls}
          autoResolve
        />
        <p className="mt-1 text-xs text-zinc-400">Dipakai menghitung jarak ke tujuanmu (skor lokasi).</p>
      </Field>

      <Field label="Kontak owner" value={draft.kontak_owner}>
        <input
          value={draft.kontak_owner ?? ""}
          onChange={(e) => set("kontak_owner", e.target.value || null)}
          placeholder="08xx…"
          className={inputCls}
        />
      </Field>

      <Field label="Catatan tambahan" value={draft.deskripsi}>
        <textarea
          value={draft.deskripsi ?? ""}
          onChange={(e) => set("deskripsi", e.target.value || null)}
          placeholder="Info kualitatif: bebas banjir, akses jalan, lingkungan, plus/minus…"
          className={`${inputCls} min-h-[88px] resize-y`}
        />
        <p className="mt-1 text-xs text-zinc-400">
          Hal yang tak masuk field di atas — tidak ikut diskor, tapi membantu saat memutuskan.
        </p>
      </Field>
    </div>
  );
}
