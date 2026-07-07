"use client";

import { useState } from "react";
import { PRIORITIES, PRIO_EMOJI, RANK_WEIGHTS, moveRank, normalizeRanking, rankingSentence } from "./options";
import { PriorityQuiz } from "./priority-quiz";

const META: Record<string, { label: string; desc: string }> = Object.fromEntries(
  PRIORITIES.map((p) => [p.id, { label: p.label, desc: p.desc }]),
);

// Ranking prioritas — susun urutan aspek dari paling menentukan (atas) ke paling tidak (bawah).
// Panah ↑↓ = jalur utama (jelas di HP); drag = bonus (desktop). Bobot % kecil & sekunder.
export function PriorityRanking({ value, onChange }: { value: string[]; onChange: (next: string[]) => void }) {
  const ranked = normalizeRanking(value);
  const [dragId, setDragId] = useState<string | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);

  const move = (id: string, dir: -1 | 1) => onChange(moveRank(ranked, id, dir));
  const dropOn = (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); return; }
    const next = ranked.filter((x) => x !== dragId);
    next.splice(next.indexOf(targetId), 0, dragId);
    onChange(next);
    setDragId(null);
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        {ranked.map((id, i) => {
          const m = META[id];
          const pct = Math.round((RANK_WEIGHTS[i] ?? 0) * 100);
          const first = i === 0;
          const last = i === ranked.length - 1;
          return (
            <div
              key={id}
              draggable
              onDragStart={() => setDragId(id)}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dropOn(id)}
              className={`flex items-center gap-3 rounded-2xl border-[1.5px] bg-white px-3 py-2.5 transition-colors sm:px-3.5 sm:py-3 ${dragId === id ? "border-teal-400 opacity-50" : "border-[#E4E3DF]"}`}
            >
              <span className="grid h-7 w-7 shrink-0 cursor-grab place-items-center rounded-full bg-teal-700 text-[13px] font-bold text-white" title="Tarik untuk memindah">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-zinc-900">{PRIO_EMOJI[id]} {m.label}</span>
                <span className="block text-[12px] text-zinc-500">{m.desc}</span>
                <span className="mt-1.5 flex items-center gap-2">
                  <span className="h-1 w-full max-w-[130px] overflow-hidden rounded-full bg-[#F0EFEB]"><span className="block h-full rounded-full bg-teal-500/80" style={{ width: `${pct}%` }} /></span>
                  <span className="text-[10.5px] font-medium tabular-nums text-zinc-400">{pct}%</span>
                </span>
              </span>
              <span className="flex shrink-0 flex-col gap-1">
                <button type="button" onClick={() => move(id, -1)} disabled={first} aria-label="Naikkan prioritas" className="grid h-7 w-7 place-items-center rounded-lg border border-[#E4E3DF] text-zinc-500 transition-colors hover:bg-[#F4F3F0] hover:text-zinc-900 disabled:opacity-30">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m18 15-6-6-6 6" /></svg>
                </button>
                <button type="button" onClick={() => move(id, 1)} disabled={last} aria-label="Turunkan prioritas" className="grid h-7 w-7 place-items-center rounded-lg border border-[#E4E3DF] text-zinc-500 transition-colors hover:bg-[#F4F3F0] hover:text-zinc-900 disabled:opacity-30">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
                </button>
              </span>
            </div>
          );
        })}
      </div>

      {/* Konsekuensi ranking dalam bahasa manusia — update tiap geser */}
      <p className="mt-3 flex items-start gap-2 rounded-xl bg-teal-50 px-3.5 py-2.5 text-[13px] leading-relaxed text-teal-800">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
        <span>{rankingSentence(ranked)}</span>
      </p>

      <button
        type="button"
        onClick={() => setQuizOpen(true)}
        className="group mt-3 flex w-full items-center gap-3 rounded-xl border border-teal-200 bg-gradient-to-r from-teal-50 to-white px-3.5 py-2.5 text-left transition-all hover:border-teal-300 hover:from-teal-100 hover:shadow-sm"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-500 text-white shadow-sm">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" /><path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" /></svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-bold text-teal-900">Masih bingung mengurutkan?</span>
          <span className="block text-[11.5px] text-teal-700/80">Jawab beberapa &ldquo;A atau B&rdquo; — biar kami susun otomatis</span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-teal-500 transition-transform group-hover:translate-x-0.5" aria-hidden><path d="m9 18 6-6-6-6" /></svg>
      </button>

      {quizOpen && (
        <PriorityQuiz
          onComplete={(r) => { onChange(r); setQuizOpen(false); }}
          onClose={() => setQuizOpen(false)}
        />
      )}
    </div>
  );
}
