"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ManualForms } from "@/app/input/manual-forms";
import { cleanTypeData, type TypeData, type TSValue } from "@/app/input/type-specific";
import { updateCandidateAction } from "../actions";
import type { ExtractedDraft } from "@/lib/extraction/types";
import type { PropertyType } from "@/lib/types/db";

export function EditCandidate({ id, initial, propertyType, typeData: initialTypeData }: { id: string; initial: ExtractedDraft; propertyType: PropertyType; typeData: TypeData }) {
  const router = useRouter();
  const [draft, setDraft] = useState<ExtractedDraft>(initial);
  const [typeData, setTypeData] = useState<TypeData>(initialTypeData);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const set = <K extends keyof ExtractedDraft>(k: K, v: ExtractedDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const setTS = (k: string, v: TSValue) => setTypeData((d) => ({ ...d, [k]: v }));

  const save = () =>
    start(async () => {
      setError(null);
      setWarning(null);
      const res = await updateCandidateAction(id, draft, { typeData: cleanTypeData(propertyType, typeData) });
      if (res.ok) {
        if (res.locationWarning) setWarning(res.locationWarning);
        else router.push(`/kandidat/${id}`);
      } else {
        setError(res.error);
      }
    });

  return (
    <div className="min-h-screen bg-[#F4F3F0] pb-24">
      {/* TOPNAV — selaras /input & detail page */}
      <nav className="sticky top-0 z-50 flex h-[54px] items-center gap-3.5 border-b border-[#E4E3DF] bg-white/95 px-4 backdrop-blur sm:px-6">
        <Link href={`/kandidat/${id}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E4E3DF] px-3 py-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-[#F4F3F0] hover:text-zinc-900">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
          <span className="hidden sm:inline">Kandidat</span>
        </Link>
        <span className="min-w-0 flex-1 truncate text-[15px] font-bold tracking-tight text-zinc-900">Edit Kandidat</span>
      </nav>

      <div className="mx-auto max-w-[720px] px-4 py-7 sm:px-6">
        <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight text-zinc-900">Edit Kandidat</h1>
        <p className="mb-5 text-[13.5px] text-zinc-500">Perbarui data kandidat. Skor &amp; jarak dihitung ulang otomatis setelah simpan.</p>

        <ManualForms propertyType={propertyType} draft={draft} set={set} typeData={typeData} setTS={setTS} />

        {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        {warning && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Perubahan tersimpan, tapi <strong>skor lokasi gagal</strong>: {warning}
            <button onClick={() => router.push(`/kandidat/${id}`)} className="mt-2 block font-semibold text-amber-900 underline">Lihat kandidat →</button>
          </div>
        )}
      </div>

      {/* ACTION BAR — selaras /input */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex items-center gap-2.5 border-t border-[#E4E3DF] bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-zinc-900">Edit kandidat</div>
          <div className="truncate text-xs text-zinc-500">Skor &amp; jarak dihitung ulang setelah simpan</div>
        </div>
        <Link href={`/kandidat/${id}`} className="shrink-0 rounded-[10px] border-[1.5px] border-[#E4E3DF] px-4 py-2.5 text-[13.5px] font-medium text-zinc-600 transition-colors hover:bg-[#F4F3F0]">Batal</Link>
        <button type="button" onClick={save} disabled={pending} className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] bg-teal-700 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">
          {pending ? "Menyimpan…" : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
