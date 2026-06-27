"use client";

import { useState } from "react";
import type { ExtractedDraft } from "@/lib/extraction/types";
import type { SetDraft } from "./candidate-form";
import { PERIODE_TO_MONTHS, type Periode } from "@/lib/constants/periode";
import { FURNISHED_STATUSES, type PropertyType } from "@/lib/types/db";
import { fmtRupiah, parseRupiah, filled, TRACKED_FIELDS, type FieldSource, type SourceMap } from "./input-shared";
import { tsFields, type TypeData } from "./type-specific";

type Kind = "text" | "rupiah" | "int" | "furnished" | "bool";
// Nilai mentah longgar untuk inline-edit (di-cast ke tipe field saat set).
type RawVal = string | number | boolean | null;

const FURNISHED_LABEL: Record<string, string> = { furnished: "Furnished", semi: "Semi", unfurnished: "Unfurnished" };
const PERIODE_SHORT: Record<Periode, string> = { bulan: "bulan", "3bulan": "3 bulan", "6bulan": "6 bulan", tahun: "tahun" };

const input = "min-w-0 flex-1 rounded-[7px] border-[1.5px] border-teal-700 bg-white px-2.5 py-1.5 text-[13px] text-zinc-900 outline-none";

function Badge({ source, isFilled, warn }: { source: FieldSource | undefined; isFilled: boolean; warn?: boolean }) {
  if (isFilled) {
    return source === "ai" ? (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[11px] font-bold text-emerald-600">✓ Terdeteksi</span>
    ) : (
      <span className="rounded-full border border-[#D1D0CC] bg-[#F4F3F0] px-1.5 py-0.5 text-[11px] font-bold text-zinc-500">~ Diisi manual</span>
    );
  }
  return warn ? (
    <span className="rounded-full border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[11px] font-bold text-amber-700">⚠ Kosong</span>
  ) : (
    <span className="rounded-full border border-[#D1D0CC] bg-[#F4F3F0] px-1.5 py-0.5 text-[11px] font-bold text-zinc-500">~ Opsional</span>
  );
}

function display(kind: Kind, v: RawVal, suffix?: string): string {
  if (!filled(v)) return "";
  if (kind === "rupiah") return fmtRupiah(v as number) + (suffix ?? "");
  if (kind === "bool") return v === true ? "Ya" : "Tidak";
  if (kind === "furnished") return FURNISHED_LABEL[v as string] ?? String(v);
  return String(v) + (suffix ?? "");
}

function ReviewRow({
  label,
  kind,
  value,
  source,
  warn,
  emptyHint,
  suffix,
  onCommit,
}: {
  label: string;
  kind: Kind;
  value: RawVal;
  source: FieldSource | undefined;
  warn?: boolean;
  emptyHint?: string;
  suffix?: string;
  onCommit: (parsed: RawVal) => void;
}) {
  const isFilled = filled(value);
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState<string>("");

  const startEdit = () => {
    setTemp(kind === "rupiah" ? (value == null ? "" : String(value)) : value == null ? "" : String(value));
    setEditing(true);
  };

  const commit = (parsed: RawVal) => {
    onCommit(parsed);
    setEditing(false);
  };
  const commitText = () => {
    if (kind === "rupiah") return commit(parseRupiah(temp));
    if (kind === "int") return commit(temp === "" ? null : Number(temp));
    return commit(temp.trim() === "" ? null : temp.trim());
  };

  return (
    <div className={`flex items-center gap-2.5 border-b border-[#E4E3DF] px-3.5 py-2.5 last:border-0 sm:gap-3 sm:px-4 ${editing ? "bg-[#FFFDF0]" : "cursor-pointer hover:bg-[#FAFAF9]"}`} onClick={() => !editing && startEdit()}>
      <span className="w-[92px] shrink-0 text-[12.5px] font-semibold text-zinc-500 sm:w-[130px]">{label}</span>

      {editing ? (
        <div className="flex flex-1 items-center gap-1.5 sm:gap-2" onClick={(e) => e.stopPropagation()}>
          {kind === "furnished" ? (
            <select className={input + " cursor-pointer"} value={temp} onChange={(e) => setTemp(e.target.value)} autoFocus>
              <option value="">—</option>
              {FURNISHED_STATUSES.map((f) => <option key={f} value={f}>{FURNISHED_LABEL[f]}</option>)}
            </select>
          ) : kind === "bool" ? (
            <select className={input + " cursor-pointer"} value={temp} onChange={(e) => setTemp(e.target.value)} autoFocus>
              <option value="">—</option>
              <option value="true">Ya</option>
              <option value="false">Tidak</option>
            </select>
          ) : (
            <input className={input} autoFocus inputMode={kind === "text" ? "text" : "numeric"} value={temp} onChange={(e) => setTemp(e.target.value)} placeholder={label} onKeyDown={(e) => { if (e.key === "Enter") commitText(); }} />
          )}
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white"
              onClick={() => {
                if (kind === "furnished") return commit(temp || null);
                if (kind === "bool") return commit(temp === "" ? null : temp === "true");
                commitText();
              }}
            >
              Simpan
            </button>
            <button type="button" className="rounded-md border border-[#E4E3DF] px-2.5 py-1.5 text-xs text-zinc-500" onClick={() => setEditing(false)}>Batal</button>
          </div>
        </div>
      ) : (
        <>
          <span className={`min-w-0 flex-1 truncate text-[13px] ${isFilled ? "text-zinc-900" : "italic text-zinc-400"}`}>
            {isFilled ? display(kind, value, suffix) : emptyHint ?? "Belum diisi"}
          </span>
          <span className="shrink-0"><Badge source={source} isFilled={isFilled} warn={warn} /></span>
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 overflow-hidden rounded-2xl border border-[#E4E3DF] bg-white shadow-sm">
      <div className="border-b border-[#E4E3DF] bg-[#FAFAF9] px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 sm:px-4">{title}</div>
      {children}
    </div>
  );
}

const TYPE_META: Record<PropertyType, { emoji: string; label: string }> = {
  kontrakan: { emoji: "🏠", label: "Kontrakan" },
  apartemen: { emoji: "🏢", label: "Apartemen" },
  kost: { emoji: "🛏️", label: "Kost" },
};

export function ReviewList({
  mode,
  draft,
  set,
  source,
  markManual,
  manualDistanceKm,
  setManualDistanceKm,
  propertyType = "kontrakan",
  setPropertyType,
  typeData = {},
}: {
  mode: "paste" | "manual";
  draft: ExtractedDraft;
  set: SetDraft;
  source: SourceMap;
  markManual: (k: keyof ExtractedDraft) => void;
  manualDistanceKm: string;
  setManualDistanceKm: (v: string) => void;
  propertyType?: PropertyType;
  setPropertyType?: (t: PropertyType) => void;
  typeData?: TypeData;
}) {
  // Commit helper: set draft + tandai sumber "manual". RawVal di-cast ke tipe field.
  const commit = <K extends keyof ExtractedDraft>(k: K) => (v: RawVal) => { set(k, v as ExtractedDraft[K]); markManual(k); };
  // Harga: set asli + turunkan per-bulan, jaga periode.
  const commitHarga = (v: RawVal) => {
    const num = v as number | null;
    set("harga_asli", num);
    const p = draft.periode_asli;
    set("harga_sewa_bulanan", num == null ? null : p && p !== "bulan" ? Math.round(num / PERIODE_TO_MONTHS[p]) : num);
    markManual("harga_asli");
  };

  const detected = TRACKED_FIELDS.filter((k) => source[k] === "ai").length;
  const hasAddress = filled(draft.alamat);

  return (
    <div>
      {/* RINGKASAN */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3.5 shadow-sm sm:gap-3.5 sm:px-5 sm:py-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
        </div>
        <div className="min-w-0 flex-1">
          {mode === "paste" ? (
            <>
              <div className="text-sm font-bold text-zinc-900">AI mengekstrak {detected} dari {TRACKED_FIELDS.length} field</div>
              <div className="text-[12.5px] text-zinc-500">Ketuk baris mana saja untuk koreksi. Tanda ⚠ artinya perlu dilengkapi.</div>
            </>
          ) : (
            <>
              <div className="text-sm font-bold text-zinc-900">Periksa data sebelum disimpan</div>
              <div className="text-[12.5px] text-zinc-500">Ketuk baris untuk mengubah. Field ⚠ sebaiknya dilengkapi agar evaluasi akurat.</div>
            </>
          )}
        </div>
      </div>

      {/* JENIS PROPERTI — hasil deteksi (paste) / pilihan (manual); bisa dikoreksi */}
      <div className="mb-4 rounded-2xl border border-[#E4E3DF] bg-white px-4 py-3.5 shadow-sm">
        <div className="mb-2 flex items-center gap-1.5 text-[12.5px] font-semibold text-zinc-700">
          {mode === "paste" ? "Jenis properti terdeteksi" : "Jenis properti"}
          {mode === "paste" && <span className="rounded-full border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">AI</span>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(TYPE_META) as PropertyType[]).map((t) => {
            const active = propertyType === t;
            const m = TYPE_META[t];
            return (
              <button
                key={t}
                type="button"
                disabled={!setPropertyType}
                onClick={() => setPropertyType?.(t)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border-[1.5px] px-2 py-2 text-[13px] font-semibold transition-colors ${
                  active ? "border-teal-700 bg-teal-50 text-teal-700" : "border-[#E4E3DF] bg-white text-zinc-500 hover:text-zinc-900"
                } ${!setPropertyType ? "cursor-default" : ""}`}
              >
                <span className="text-[15px]">{m.emoji}</span>
                {m.label}
              </button>
            );
          })}
        </div>
        {mode === "paste" && setPropertyType && (
          <p className="mt-2 text-[11.5px] text-zinc-400">Salah deteksi? Ketuk jenis yang benar — field khusus menyesuaikan saat disimpan.</p>
        )}
      </div>

      <Section title="📋 Informasi Dasar">
        <ReviewRow label="Nama Hunian" kind="text" value={draft.title} source={source.title} warn onCommit={commit("title")} />
        <ReviewRow label="Kontak Owner" kind="text" value={draft.kontak_owner} source={source.kontak_owner} emptyHint="Belum diisi" onCommit={commit("kontak_owner")} />
        <ReviewRow label="Alamat" kind="text" value={draft.alamat} source={source.alamat} warn emptyHint="Tidak ditemukan di teks" onCommit={commit("alamat")} />
      </Section>

      <Section title="💰 Harga & Biaya">
        <ReviewRow label="Harga Sewa" kind="rupiah" value={draft.harga_asli} source={source.harga_asli} warn suffix={draft.periode_asli ? ` / ${PERIODE_SHORT[draft.periode_asli]}` : ""} onCommit={commitHarga} />
        <ReviewRow label="Deposit" kind="rupiah" value={draft.deposit} source={source.deposit} emptyHint="Tidak disebutkan" onCommit={commit("deposit")} />
      </Section>

      {propertyType === "kontrakan" ? (
        <Section title="🏠 Spesifikasi">
          <ReviewRow label="Kamar Tidur" kind="int" value={draft.kamar_tidur} source={source.kamar_tidur} warn suffix=" kamar" onCommit={commit("kamar_tidur")} />
          <ReviewRow label="Kamar Mandi" kind="int" value={draft.kamar_mandi} source={source.kamar_mandi} warn suffix=" kamar" onCommit={commit("kamar_mandi")} />
          <ReviewRow label="Furnished" kind="furnished" value={draft.furnished} source={source.furnished} warn onCommit={commit("furnished")} />
          <ReviewRow label="Carport" kind="bool" value={draft.carport} source={source.carport} warn onCommit={commit("carport")} />
          <ReviewRow label="Dapur" kind="bool" value={draft.dapur} source={source.dapur} warn onCommit={commit("dapur")} />
          <ReviewRow label="Luas Bangunan" kind="int" value={draft.luas_bangunan_m2} source={source.luas_bangunan_m2} suffix=" m²" emptyHint="Tidak disebutkan" onCommit={commit("luas_bangunan_m2")} />
        </Section>
      ) : (
        <Section title={propertyType === "apartemen" ? "🏢 Detail Apartemen" : "🛏️ Detail Kost"}>
          <ReviewRow label="Furnished" kind="furnished" value={draft.furnished} source={source.furnished} onCommit={commit("furnished")} />
          {tsFields(propertyType).map((f) => {
            const v = typeData[f.key];
            return (
              <div key={f.key} className="flex items-center gap-2.5 border-b border-[#E4E3DF] px-3.5 py-2.5 last:border-0 sm:gap-3 sm:px-4">
                <span className="w-[92px] shrink-0 text-[12.5px] font-semibold text-zinc-500 sm:w-[130px]">{f.label}</span>
                <span className="min-w-0 flex-1 text-[13px] text-zinc-900">
                  {v != null && v !== "" ? (f.kind === "rupiah" ? "Rp " + new Intl.NumberFormat("id-ID").format(Number(v)) : String(v)) : <span className="italic text-zinc-400">—</span>}
                </span>
              </div>
            );
          })}
        </Section>
      )}

      {/* JARAK */}
      <Section title="📍 Jarak ke Tujuan">
        {hasAddress ? (
          <div className="flex items-center gap-2.5 px-3.5 py-3 text-[12.5px] text-zinc-500 sm:gap-3 sm:px-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
            Dihitung otomatis dari alamat saat disimpan (Google Maps).
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5 px-3.5 py-3 sm:gap-3 sm:px-4">
            <span className="w-[92px] shrink-0 text-[12.5px] font-semibold text-zinc-500 sm:w-[130px]">🏍 Jarak (manual)</span>
            <span className="flex items-center gap-1.5">
              <input className="w-24 rounded-lg border-[1.5px] border-[#E4E3DF] px-2.5 py-1.5 text-right font-mono text-[13px] text-zinc-900 outline-none focus:border-teal-700" type="number" step="0.1" min="0" value={manualDistanceKm} onChange={(e) => setManualDistanceKm(e.target.value)} placeholder="6.4" />
              <span className="text-[13px] text-zinc-500">km</span>
            </span>
            <span className="text-[11.5px] text-amber-600">⚠ Alamat kosong — isi km manual untuk aktifkan skor lokasi</span>
          </div>
        )}
      </Section>

      {/* STATUS — Slice 2 (disabled) */}
      <div className="overflow-hidden rounded-2xl border border-[#E4E3DF] bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-[#E4E3DF] bg-[#FAFAF9] px-3.5 py-2.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400 sm:px-4">
          Status Hunian <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9.5px] text-amber-700">Segera</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 px-3.5 py-3 sm:px-4">
          <span className="cursor-not-allowed select-none rounded-lg border-[1.5px] border-teal-700 bg-teal-50 px-3.5 py-1.5 text-[13px] font-semibold text-teal-700 opacity-70">🟢 Tersedia</span>
          <span className="cursor-not-allowed select-none rounded-lg border-[1.5px] border-[#E4E3DF] bg-white px-3.5 py-1.5 text-[13px] font-medium text-zinc-400 opacity-60">🔵 Sudah Disurvey</span>
          <span className="cursor-not-allowed select-none rounded-lg border-[1.5px] border-[#E4E3DF] bg-white px-3.5 py-1.5 text-[13px] font-medium text-zinc-400 opacity-60">⚫ Sudah Tersewa</span>
        </div>
        <div className="px-3.5 pb-3 text-xs text-zinc-400 sm:px-4">Default: Tersedia. Ubah status setelah survey langsung (dari halaman detail hunian).</div>
      </div>
    </div>
  );
}
