"use client";

import { useEffect, useState } from "react";
import { PRIORITIES, PRIO_EMOJI, ALL_PRIORITY_IDS } from "./options";

const META: Record<string, { label: string; desc: string }> = Object.fromEntries(
  PRIORITIES.map((p) => [p.id, { label: p.label, desc: p.desc }]),
);

// State binary-insertion-sort: sisipkan tiap `pending` ke `sorted` (paling menentukan → paling tidak)
// lewat pertanyaan berpasangan. `lo/hi` = rentang pencarian biner di `sorted`.
type QuizState = { sorted: string[]; pending: string[]; lo: number; hi: number };

function initState(): QuizState {
  const ids = [...ALL_PRIORITY_IDS];
  return { sorted: [ids[0]], pending: ids.slice(1), lo: 0, hi: 1 };
}

// Terapkan jawaban: `higher` = true bila item baru LEBIH penting dari pembanding (sorted[mid]).
function answer(st: QuizState, higher: boolean): QuizState {
  const item = st.pending[0];
  const mid = Math.floor((st.lo + st.hi) / 2);
  let lo = st.lo;
  let hi = st.hi;
  if (higher) hi = mid; // lebih penting → cari di paruh atas (indeks lebih kecil)
  else lo = mid + 1; // kurang penting → paruh bawah
  if (lo >= hi) {
    // Posisi ditemukan → sisipkan, lanjut item berikutnya.
    const sorted = [...st.sorted.slice(0, lo), item, ...st.sorted.slice(lo)];
    const pending = st.pending.slice(1);
    return { sorted, pending, lo: 0, hi: sorted.length };
  }
  return { ...st, lo, hi };
}

const isDone = (st: QuizState) => st.pending.length === 0;

export function PriorityQuiz({ onComplete, onClose }: { onComplete: (ranked: string[]) => void; onClose: () => void }) {
  const [st, setSt] = useState<QuizState>(initState);
  const [count, setCount] = useState(1);

  // Selesai → kirim hasil & tutup.
  useEffect(() => {
    if (isDone(st)) onComplete(st.sorted);
  }, [st, onComplete]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  if (isDone(st)) return null;

  const item = st.pending[0];
  const mid = Math.floor((st.lo + st.hi) / 2);
  const other = st.sorted[mid];
  const pick = (higher: boolean) => { setSt((s) => answer(s, higher)); setCount((c) => c + 1); };

  const Card = ({ id, higher }: { id: string; higher: boolean }) => {
    const m = META[id];
    return (
      <button
        type="button"
        onClick={() => pick(higher)}
        className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-[1.5px] border-[#E4E3DF] bg-white px-4 py-6 text-center transition-all hover:-translate-y-0.5 hover:border-teal-600 hover:bg-teal-50 hover:shadow-md"
      >
        <span className="text-[34px] leading-none">{PRIO_EMOJI[id]}</span>
        <span className="text-[15px] font-bold text-zinc-900">{m.label}</span>
        <span className="text-[12px] leading-snug text-zinc-500">{m.desc}</span>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-[440px] rounded-2xl border border-[#E4E3DF] bg-[#F4F3F0] p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /></svg>
            Kuis prioritas · Pertanyaan {count}
          </span>
          <button type="button" onClick={onClose} aria-label="Tutup" className="grid h-7 w-7 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700">✕</button>
        </div>
        <h3 className="mb-4 text-[17px] font-extrabold tracking-tight text-zinc-900">Mana yang lebih penting buat kamu?</h3>

        <div className="flex items-stretch gap-3">
          <Card id={item} higher={true} />
          <span className="flex items-center text-[12px] font-bold text-zinc-400">atau</span>
          <Card id={other} higher={false} />
        </div>

        <p className="mt-4 text-center text-[11.5px] text-zinc-400">Tiap keputusan cuma dua pilihan — nanti kami susun urutannya otomatis.</p>
      </div>
    </div>
  );
}
