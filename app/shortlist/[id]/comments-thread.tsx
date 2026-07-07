"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCommentAction, deleteCommentAction } from "./comment-actions";

export type CommentItem = {
  id: string;
  body: string;
  createdAt: string;
  authorName: string;
  isMine: boolean;
};

function initialOf(name: string) {
  return (name || "?").charAt(0).toUpperCase();
}

function fmt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function CommentsThread({ candidateId, comments }: { candidateId: string; comments: CommentItem[] }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const send = () => {
    if (!body.trim()) return;
    setErr(null);
    start(async () => {
      const r = await addCommentAction(candidateId, body);
      if (!r.ok) { setErr(r.error); return; }
      setBody("");
      router.refresh();
    });
  };

  const remove = (id: string) => {
    start(async () => {
      const r = await deleteCommentAction(id);
      if (r.ok) router.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-[#E4E3DF] bg-white p-5 shadow-sm">
      {comments.length === 0 ? (
        <p className="text-[13px] text-zinc-500">Belum ada diskusi. Mulai obrolan tentang hunian ini dengan partnermu.</p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-2.5">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[13px] font-bold ${c.isMine ? "bg-teal-100 text-teal-700" : "bg-violet-100 text-violet-700"}`}>
                {initialOf(c.authorName)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold text-zinc-900">{c.isMine ? "Kamu" : c.authorName}</span>
                  <span className="text-[11px] text-zinc-400">{fmt(c.createdAt)}</span>
                  {c.isMine && (
                    <button
                      type="button"
                      onClick={() => remove(c.id)}
                      disabled={pending}
                      className="ml-auto text-[11px] text-zinc-400 transition-colors hover:text-rose-600 disabled:opacity-50"
                    >
                      Hapus
                    </button>
                  )}
                </div>
                <p className="mt-0.5 whitespace-pre-line break-words text-[13px] leading-relaxed text-zinc-700">{c.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 border-t border-[#E4E3DF] pt-3.5">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send(); }}
          rows={2}
          placeholder="Tulis pesan untuk partnermu… (⌘/Ctrl+Enter untuk kirim)"
          className="w-full resize-y rounded-xl border border-[#E4E3DF] bg-[#FAFAF9] px-3.5 py-2.5 text-[13.5px] text-zinc-900 outline-none transition-colors focus:border-teal-500 focus:bg-white"
        />
        {err && <p className="mt-1.5 text-[12px] text-rose-600">{err}</p>}
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={send}
            disabled={pending || !body.trim()}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-teal-700 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-50"
          >
            {pending ? "Mengirim…" : "Kirim"}
          </button>
        </div>
      </div>
    </div>
  );
}
