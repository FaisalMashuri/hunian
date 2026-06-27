"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordNoteAction } from "./actions";

// S2-3: tambah catatan manual ke timeline.
export function TimelineNote({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const submit = () =>
    start(async () => {
      setErr(null);
      const r = await recordNoteAction(id, text);
      if (r.ok) { setText(""); setOpen(false); router.refresh(); }
      else setErr(r.error);
    });

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-[12.5px] font-semibold text-teal-700 hover:underline">
        + Tambah catatan manual
      </button>
    );
  }

  return (
    <div>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="mis. Telepon owner — bersedia survey Sabtu; mau nego harga…"
        className="min-h-[64px] w-full resize-y rounded-xl border-[1.5px] border-[#E4E3DF] bg-white px-3 py-2 text-[13px] text-zinc-900 outline-none focus:border-teal-700"
      />
      {err && <p className="mt-1 text-[11px] text-rose-600">{err}</p>}
      <div className="mt-2 flex items-center gap-2">
        <button type="button" onClick={submit} disabled={pending || !text.trim()} className="rounded-lg bg-teal-700 px-4 py-1.5 text-[12.5px] font-semibold text-white disabled:opacity-50">{pending ? "Menyimpan…" : "Simpan catatan"}</button>
        <button type="button" onClick={() => { setOpen(false); setErr(null); }} className="rounded-lg border border-[#E4E3DF] px-3 py-1.5 text-[12.5px] text-zinc-500">Batal</button>
      </div>
    </div>
  );
}
