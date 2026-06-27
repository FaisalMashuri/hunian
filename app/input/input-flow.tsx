"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { extractAction, saveCandidate } from "./actions";
import { EMPTY_DRAFT, type ExtractedDraft } from "@/lib/extraction/types";
import type { PropertyType } from "@/lib/types/db";
import { sourceFromDraft, type SourceMap } from "./input-shared";
import { cleanTypeData, type TypeData, type TSValue } from "./type-specific";
import { PasteCard } from "./paste-card";
import { TypeSelector } from "./type-selector";
import { ManualForms } from "./manual-forms";
import { ReviewList } from "./review-list";
import { Success } from "./success";

type Mode = "paste" | "manual";
type Step = "input" | "review" | "success";

export function InputFlow() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [step, setStep] = useState<Step>("input");
  const [mode, setMode] = useState<Mode>("paste");
  const [propertyType, setPropertyType] = useState<PropertyType>("kontrakan");
  const [pasteText, setPasteText] = useState("");
  const [draft, setDraft] = useState<ExtractedDraft>(EMPTY_DRAFT);
  const [typeData, setTypeData] = useState<TypeData>({});
  const [source, setSource] = useState<SourceMap>({});
  const [manualDistanceKm, setManualDistanceKm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);

  const set = <K extends keyof ExtractedDraft>(k: K, v: ExtractedDraft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const setTS = (k: string, v: TSValue) => setTypeData((d) => ({ ...d, [k]: v }));
  const markManual = (k: keyof ExtractedDraft) => setSource((s) => ({ ...s, [k]: "manual" }));

  const reset = () => {
    setStep("input");
    setMode("paste");
    setPropertyType("kontrakan");
    setPasteText("");
    setDraft(EMPTY_DRAFT);
    setTypeData({});
    setSource({});
    setManualDistanceKm("");
    setError(null);
    setSavedId(null);
    setLocationWarning(null);
  };

  const mainAction = () => {
    setError(null);
    if (step === "input") {
      if (mode === "paste") {
        if (!pasteText.trim()) { setError("Tempel deskripsi listing dulu ya."); return; }
        startTransition(async () => {
          const res = await extractAction(pasteText);
          if (res.ok) {
            setDraft(res.draft);
            setPropertyType(res.propertyType);
            setTypeData(res.typeData);
            setSource(sourceFromDraft(res.draft, "ai"));
            setStep("review");
            window.scrollTo(0, 0);
          } else setError(res.error);
        });
      } else {
        if (!draft.title?.trim()) { setError("Nama kandidat wajib diisi."); return; }
        if (!draft.harga_asli || draft.harga_asli <= 0) { setError("Harga sewa wajib diisi (lebih dari 0)."); return; }
        setSource(sourceFromDraft(draft, "manual"));
        setStep("review");
        window.scrollTo(0, 0);
      }
    } else if (step === "review") {
      startTransition(async () => {
        const km = Number(manualDistanceKm);
        const res = await saveCandidate(draft, mode === "paste" ? pasteText : null, {
          manualDistanceKm: Number.isFinite(km) && km > 0 ? km : null,
          propertyType,
          typeData: cleanTypeData(propertyType, typeData),
        });
        if (res.ok) {
          setSavedId(res.id);
          setLocationWarning(res.locationWarning ?? null);
          setStep("success");
          window.scrollTo(0, 0);
        } else setError(res.error);
      });
    }
  };

  // ── Label action bar kontekstual
  const bar = (() => {
    if (step === "review") return { title: "Periksa hasil ekstraksi", sub: "Ketuk baris untuk koreksi; field ⚠ sebaiknya dilengkapi", label: pending ? "Menyimpan…" : "Simpan Kandidat →" };
    if (mode === "paste") {
      const n = pasteText.length;
      return {
        title: n === 0 ? "Tempel deskripsi dulu" : `${n.toLocaleString("id-ID")} karakter siap diekstrak`,
        sub: n === 0 ? "Copy teks dari WhatsApp, OLX, atau mana saja" : "AI akan membaca dan mengisi form otomatis",
        label: pending ? "Mengekstrak…" : "Ekstrak & Lanjut →",
      };
    }
    const TYPE_LABEL: Record<PropertyType, string> = { kontrakan: "Kontrakan", apartemen: "Apartemen", kost: "Kost" };
    return {
      title: `Isi form ${TYPE_LABEL[propertyType]}`,
      sub: "Lengkapi field wajib lalu lanjut",
      label: "Lanjut ke Review →",
    };
  })();

  const mainDisabled = pending || (step === "input" && mode === "paste" && !pasteText.trim());

  return (
    <div className="min-h-screen bg-[#F4F3F0] pb-36 sm:pb-24">
      {/* TOPNAV + STEPPER */}
      <nav className="sticky top-0 z-50 flex h-[54px] items-center gap-2 border-b border-[#E4E3DF] bg-white/95 px-3 backdrop-blur sm:gap-3.5 sm:px-6">
        <Link href="/kandidat" className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E4E3DF] px-2.5 py-1.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-[#F4F3F0] hover:text-zinc-900 sm:px-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
          <span className="hidden sm:inline">Kandidat</span>
        </Link>
        <div className="flex flex-1 items-center justify-center gap-1.5 sm:gap-2">
          <StepItem n={1} label="Input" state={step === "input" ? "active" : "done"} />
          <StepSep />
          <StepItem n={2} label="Review" state={step === "review" ? "active" : step === "success" ? "done" : "idle"} />
          <StepSep />
          <StepItem n={3} label="Selesai" state={step === "success" ? "active" : "idle"} />
        </div>
        <span className="hidden w-[84px] shrink-0 sm:block" />
      </nav>

      {/* CONTENT */}
      {step === "success" && savedId ? (
        <div className="mx-auto max-w-[720px] px-4 py-7 sm:px-6">
          <Success title={draft.title ?? "Kandidat"} id={savedId} locationWarning={locationWarning} onAddAnother={reset} />
        </div>
      ) : (
        <div className="mx-auto max-w-[720px] px-4 py-7 sm:px-6">
          {step === "input" ? (
            <>
              <h1 className="mb-1.5 text-center text-[22px] font-extrabold tracking-tight text-zinc-900 sm:text-left">Tambah Kandidat Baru</h1>
              <p className="mb-5 text-center text-[13.5px] text-zinc-500 sm:text-left">Masukkan informasi hunian yang ingin kamu evaluasi.</p>

              {/* TAB SWITCHER */}
              <div className="mb-5 flex gap-1 rounded-xl border border-[#E4E3DF] bg-white p-1 shadow-sm">
                <button type="button" onClick={() => setMode("paste")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-[9px] px-2 py-2 text-[13.5px] font-semibold transition-colors ${mode === "paste" ? "bg-teal-700 text-white shadow" : "text-zinc-500 hover:bg-[#FAFAF9] hover:text-zinc-900"}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /></svg>
                  <span className="flex flex-col items-center leading-tight sm:flex-row sm:gap-1.5">
                    <span>Copy Deskripsi</span>
                    <span className="text-[10.5px] font-medium opacity-80 sm:text-[11px]">(Direkomendasikan)</span>
                  </span>
                </button>
                <button type="button" onClick={() => setMode("manual")} className={`flex flex-1 items-center justify-center gap-1.5 rounded-[9px] py-2.5 text-[13.5px] font-semibold transition-colors ${mode === "manual" ? "bg-teal-700 text-white shadow" : "text-zinc-500 hover:bg-[#FAFAF9] hover:text-zinc-900"}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  Isi Manual
                </button>
              </div>

              {mode === "paste" ? (
                <PasteCard value={pasteText} onChange={setPasteText} loading={pending} />
              ) : (
                <>
                  <TypeSelector value={propertyType} onChange={setPropertyType} />
                  <ManualForms propertyType={propertyType} draft={draft} set={set} typeData={typeData} setTS={setTS} />
                </>
              )}
            </>
          ) : (
            <>
              <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight text-zinc-900">Cek Hasil Ekstraksi</h1>
              <p className="mb-4 text-[13.5px] text-zinc-500">Ketuk baris mana saja untuk mengoreksi. Tanda ⚠ artinya perlu dilengkapi.</p>
              <ReviewList mode={mode} draft={draft} set={set} source={source} markManual={markManual} manualDistanceKm={manualDistanceKm} setManualDistanceKm={setManualDistanceKm} propertyType={propertyType} setPropertyType={setPropertyType} typeData={typeData} />
            </>
          )}

          {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        </div>
      )}

      {/* ACTION BAR */}
      {step !== "success" && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E4E3DF] bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-[720px] flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-2.5">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold text-zinc-900">{bar.title}</div>
              <div className="truncate text-xs text-zinc-500">{bar.sub}</div>
            </div>
            <div className="flex items-center gap-2.5">
              {step === "review" && (
                <button type="button" onClick={() => { setError(null); setStep("input"); }} className="shrink-0 rounded-[10px] border-[1.5px] border-[#E4E3DF] px-4 py-2.5 text-[13.5px] font-medium text-zinc-600 transition-colors hover:bg-[#F4F3F0]">
                  <span className="sm:hidden">← Ubah</span>
                  <span className="hidden sm:inline">← Ubah Input</span>
                </button>
              )}
              <button type="button" onClick={mainAction} disabled={mainDisabled} className="inline-flex flex-1 shrink-0 items-center justify-center gap-1.5 rounded-[10px] bg-teal-700 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none">
                {bar.label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StepItem({ n, label, state }: { n: number; label: string; state: "active" | "done" | "idle" }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${state === "active" ? "font-bold text-teal-700" : state === "done" ? "font-semibold text-emerald-600" : "text-zinc-400"}`}>
      <span className={`grid h-[22px] w-[22px] place-items-center rounded-full border-[1.5px] text-[10.5px] font-bold ${state === "active" ? "border-teal-700 bg-teal-700 text-white" : state === "done" ? "border-emerald-600 bg-emerald-600 text-white" : "border-[#E4E3DF] bg-[#F4F3F0] text-zinc-400"}`}>
        {state === "done" ? "✓" : n}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

function StepSep() {
  return <span className="h-[1.5px] w-6 bg-[#E4E3DF]" />;
}
