"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveSurveyAction, type SurveyDataPatch, type SurveyInput } from "./actions";
import { OwnerQuestions } from "./owner-questions";
import { uploadPhotoAction, deletePhotoAction } from "../photo-actions";
import { FURNISHED_STATUSES, type FurnishedStatus } from "@/lib/types/db";
import { LocationAutocomplete } from "@/app/onboarding/location-autocomplete";
import type { Photo } from "@/lib/photos";

type Dim = "kebersihan" | "kebisingan" | "parkir" | "owner" | "keamanan" | "kondisi_bangunan";

export type SurveyInitial = {
  id: string;
  title: string;
  current: Record<string, string | number | boolean | null>;
  survey: {
    ratings: Record<Dim, number | null>;
    tags: Record<Dim, string[]>;
    catatan: string | null;
  } | null;
  photos: Photo[];
};

const DIMS: { k: Dim; label: string; emoji: string; tags: string[] }[] = [
  { k: "kebersihan", label: "Kebersihan", emoji: "🧹", tags: ["Bersih", "Cukup bersih", "Perlu dibersihkan", "Bau lembap"] },
  { k: "kebisingan", label: "Kebisingan", emoji: "🔊", tags: ["Tenang", "Ramai siang", "Bising jalan", "Tenang malam"] },
  { k: "parkir", label: "Parkir", emoji: "🅿️", tags: ["Motor + mobil", "Motor saja", "Sempit", "Luas & rapi"] },
  { k: "owner", label: "Owner / Pemilik", emoji: "👤", tags: ["Responsif", "Ramah", "Tinggal di lokasi", "Lambat balas", "Mau nego"] },
  { k: "keamanan", label: "Keamanan", emoji: "🛡️", tags: ["Ada portal", "Ada satpam", "Lingkungan ramai", "Terasa aman"] },
  { k: "kondisi_bangunan", label: "Kondisi bangunan", emoji: "🏠", tags: ["Terawat", "Tidak ada bocor", "Perlu cat ulang", "Ada retak"] },
];

type FieldKind = "int" | "rupiah" | "furnished" | "bool" | "alamat" | "text";
const FIELDS: { k: keyof SurveyDataPatch; label: string; kind: FieldKind; placeholder?: string }[] = [
  { k: "kamar_tidur", label: "Kamar tidur", kind: "int", placeholder: "2" },
  { k: "kamar_mandi", label: "Kamar mandi", kind: "int", placeholder: "1" },
  { k: "luas_bangunan_m2", label: "Luas (m²)", kind: "int", placeholder: "65" },
  { k: "deposit", label: "Deposit", kind: "rupiah", placeholder: "7.000.000" },
  { k: "furnished", label: "Furnished", kind: "furnished" },
  { k: "carport", label: "Carport", kind: "bool" },
  { k: "dapur", label: "Dapur", kind: "bool" },
  { k: "alamat", label: "Alamat / lokasi", kind: "alamat", placeholder: "mis. Jl. Jatiwaringin Asri No.14" },
  { k: "biaya_listrik_nominal", label: "Listrik / bln", kind: "rupiah", placeholder: "200.000" },
  { k: "biaya_air_nominal", label: "Air / bln", kind: "rupiah", placeholder: "50.000" },
  { k: "biaya_ipl", label: "IPL / service / bln", kind: "rupiah", placeholder: "150.000" },
  { k: "kontak_owner", label: "Kontak owner", kind: "text", placeholder: "08xx…" },
];

const filled = (v: unknown) => v !== null && v !== undefined && v !== "";
const FURNISHED_LABEL: Record<string, string> = { furnished: "Furnished", semi: "Semi", unfurnished: "Unfurnished" };
const input = "w-full rounded-[9px] border-[1.5px] border-[#E4E3DF] bg-white px-3 py-2.5 text-[13.5px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-teal-700";
const fmtRupiah = (n: number | null) => (n == null ? "" : new Intl.NumberFormat("id-ID").format(n));
const parseRupiah = (s: string): number | null => { const d = s.replace(/\D/g, ""); return d === "" ? null : Number(d); };

export function SurveyClient({ initial }: { initial: SurveyInitial }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const emptyR: Record<Dim, number | null> = { kebersihan: null, kebisingan: null, parkir: null, owner: null, keamanan: null, kondisi_bangunan: null };
  const emptyT: Record<Dim, string[]> = { kebersihan: [], kebisingan: [], parkir: [], owner: [], keamanan: [], kondisi_bangunan: [] };
  const [ratings, setRatings] = useState<Record<Dim, number | null>>(initial.survey?.ratings ?? emptyR);
  const [tags, setTags] = useState<Record<Dim, string[]>>(initial.survey?.tags ?? emptyT);
  const [catatan, setCatatan] = useState(initial.survey?.catatan ?? "");
  const [patch, setPatch] = useState<Record<string, string | number | boolean | null>>({});

  // Foto survei — upload langsung (tanpa reload, agar isian form tak hilang).
  const [photos, setPhotos] = useState<Photo[]>(initial.photos);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [photoPending, photoStart] = useTransition();
  const [photoErr, setPhotoErr] = useState<string | null>(null);

  const uploadFiles = useCallback((files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    photoStart(async () => {
      setPhotoErr(null);
      for (const file of imgs) {
        const fd = new FormData();
        fd.set("candidateId", initial.id);
        fd.set("source", "survey");
        fd.set("file", file);
        const res = await uploadPhotoAction(fd);
        if (res.ok) setPhotos((p) => [...p, res.photo]);
        else { setPhotoErr(res.error); break; }
      }
    });
  }, [initial.id, photoStart]);

  const onPickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    uploadFiles(files);
  };

  // Tempel gambar dari clipboard (Ctrl/⌘+V) → upload. Hanya tangani bila clipboard berisi GAMBAR.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const imgs = Array.from(e.clipboardData?.items ?? [])
        .filter((it) => it.kind === "file" && it.type.startsWith("image/"))
        .map((it) => it.getAsFile())
        .filter((f): f is File => !!f);
      if (imgs.length) { e.preventDefault(); uploadFiles(imgs); }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [uploadFiles]);
  const removePhoto = (pid: string) =>
    photoStart(async () => {
      const r = await deletePhotoAction(pid);
      if (r.ok) setPhotos((p) => p.filter((x) => x.id !== pid));
    });

  const missing = FIELDS.filter((f) => !filled(initial.current[f.k as string]));

  const setPatchVal = (k: string, v: string | number | boolean | null) => setPatch((p) => ({ ...p, [k]: v }));
  const toggleTag = (d: Dim, t: string) => setTags((cur) => ({ ...cur, [d]: cur[d].includes(t) ? cur[d].filter((x) => x !== t) : [...cur[d], t] }));

  const save = () =>
    start(async () => {
      setError(null);
      setWarning(null);
      const payload: SurveyInput = {
        ratings,
        tags,
        catatan: catatan.trim() || null,
        dataPatch: patch as SurveyDataPatch,
      };
      const res = await saveSurveyAction(initial.id, payload);
      if (res.ok) {
        if (res.locationWarning) setWarning(res.locationWarning);
        else router.push(`/shortlist/${initial.id}`);
      } else setError(res.error);
    });

  return (
    <div className="min-h-screen bg-[#F4F3F0] pb-24">
      <nav className="sticky top-0 z-50 flex h-[54px] items-center gap-3.5 border-b border-[#E4E3DF] bg-white/95 px-4 backdrop-blur sm:px-6">
        <Link href={`/shortlist/${initial.id}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E4E3DF] px-3 py-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-[#F4F3F0] hover:text-zinc-900">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
          <span className="hidden sm:inline">Hunian</span>
        </Link>
        <span className="min-w-0 flex-1 truncate text-[15px] font-bold tracking-tight text-zinc-900">Survey: {initial.title}</span>
      </nav>

      <div className="mx-auto max-w-[720px] px-4 py-7 sm:px-6">
        <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight text-zinc-900">Hasil Survey Lapangan</h1>
        <p className="mb-5 text-[13.5px] text-zinc-500">Isi dari kunjungan langsung — melengkapi data yang belum ada <strong>dan</strong> menilai kondisi. Skor dihitung ulang otomatis (menambah aspek Kondisi &amp; Owner).</p>

        {/* AI ADVISOR — pertanyaan untuk pemilik (bantu sebelum/saat survei) */}
        <OwnerQuestions candidateId={initial.id} title={initial.title} />

        {/* PART A — Lengkapi data */}
        <div className="mb-4 overflow-hidden rounded-2xl border border-[#E4E3DF] bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-[#E4E3DF] bg-[#FAFAF9] px-5 py-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-teal-50 text-base">📋</span>
            <div>
              <div className="text-sm font-bold text-zinc-900">Lengkapi Data</div>
              <div className="text-xs text-zinc-500">{missing.length > 0 ? `${missing.length} field belum terisi dari listing` : "Semua data inti sudah lengkap"}</div>
            </div>
          </div>
          <div className="p-5">
            {missing.length === 0 ? (
              <p className="text-[13px] text-emerald-600">✓ Tidak ada yang perlu dilengkapi — langsung ke penilaian.</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {missing.map((f) => (
                  <div key={f.k as string} className={`flex flex-col gap-1.5 ${f.kind === "alamat" ? "sm:col-span-2" : ""}`}>
                    <span className="text-[12.5px] font-semibold text-zinc-700">{f.label}</span>
                    {f.kind === "furnished" ? (
                      <select className={input + " cursor-pointer"} value={(patch[f.k as string] as string) ?? ""} onChange={(e) => setPatchVal(f.k as string, (e.target.value || null) as FurnishedStatus | null)}>
                        <option value="">—</option>
                        {FURNISHED_STATUSES.map((s) => <option key={s} value={s}>{FURNISHED_LABEL[s]}</option>)}
                      </select>
                    ) : f.kind === "bool" ? (
                      <div className="flex gap-1.5">
                        {[{ v: true, t: "Ada" }, { v: false, t: "Tidak" }].map((o) => (
                          <button key={o.t} type="button" onClick={() => setPatchVal(f.k as string, o.v)} className={`flex-1 rounded-lg border-[1.5px] py-2 text-[13px] font-medium transition-colors ${patch[f.k as string] === o.v ? "border-teal-700 bg-teal-50 text-teal-700" : "border-[#E4E3DF] bg-white text-zinc-500"}`}>{o.t}</button>
                        ))}
                      </div>
                    ) : f.kind === "alamat" ? (
                      <LocationAutocomplete value={(patch[f.k as string] as string) ?? ""} onChange={(v) => setPatchVal(f.k as string, v || null)} placeholder={f.placeholder} className={input} autoResolve />
                    ) : f.kind === "rupiah" ? (
                      <div className="flex items-stretch overflow-hidden rounded-[9px] border-[1.5px] border-[#E4E3DF] focus-within:border-teal-700">
                        <span className="flex items-center border-r-[1.5px] border-[#E4E3DF] bg-[#FAFAF9] px-2.5 text-[13px] text-zinc-500">Rp</span>
                        <input className="min-w-0 flex-1 px-3 py-2.5 font-mono text-[13.5px] outline-none" inputMode="numeric" value={fmtRupiah((patch[f.k as string] as number) ?? null)} onChange={(e) => setPatchVal(f.k as string, parseRupiah(e.target.value))} placeholder={f.placeholder} />
                      </div>
                    ) : (
                      <input className={input} inputMode={f.kind === "int" ? "numeric" : "text"} type={f.kind === "int" ? "number" : "text"} value={(patch[f.k as string] as string | number) ?? ""} onChange={(e) => setPatchVal(f.k as string, f.kind === "int" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value || null)} placeholder={f.placeholder} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PART B — Penilaian */}
        <div className="overflow-hidden rounded-2xl border border-[#E4E3DF] bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-[#E4E3DF] bg-[#FAFAF9] px-5 py-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-amber-50 text-base">⭐</span>
            <div>
              <div className="text-sm font-bold text-zinc-900">Penilaian Survey</div>
              <div className="text-xs text-zinc-500">Beri bintang &amp; tag per aspek → menentukan aspek Kondisi &amp; Owner</div>
            </div>
          </div>
          <div className="divide-y divide-[#E4E3DF]">
            {DIMS.map((d) => (
              <div key={d.k} className="px-5 py-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[13.5px] font-semibold text-zinc-900">{d.emoji} {d.label}</span>
                  <Stars value={ratings[d.k]} onChange={(n) => setRatings((cur) => ({ ...cur, [d.k]: n }))} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {d.tags.map((t) => {
                    const on = tags[d.k].includes(t);
                    return (
                      <button key={t} type="button" onClick={() => toggleTag(d.k, t)} className={`rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors ${on ? "border-teal-700 bg-teal-50 text-teal-700" : "border-[#E4E3DF] bg-white text-zinc-500 hover:text-zinc-900"}`}>{t}</button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="px-5 py-4">
              <span className="mb-1.5 block text-[12.5px] font-semibold text-zinc-700">Catatan survei</span>
              <textarea className={input + " min-h-[72px] resize-y"} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Kesan keseluruhan, hal penting saat kunjungan…" />
            </div>
          </div>
        </div>

        {/* FOTO SURVEY — upload langsung (galeri / kamera) */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-[#E4E3DF] bg-white shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-[#E4E3DF] bg-[#FAFAF9] px-5 py-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-blue-50 text-base">📷</span>
            <div>
              <div className="text-sm font-bold text-zinc-900">Foto Survey</div>
              <div className="text-xs text-zinc-500">Galeri, foto langsung, atau tempel gambar (Ctrl/⌘+V)</div>
            </div>
          </div>
          <div className="p-5">
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={onPickPhoto} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={onPickPhoto} />
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {photos.map((p) => (
                <div key={p.id} className="group relative aspect-square overflow-hidden rounded-[10px] bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt="Foto survei" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => removePhoto(p.id)} disabled={photoPending} className="absolute right-1.5 top-1.5 hidden h-6 w-6 place-items-center rounded-md bg-black/55 text-[11px] text-white backdrop-blur hover:bg-black/80 group-hover:grid" aria-label="Hapus">✕</button>
                </div>
              ))}
              <div className="flex aspect-square flex-col gap-1.5">
                <button type="button" onClick={() => cameraRef.current?.click()} disabled={photoPending} className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[10px] border-2 border-dashed border-[#D1D0CC] bg-[#FAFAF9] text-zinc-400 transition-colors hover:border-teal-400 hover:text-teal-700 disabled:opacity-50">
                  <span className="text-base">📷</span><span className="text-[10px] font-semibold">Kamera</span>
                </button>
                <button type="button" onClick={() => galleryRef.current?.click()} disabled={photoPending} className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[10px] border-2 border-dashed border-[#D1D0CC] bg-[#FAFAF9] text-zinc-400 transition-colors hover:border-teal-400 hover:text-teal-700 disabled:opacity-50">
                  <span className="text-base">🖼️</span><span className="text-[10px] font-semibold">Galeri</span>
                </button>
              </div>
            </div>
            {photoPending && <p className="mt-2 text-[12px] text-zinc-500">Mengunggah foto…</p>}
            {photoErr && <p className="mt-2 text-[12px] text-rose-600">{photoErr}</p>}
            <p className="mt-2 text-[11px] text-zinc-400">Foto tersimpan langsung saat dipilih (tak perlu klik Simpan Survey).</p>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {warning && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Survei tersimpan, tapi <strong>skor lokasi gagal</strong>: {warning}
            <button onClick={() => router.push(`/shortlist/${initial.id}`)} className="mt-2 block font-semibold text-amber-900 underline">Lihat hunian →</button>
          </div>
        )}
      </div>

      {/* ACTION BAR */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-2.5 border-t border-[#E4E3DF] bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-zinc-900">Hasil survey</div>
          <div className="truncate text-xs text-zinc-500">Menambah aspek Kondisi &amp; Owner + lengkapi data</div>
        </div>
        <Link href={`/shortlist/${initial.id}`} className="shrink-0 rounded-[10px] border-[1.5px] border-[#E4E3DF] px-4 py-2.5 text-[13.5px] font-medium text-zinc-600 transition-colors hover:bg-[#F4F3F0]">Batal</Link>
        <button type="button" onClick={save} disabled={pending} className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] bg-teal-700 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">
          {pending ? "Menyimpan…" : "Simpan Survey"}
        </button>
      </div>
    </div>
  );
}

function Stars({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="text-[20px] leading-none transition-transform hover:scale-110" aria-label={`${n} bintang`}>
          <span className={value != null && n <= value ? "text-amber-400" : "text-zinc-300"}>★</span>
        </button>
      ))}
    </span>
  );
}
