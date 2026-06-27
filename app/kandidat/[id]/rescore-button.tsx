"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { rescoreCandidateAction } from "./actions";

export function RescoreButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [warning, setWarning] = useState<string | null>(null);

  const run = () =>
    start(async () => {
      setWarning(null);
      const res = await rescoreCandidateAction(id);
      if (res.ok) setWarning(res.locationWarning ?? null);
      else setWarning(res.error);
      router.refresh();
    });

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-stone-50 disabled:opacity-50"
      >
        {pending ? "Menghitung…" : "↻ Hitung ulang"}
      </button>
      {warning && <p className="mt-1 max-w-[240px] text-xs text-amber-700">⚠ {warning}</p>}
    </div>
  );
}
