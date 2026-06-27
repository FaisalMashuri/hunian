"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStatusAction, deleteCandidateAction } from "./actions";
import { CANDIDATE_STATUSES, type CandidateStatus } from "@/lib/types/db";

const LABELS: Record<CandidateStatus, string> = {
  tersedia: "Tersedia",
  sudah_disurvey: "Disurvey",
  sudah_tersewa: "Tersewa",
};

export function StatusChanger({
  candidateId,
  status,
}: {
  candidateId: string;
  status: CandidateStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const change = (s: CandidateStatus) =>
    start(async () => {
      await updateStatusAction(candidateId, s);
      router.refresh();
    });

  const remove = () =>
    start(async () => {
      await deleteCandidateAction(candidateId);
      router.push("/kandidat");
    });

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">Status</h2>
      <div className="mt-3 flex gap-1 rounded-xl border border-zinc-200 bg-stone-50 p-1">
        {CANDIDATE_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => change(s)}
            disabled={pending}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-colors disabled:opacity-50 ${
              status === s ? "bg-teal-700 text-white" : "text-zinc-600 hover:bg-white"
            }`}
          >
            {LABELS[s]}
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-zinc-100 pt-4">
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600">Hapus kandidat ini?</span>
            <button
              onClick={remove}
              disabled={pending}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
            >
              Ya, hapus
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800"
            >
              Batal
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-sm font-medium text-rose-600 hover:underline"
          >
            Hapus kandidat
          </button>
        )}
      </div>
    </div>
  );
}
