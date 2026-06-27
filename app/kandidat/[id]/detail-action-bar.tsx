"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateStatusAction } from "./actions";

// Footer aksi tetap (mepet ujung). Di HP duduk DI ATAS bottom-nav (bottom-16), di desktop offset sidebar (sm:left-64).
// "Update Survey" (S2-2) = link ke /survey. Sisihkan = arsipkan (status sudah_tersewa). Bandingkan = ke /bandingkan?ids=.
export function DetailActionBar({
  id,
  title,
  score,
  verdictLabel,
  daysLeft,
  archived,
  surveyed,
}: {
  id: string;
  title: string;
  score: number | null;
  verdictLabel: string;
  daysLeft: number | null;
  archived: boolean;
  surveyed: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const setStatus = (status: "tersedia" | "sudah_tersewa") =>
    startTransition(async () => {
      setErr(null);
      const r = await updateStatusAction(id, status);
      if (!r.ok) setErr(r.error);
      else router.refresh();
    });

  const sub = [
    score != null && `Skor ${Math.round(score)}`,
    verdictLabel,
    daysLeft != null && `${daysLeft} hari tersisa`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="fixed inset-x-0 bottom-16 z-30 border-t border-[#E4E3DF] bg-white/96 px-4 py-2.5 backdrop-blur sm:bottom-0 sm:px-6">
      <div className="mx-auto flex max-w-[1200px] items-center gap-2.5">
        <div className="mr-auto flex min-w-0 flex-col">
          <span className="truncate text-[13px] font-bold text-zinc-900 sm:text-sm">{title}</span>
          {(sub || err) && (
            <span className={`truncate text-[11px] ${err ? "text-rose-600" : "text-zinc-500"}`}>{err ?? sub}</span>
          )}
        </div>

        {archived ? (
          <button
            type="button"
            onClick={() => setStatus("tersedia")}
            disabled={pending}
            className="shrink-0 rounded-[10px] border border-[#E4E3DF] bg-white px-3.5 py-2 text-[13px] font-semibold text-zinc-700 transition-colors hover:bg-[#F4F3F0] disabled:opacity-50 sm:px-5"
          >
            Pulihkan
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStatus("sudah_tersewa")}
            disabled={pending}
            className="shrink-0 rounded-[10px] border border-rose-200 bg-white px-3 py-2 text-[13px] font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 sm:px-5"
          >
            Sisihkan
          </button>
        )}

        <Link
          href={`/kandidat/${id}/survey`}
          className="hidden shrink-0 items-center gap-1.5 rounded-[10px] border border-[#E4E3DF] bg-white px-3.5 py-2 text-[13px] font-semibold text-zinc-700 transition-colors hover:bg-[#F4F3F0] sm:inline-flex sm:px-5"
        >
          {surveyed ? "Edit Survey" : "Update Survey"}
        </Link>

        <button
          type="button"
          onClick={() => router.push(`/bandingkan?ids=${id}`)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] bg-teal-700 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-teal-800 sm:px-5"
        >
          Bandingkan
          <span aria-hidden>→</span>
        </button>
      </div>
    </div>
  );
}
