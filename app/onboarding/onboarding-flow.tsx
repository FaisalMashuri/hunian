"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveOnboarding } from "./actions";
import { LocationAutocomplete } from "./location-autocomplete";
import type { TransportMode } from "@/lib/types/db";
import { FadeIn } from "@/components/motion/motion";
import {
  BUDGET_MIN,
  BUDGET_MAX,
  BUDGET_STEP,
  TRANSPORTS,
  PRIORITIES,
  DEAL_BREAKERS,
  toggle,
} from "./options";

const STEP_TITLES = [
  "Berapa budget bulananmu?",
  "Ke mana kamu biasanya pergi?",
  "Apa yang paling penting bagimu?",
];

const rp = (n: number) => "Rp " + new Intl.NumberFormat("id-ID").format(n);
const pct = (v: number) => ((v - BUDGET_MIN) / (BUDGET_MAX - BUDGET_MIN)) * 100;

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [budgetIdeal, setBudgetIdeal] = useState(3_000_000);
  const [budgetMax, setBudgetMax] = useState(4_000_000);
  const [tujuan, setTujuan] = useState("");
  const [transportModes, setTransportModes] = useState<TransportMode[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [dealBreakers, setDealBreakers] = useState<string[]>([]);

  const setIdeal = (v: number) => {
    setBudgetIdeal(v);
    if (v > budgetMax) setBudgetMax(v);
  };
  const setMax = (v: number) => {
    setBudgetMax(v);
    if (v < budgetIdeal) setBudgetIdeal(v);
  };

  const canNext =
    step === 0
      ? budgetMax >= budgetIdeal
      : step === 1
        ? tujuan.trim().length > 0 && transportModes.length > 0
        : priorities.length > 0;

  const next = () => {
    setError(null);
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    startTransition(async () => {
      const res = await saveOnboarding({
        budgetIdeal,
        budgetMax,
        tujuan,
        transportModes,
        priorities,
        dealBreakers,
      });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Progress */}
      <div className="mx-auto w-full max-w-[520px] px-5 pt-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Langkah {step + 1} dari 3
          </span>
          {step > 0 && (
            <button
              onClick={() => {
                setError(null);
                setStep(step - 1);
              }}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-800"
            >
              ← Kembali
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-teal-700" : "bg-zinc-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Konten step */}
      <div className="mx-auto w-full max-w-[520px] flex-1 px-5 pb-32 pt-7">
        <FadeIn key={step} y={12}>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900">
            {STEP_TITLES[step]}
          </h1>

          {/* STEP 0 — Budget */}
          {step === 0 && (
            <div className="mt-2">
              <p className="text-[15px] leading-relaxed text-zinc-600">
                Tentukan rentang harga yang <span className="font-semibold text-zinc-800">nyaman</span>:
                ideal dan batas maksimal. Sewa tahunan atau per 6 bulan otomatis dikonversi ke per
                bulan supaya semua listing bisa dibandingkan apple-to-apple.
              </p>
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-zinc-500">Budget ideal / bulan</span>
                  <span className="text-lg font-extrabold text-teal-700">
                    {rp(budgetIdeal)}
                    <span className="text-xs font-normal text-zinc-400"> /bln</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={BUDGET_STEP}
                  value={budgetIdeal}
                  onChange={(e) => setIdeal(Number(e.target.value))}
                  className="mb-5 w-full accent-teal-700"
                />
                <div className="mb-1 flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-zinc-500">Budget maksimal / bulan</span>
                  <span className="text-lg font-extrabold text-zinc-900">
                    {rp(budgetMax)}
                    <span className="text-xs font-normal text-zinc-400"> /bln</span>
                  </span>
                </div>
                <input
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={BUDGET_STEP}
                  value={budgetMax}
                  onChange={(e) => setMax(Number(e.target.value))}
                  className="mb-5 w-full accent-zinc-900"
                />
                <div className="relative h-3 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="absolute inset-y-0 rounded-full bg-teal-200"
                    style={{
                      left: `${pct(budgetIdeal)}%`,
                      width: `${Math.max(0, pct(budgetMax) - pct(budgetIdeal))}%`,
                    }}
                  />
                </div>
                <p className="mt-2.5 text-xs leading-snug text-zinc-400">
                  Hunian akan menilai lebih positif listing yang harganya masuk di zona ini.
                </p>
              </div>
            </div>
          )}

          {/* STEP 1 — Tujuan + transport */}
          {step === 1 && (
            <div className="mt-2">
              <p className="text-[15px] leading-relaxed text-zinc-600">
                Lokasi tujuan utama dan cara kamu ke sana — untuk menilai kedekatan tiap hunian.
              </p>

              <label className="mt-6 block text-sm font-semibold text-zinc-700">
                Lokasi tujuan utama
              </label>
              <LocationAutocomplete
                value={tujuan}
                onChange={setTujuan}
                placeholder="mis. Kantor — Kuningan, Jaksel"
                className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-400 focus:border-teal-600"
              />
              <p className="mt-1.5 text-xs text-zinc-400">
                Jarak ke lokasi ini akan dipakai untuk menilai kedekatan tiap hunian yang kamu tambahkan.
              </p>

              <label className="mt-6 block text-sm font-semibold text-zinc-700">
                Moda transport <span className="font-normal text-zinc-400">(boleh lebih dari satu)</span>
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {TRANSPORTS.map((t) => {
                  const on = transportModes.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTransportModes(toggle(transportModes, t.id))}
                      className={`flex items-center gap-2.5 rounded-xl border-[1.5px] px-3.5 py-3 text-[15px] font-semibold transition-colors ${
                        on
                          ? "border-teal-600 bg-teal-50 text-teal-800"
                          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300"
                      }`}
                    >
                      <span className="text-lg" aria-hidden>
                        {t.icon}
                      </span>
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2 — Prioritas + deal breaker */}
          {step === 2 && (
            <div className="mt-2">
              <p className="text-[15px] leading-relaxed text-zinc-600">
                Pilih apa yang paling penting bagimu — ini akan memengaruhi cara Hunian menilai tiap
                pilihan hunian.
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                {PRIORITIES.map((p) => {
                  const on = priorities.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPriorities(toggle(priorities, p.id))}
                      className={`flex items-center justify-between gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 text-left transition-colors ${
                        on
                          ? "border-teal-600 bg-teal-50"
                          : "border-zinc-200 bg-white hover:border-zinc-300"
                      }`}
                    >
                      <span className="min-w-0">
                        <span
                          className={`block text-base font-semibold ${on ? "text-teal-900" : "text-zinc-900"}`}
                        >
                          {p.label}
                        </span>
                        <span className="block text-[13px] text-zinc-500">{p.desc}</span>
                      </span>
                      <span
                        className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 text-xs ${
                          on ? "border-teal-600 bg-teal-600 text-white" : "border-zinc-300 text-transparent"
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                    </button>
                  );
                })}
              </div>

              <h2 className="mt-8 text-lg font-bold tracking-tight text-zinc-900">Deal breaker</h2>
              <p className="mt-1 text-sm text-zinc-600">
                Hunian yang melanggar akan <strong className="font-semibold">ditandai</strong>, bukan
                otomatis dihapus. Opsional.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {DEAL_BREAKERS.map((db) => {
                  const on = dealBreakers.includes(db.id);
                  return (
                    <button
                      key={db.id}
                      onClick={() => setDealBreakers(toggle(dealBreakers, db.id))}
                      className={`inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-sm font-medium transition-colors ${
                        on
                          ? "border-amber-500 bg-amber-50 text-amber-800"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      }`}
                    >
                      <span aria-hidden>{on ? "⚑" : "+"}</span>
                      {db.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>
          )}
        </FadeIn>
      </div>

      {/* CTA sticky */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-gradient-to-t from-stone-50 via-stone-50/95 to-transparent px-5 pb-6 pt-8">
        <div className="mx-auto max-w-[520px]">
          <button
            onClick={next}
            disabled={!canNext || pending}
            className="inline-flex h-[52px] w-full items-center justify-center rounded-xl bg-teal-700 text-base font-semibold text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending
              ? "Menyimpan…"
              : step === 0
                ? "Simpan Budget →"
                : step === 1
                  ? "Simpan Tujuan →"
                  : "Mulai Pakai Hunian →"}
          </button>
        </div>
      </div>
    </div>
  );
}
