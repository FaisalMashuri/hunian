"use client";

import type { ExtractedDraft } from "@/lib/extraction/types";
import type { SetDraft } from "./candidate-form";
import type { PropertyType } from "@/lib/types/db";
import { PERIODE_VALUES, PERIODE_TO_MONTHS, type Periode } from "@/lib/constants/periode";
import { FURNISHED_STATUSES } from "@/lib/types/db";
import { fmtRupiah, parseRupiah } from "./input-shared";
import { APARTEMEN_FIELDS, KOST_FIELDS, type TSField, type TypeData, type TSValue } from "./type-specific";
import { LocationAutocomplete } from "@/app/onboarding/location-autocomplete";

// ── kelas dasar (selaras palet mockup)
const input = "w-full rounded-[9px] border-[1.5px] border-[#E4E3DF] bg-white px-3 py-2.5 text-[13.5px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-teal-700";
const select = input + " cursor-pointer";
const prefixWrap = "flex items-stretch overflow-hidden rounded-[9px] border-[1.5px] border-[#E4E3DF] bg-white transition-colors focus-within:border-teal-700";
const prefixLabel = "flex items-center border-r-[1.5px] border-[#E4E3DF] bg-[#FAFAF9] px-2.5 text-[13px] font-medium text-zinc-500";
const prefixInput = "min-w-0 flex-1 border-none bg-transparent px-3 py-2.5 font-mono text-[13.5px] text-zinc-900 outline-none placeholder:text-zinc-400";

const PERIODE_LABEL: Record<Periode, string> = { bulan: "Per Bulan", "3bulan": "Per 3 Bulan", "6bulan": "Per 6 Bulan", tahun: "Per Tahun" };
const FURNISHED_LABEL: Record<string, string> = { furnished: "Furnished", semi: "Semi", unfurnished: "Unfurnished" };

function Req() {
  return <span className="text-[11px] font-bold text-teal-700">wajib</span>;
}
function Opt({ children = "opsional" }: { children?: React.ReactNode }) {
  return <span className="text-[10.5px] font-normal text-zinc-400">{children}</span>;
}
function Soon() {
  return <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-amber-700">Segera</span>;
}
function Label({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-zinc-700">{children}</div>;
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 after:h-px after:flex-1 after:bg-[#E4E3DF] after:content-['']">{children}</div>;
}
function Card({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E3DF] bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-[#E4E3DF] bg-[#FAFAF9] px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-teal-50 text-[16px]">{icon}</div>
        <div className="text-sm font-bold text-zinc-900">{title}</div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

// ── Toggle pill
function Toggle({ active, disabled, onClick, children }: { active: boolean; disabled?: boolean; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`cursor-pointer select-none rounded-lg border-[1.5px] px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
        active ? "border-teal-700 bg-teal-50 font-semibold text-teal-700" : "border-[#E4E3DF] bg-white text-zinc-500 hover:text-zinc-900"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      {children}
    </button>
  );
}

// ── Blok Harga bersama (Kontrakan/Apartemen/Kost) — semantik harga terkunci di satu tempat.
//    Harga Awal = listing (immutable). Harga Akhir (negosiasi) dicatat pasca-simpan dari halaman
//    kandidat (S2-4), jadi di sini ditampilkan disabled. periode_asli + harga_sewa_bulanan turunan.
function PriceSection({ draft, set, hargaPlaceholder = "3.500.000", depositPlaceholder = "7.000.000" }: { draft: ExtractedDraft; set: SetDraft; hargaPlaceholder?: string; depositPlaceholder?: string }) {
  const perBulan = (asli: number | null, periode: Periode | null) =>
    asli == null ? null : periode && periode !== "bulan" ? Math.round(asli / PERIODE_TO_MONTHS[periode]) : asli;
  const setHarga = (raw: string) => {
    const v = parseRupiah(raw);
    set("harga_asli", v);
    set("harga_sewa_bulanan", perBulan(v, draft.periode_asli));
  };
  const setPeriode = (p: Periode) => {
    set("periode_asli", p);
    set("harga_sewa_bulanan", perBulan(draft.harga_asli, p));
  };
  return (
    <>
      <SectionTitle>Harga</SectionTitle>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Harga Awal (dari listing) <Req /></Label>
          <div className={prefixWrap}>
            <span className={prefixLabel}>Rp</span>
            <input className={prefixInput} inputMode="numeric" value={fmtRupiah(draft.harga_asli).replace("Rp ", "")} onChange={(e) => setHarga(e.target.value)} placeholder={hargaPlaceholder} />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Harga Akhir (negosiasi) <Soon /></Label>
          <div className={prefixWrap + " cursor-not-allowed opacity-50"}>
            <span className={prefixLabel}>Rp</span>
            <input className={prefixInput} disabled placeholder="—" />
          </div>
          <span className="text-[11.5px] text-zinc-400">Catat negosiasi nanti dari halaman kandidat</span>
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label>Periode Bayar <Req /></Label>
          <div className="flex flex-wrap gap-1.5">
            {PERIODE_VALUES.map((p) => (
              <Toggle key={p} active={draft.periode_asli === p} onClick={() => setPeriode(p)}>{PERIODE_LABEL[p]}</Toggle>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Deposit <Opt /></Label>
          <div className={prefixWrap}>
            <span className={prefixLabel}>Rp</span>
            <input className={prefixInput} inputMode="numeric" value={fmtRupiah(draft.deposit).replace("Rp ", "")} onChange={(e) => set("deposit", parseRupiah(e.target.value))} placeholder={depositPlaceholder} />
          </div>
        </div>
      </div>
      {draft.periode_asli && draft.periode_asli !== "bulan" && draft.harga_sewa_bulanan != null && (
        <p className="mt-2 text-xs font-medium text-teal-700">≈ {fmtRupiah(draft.harga_sewa_bulanan)} / bulan — dipakai untuk skor & banding</p>
      )}
    </>
  );
}

// ════════════ KONTRAKAN (fungsional) ════════════
function KontrakanForm({ draft, set }: { draft: ExtractedDraft; set: SetDraft }) {
  const setInt = (k: keyof ExtractedDraft, raw: string) => set(k, (raw === "" ? null : Number(raw)) as ExtractedDraft[typeof k]);
  const toggleBool = (k: "carport" | "dapur") => set(k, draft[k] === true ? null : true);

  return (
    <Card icon="🏠" title="Informasi Dasar">
      {/* ── Dasar */}
      <div className="mb-4 space-y-2.5">
        <div className="flex flex-col gap-1.5">
          <Label>Nama Kandidat <Req /></Label>
          <input className={input} value={draft.title ?? ""} onChange={(e) => set("title", e.target.value || null)} placeholder="mis. Kontrakan Pak Budi Jatiwaringin" />
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Kontak Owner <Req /></Label>
            <input className={input} type="tel" value={draft.kontak_owner ?? ""} onChange={(e) => set("kontak_owner", e.target.value || null)} placeholder="0812-xxxx-xxxx" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Platform Asal <Soon /></Label>
            <select className={select + " cursor-not-allowed opacity-50"} disabled>
              <option>Pilih platform...</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Harga */}
      <div className="mb-4">
        <PriceSection draft={draft} set={set} />
      </div>

      {/* ── Spesifikasi */}
      <div className="mb-4">
        <SectionTitle>Spesifikasi</SectionTitle>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="flex flex-col gap-1.5">
            <Label>Kamar Tidur <Req /></Label>
            <input className={input} type="number" min="0" value={draft.kamar_tidur ?? ""} onChange={(e) => setInt("kamar_tidur", e.target.value)} placeholder="2" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Kamar Mandi <Req /></Label>
            <input className={input} type="number" min="0" value={draft.kamar_mandi ?? ""} onChange={(e) => setInt("kamar_mandi", e.target.value)} placeholder="1" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Luas (m²) <Opt /></Label>
            <input className={input} type="number" value={draft.luas_bangunan_m2 ?? ""} onChange={(e) => setInt("luas_bangunan_m2", e.target.value)} placeholder="65" />
          </div>
        </div>
        <div className="mt-2.5 flex flex-col gap-1.5">
          <Label>Furnished <Req /></Label>
          <div className="flex flex-wrap gap-1.5">
            {FURNISHED_STATUSES.map((f) => (
              <Toggle key={f} active={draft.furnished === f} onClick={() => set("furnished", f)}>{FURNISHED_LABEL[f]}</Toggle>
            ))}
          </div>
        </div>
        <div className="mt-2.5 flex flex-col gap-1.5">
          <Label>Fasilitas</Label>
          <div className="flex flex-wrap gap-1.5">
            <Toggle active={draft.carport === true} onClick={() => toggleBool("carport")}>Carport</Toggle>
            <Toggle active={draft.dapur === true} onClick={() => toggleBool("dapur")}>Dapur</Toggle>
            <Toggle active={false} disabled>Garasi <Soon /></Toggle>
            <Toggle active={false} disabled>AC <Soon /></Toggle>
          </div>
        </div>
      </div>

      {/* ── Lokasi */}
      <div className="mb-4">
        <SectionTitle>Lokasi</SectionTitle>
        <div className="flex flex-col gap-1.5">
          <Label>Alamat <Opt>opsional — sering tidak ada di listing sosmed</Opt></Label>
          <LocationAutocomplete value={draft.alamat ?? ""} onChange={(v) => set("alamat", v || null)} placeholder="mis. Jl. Jatiwaringin Asri No.14, Pondok Gede" className={input} autoResolve />
          <span className="text-[11.5px] text-zinc-400">Jika alamat diisi, titik lokasi & jarak ke tujuan terhitung otomatis.</span>
        </div>
      </div>

      {/* ── Biaya bulanan tambahan (Slice 2) */}
      <div className="mb-4 rounded-xl border border-dashed border-[#E4E3DF] bg-[#FAFAF9] px-4 py-3">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-zinc-400">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
          Biaya bulanan tambahan (listrik, air, internet) <Soon />
        </div>
      </div>

      {/* ── Catatan */}
      <div className="flex flex-col gap-1.5">
        <Label>Catatan</Label>
        <textarea className={input + " min-h-[80px] resize-y"} value={draft.deskripsi ?? ""} onChange={(e) => set("deskripsi", e.target.value || null)} placeholder="Hal-hal penting tentang kandidat ini — bebas banjir, akses jalan, lingkungan, plus/minus…" />
      </div>
    </Card>
  );
}

// ── Input field type-specific (S2-6) — terhubung ke typeData.
function TSInput({ field, typeData, setTS }: { field: TSField; typeData: TypeData; setTS: (k: string, v: TSValue) => void }) {
  const v = typeData[field.key];
  if (field.kind === "toggle") {
    return (
      <div className="flex flex-col gap-1.5">
        <Label>{field.label}</Label>
        <div className="flex flex-wrap gap-1.5">
          {field.options!.map((o) => (
            <Toggle key={o} active={v === o} onClick={() => setTS(field.key, v === o ? null : o)}>{o}</Toggle>
          ))}
        </div>
      </div>
    );
  }
  if (field.kind === "rupiah") {
    return (
      <div className="flex flex-col gap-1.5">
        <Label>{field.label} <Opt /></Label>
        <div className={prefixWrap}>
          <span className={prefixLabel}>Rp</span>
          <input className={prefixInput} inputMode="numeric" value={v == null ? "" : new Intl.NumberFormat("id-ID").format(v as number)} onChange={(e) => setTS(field.key, parseRupiah(e.target.value))} placeholder={field.placeholder} />
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{field.label}</Label>
      <input className={input} type={field.kind === "int" ? "number" : "text"} inputMode={field.kind === "int" ? "numeric" : "text"} value={(v as string | number) ?? ""} onChange={(e) => setTS(field.key, field.kind === "int" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value || null)} placeholder={field.placeholder} />
    </div>
  );
}

// ════════════ APARTEMEN (S2-6, fungsional) ════════════
function ApartemenForm({ draft, set, typeData, setTS }: { draft: ExtractedDraft; set: SetDraft; typeData: TypeData; setTS: (k: string, v: TSValue) => void }) {
  return (
    <Card icon="🏢" title="Informasi Apartemen">
      <div className="mb-4 space-y-2.5">
        <div className="flex flex-col gap-1.5">
          <Label>Nama Apartemen <Req /></Label>
          <input className={input} value={draft.title ?? ""} onChange={(e) => set("title", e.target.value || null)} placeholder="mis. Apt Skandinavia Lt 12" />
          <span className="text-[11.5px] text-zinc-400">Dipakai sebagai nama kandidat.</span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <TSInput field={APARTEMEN_FIELDS[0]} typeData={typeData} setTS={setTS} />
          <TSInput field={APARTEMEN_FIELDS[1]} typeData={typeData} setTS={setTS} />
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <TSInput field={APARTEMEN_FIELDS[2]} typeData={typeData} setTS={setTS} />
          <TSInput field={APARTEMEN_FIELDS[3]} typeData={typeData} setTS={setTS} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Kontak Owner <Req /></Label>
          <input className={input} type="tel" value={draft.kontak_owner ?? ""} onChange={(e) => set("kontak_owner", e.target.value || null)} placeholder="0812-xxxx-xxxx" />
        </div>
      </div>

      {/* ── Harga */}
      <div className="mb-4">
        <PriceSection draft={draft} set={set} hargaPlaceholder="4.200.000" depositPlaceholder="8.400.000" />
        <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <TSInput field={APARTEMEN_FIELDS[4]} typeData={typeData} setTS={setTS} />
          <div className="flex flex-col gap-1.5">
            <Label>Furnished</Label>
            <div className="flex flex-wrap gap-1.5">
              {FURNISHED_STATUSES.map((f) => (
                <Toggle key={f} active={draft.furnished === f} onClick={() => set("furnished", f)}>{FURNISHED_LABEL[f]}</Toggle>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Lokasi */}
      <div className="flex flex-col gap-1.5">
        <Label>Alamat / lokasi <Opt /></Label>
        <LocationAutocomplete value={draft.alamat ?? ""} onChange={(v) => set("alamat", v || null)} placeholder="mis. Jl. Boulevard, Bekasi" className={input} autoResolve />
      </div>
    </Card>
  );
}

// ════════════ KOST (S2-6, fungsional) ════════════
function KostForm({ draft, set, typeData, setTS }: { draft: ExtractedDraft; set: SetDraft; typeData: TypeData; setTS: (k: string, v: TSValue) => void }) {
  return (
    <Card icon="🛏️" title="Informasi Kost">
      <div className="mb-4 space-y-2.5">
        <div className="flex flex-col gap-1.5">
          <Label>Nama Kost <Req /></Label>
          <input className={input} value={draft.title ?? ""} onChange={(e) => set("title", e.target.value || null)} placeholder="mis. Kost Pak Hasan Cibubur" />
          <span className="text-[11.5px] text-zinc-400">Dipakai sebagai nama kandidat.</span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label>Kontak Owner <Req /></Label>
            <input className={input} type="tel" value={draft.kontak_owner ?? ""} onChange={(e) => set("kontak_owner", e.target.value || null)} placeholder="0812-xxxx-xxxx" />
          </div>
          <TSInput field={KOST_FIELDS[0]} typeData={typeData} setTS={setTS} />
        </div>
        <TSInput field={KOST_FIELDS[1]} typeData={typeData} setTS={setTS} />
      </div>

      {/* ── Harga */}
      <div className="mb-4">
        <PriceSection draft={draft} set={set} hargaPlaceholder="1.500.000" depositPlaceholder="1.500.000" />
      </div>

      {/* ── Lainnya */}
      <div className="space-y-2.5">
        <div className="flex flex-col gap-1.5">
          <Label>Furnished</Label>
          <div className="flex flex-wrap gap-1.5">
            {FURNISHED_STATUSES.map((f) => (
              <Toggle key={f} active={draft.furnished === f} onClick={() => set("furnished", f)}>{FURNISHED_LABEL[f]}</Toggle>
            ))}
          </div>
        </div>
        <TSInput field={KOST_FIELDS[2]} typeData={typeData} setTS={setTS} />
        <div className="flex flex-col gap-1.5">
          <Label>Alamat / lokasi <Opt /></Label>
          <LocationAutocomplete value={draft.alamat ?? ""} onChange={(v) => set("alamat", v || null)} placeholder="mis. Cibubur, Jakarta Timur" className={input} autoResolve />
        </div>
      </div>
    </Card>
  );
}

export function ManualForms({ propertyType, draft, set, typeData = {}, setTS = () => {} }: { propertyType: PropertyType; draft: ExtractedDraft; set: SetDraft; typeData?: TypeData; setTS?: (k: string, v: TSValue) => void }) {
  if (propertyType === "apartemen") return <ApartemenForm draft={draft} set={set} typeData={typeData} setTS={setTS} />;
  if (propertyType === "kost") return <KostForm draft={draft} set={set} typeData={typeData} setTS={setTS} />;
  return <KontrakanForm draft={draft} set={set} />;
}
