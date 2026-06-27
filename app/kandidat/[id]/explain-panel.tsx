"use client";

import { useState, useTransition } from "react";
import { explainAction } from "./actions";

export function ExplainPanel({ candidateId }: { candidateId: string }) {
  const [pending, start] = useTransition();
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () =>
    start(async () => {
      setError(null);
      const res = await explainAction(candidateId);
      if (res.ok) setText(res.text);
      else setError(res.error);
    });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Penjelasan AI
        </h2>
        <button
          onClick={run}
          disabled={pending}
          className="rounded-lg border border-teal-700 px-3 py-1.5 text-xs font-semibold text-teal-700 transition-colors hover:bg-teal-50 disabled:opacity-40"
        >
          {pending ? "Menyusun…" : text ? "Buat ulang" : "✦ Jelaskan skor"}
        </button>
      </div>

      {text && (
        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-700">{text}</p>
      )}
      {!text && !error && (
        <p className="mt-3 text-sm text-zinc-400">
          AI menjelaskan skor dalam bahasa natural — faktor pendukung + yang belum diketahui. Skor
          tetap dihitung rule, bukan AI.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
