"use client";

import { useMemo, useState, useTransition } from "react";
import { suggestOwnerQuestionsAction, type QuestionGroup } from "./actions";

export function OwnerQuestions({ candidateId, title }: { candidateId: string; title: string }) {
  const [pending, start] = useTransition();
  const [groups, setGroups] = useState<QuestionGroup[] | null>(null);
  const [fromAI, setFromAI] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const total = useMemo(() => (groups ?? []).reduce((n, g) => n + g.questions.length, 0), [groups]);

  const run = () =>
    start(async () => {
      setError(null);
      const res = await suggestOwnerQuestionsAction(candidateId);
      if (res.ok) { setGroups(res.groups); setFromAI(res.fromAI); setChecked(new Set()); }
      else setError(res.error);
    });

  const toggle = (key: string) =>
    setChecked((prev) => { const n = new Set(prev); if (n.has(key)) n.delete(key); else n.add(key); return n; });

  const copyAll = async () => {
    if (!groups) return;
    const text = `Pertanyaan untuk pemilik — ${title}\n\n` +
      groups.map((g) => `${g.category}\n` + g.questions.map((q) => `- ${q}`).join("\n")).join("\n\n");
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard tak tersedia */ }
  };

  return (
    <div className="mb-4 overflow-hidden rounded-2xl border border-teal-200 bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-teal-100 bg-gradient-to-r from-teal-50 to-[#FAFAF9] px-5 py-4">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-teal-600/10 text-base">✦</span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-zinc-900">Tanyakan ke Pemilik</div>
          <div className="text-xs text-zinc-500">AI menyusun pertanyaan penting sesuai hunian ini — jangan sampai lupa nanya pas survei.</div>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="shrink-0 rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50 disabled:opacity-40"
        >
          {pending ? "Menyusun…" : groups ? "Buat ulang" : "✦ Susun pertanyaan"}
        </button>
      </div>

      <div className="p-5">
        {!groups && !error && (
          <p className="text-[13px] text-zinc-500">
            Klik <strong>Susun pertanyaan</strong> — AI melihat data yang masih kosong &amp; deal breaker-mu, lalu bikin daftar pertanyaan siap ucap. Bisa dicentang saat kamu bertanya, dan disalin ke WA/catatan.
          </p>
        )}
        {error && <p className="text-[13px] text-rose-600">{error}</p>}

        {groups && (
          <>
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[12px] font-semibold text-zinc-500">{total} pertanyaan · {checked.size} ditanyakan</span>
              {!fromAI && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-semibold text-amber-700">daftar standar (AI tak tersedia)</span>}
              <button type="button" onClick={copyAll} className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[#E4E3DF] px-2.5 py-1 text-[12px] font-medium text-zinc-600 transition-colors hover:bg-[#F4F3F0]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                {copied ? "Tersalin ✓" : "Salin semua"}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {groups.map((g, gi) => (
                <div key={gi}>
                  <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700">{g.category}</div>
                  <ul className="flex flex-col gap-1">
                    {g.questions.map((q, qi) => {
                      const key = `${gi}:${qi}`;
                      const on = checked.has(key);
                      return (
                        <li key={qi}>
                          <button type="button" onClick={() => toggle(key)} className="flex w-full items-start gap-2.5 rounded-lg px-1.5 py-1 text-left transition-colors hover:bg-[#F4F3F0]">
                            <span className={`mt-[1px] grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border-2 text-[11px] font-bold text-white transition-colors ${on ? "border-teal-600 bg-teal-600" : "border-zinc-300 bg-white"}`}>{on ? "✓" : ""}</span>
                            <span className={`text-[13px] leading-relaxed ${on ? "text-zinc-400 line-through" : "text-zinc-700"}`}>{q}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-zinc-400">Centang hanya pengingat sementara (tak ikut tersimpan). AI membantu mengingatkan — bukan menilai hunian.</p>
          </>
        )}
      </div>
    </div>
  );
}
