"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordNegotiationAction } from "./actions";

const fmt = (n: number | null) => (n == null ? "" : new Intl.NumberFormat("id-ID").format(n));
const parse = (s: string): number | null => { const d = s.replace(/\D/g, ""); return d === "" ? null : Number(d); };

// S2-4: catat harga akhir setelah negosiasi (harga_akhir_bulanan, per bulan).
export function NegotiationControl({ id, hargaAkhir }: { id: string; hargaAkhir: number | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState<number | null>(hargaAkhir);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const save = (v: number | null) =>
    start(async () => {
      setErr(null);
      const r = await recordNegotiationAction(id, v);
      if (r.ok) { setOpen(false); router.refresh(); }
      else setErr(r.error);
    });

  if (!open) {
    return (
      <button type="button" onClick={() => { setVal(hargaAkhir); setOpen(true); }} className="mt-1.5 text-[11.5px] font-semibold text-teal-700 hover:underline">
        {hargaAkhir != null ? "Ubah harga nego" : "+ Catat harga nego"}
      </button>
    );
  }

  return (
    <div className="mt-2 sm:text-left">
      <div className="flex items-stretch overflow-hidden rounded-[9px] border-[1.5px] border-teal-600 bg-white">
        <span className="flex items-center border-r-[1.5px] border-[#E4E3DF] bg-[#FAFAF9] px-2 text-[12px] text-zinc-500">Rp</span>
        <input autoFocus inputMode="numeric" value={fmt(val)} onChange={(e) => setVal(parse(e.target.value))} placeholder="harga akhir/bln" className="w-32 px-2 py-1.5 font-mono text-[13px] outline-none" />
      </div>
      <div className="mt-1.5 flex items-center gap-1.5">
        <button type="button" onClick={() => save(val)} disabled={pending} className="rounded-md bg-teal-700 px-3 py-1 text-[12px] font-semibold text-white disabled:opacity-50">{pending ? "…" : "Simpan"}</button>
        {hargaAkhir != null && <button type="button" onClick={() => save(null)} disabled={pending} className="rounded-md border border-[#E4E3DF] px-2 py-1 text-[12px] text-zinc-500">Hapus</button>}
        <button type="button" onClick={() => setOpen(false)} className="rounded-md border border-[#E4E3DF] px-2 py-1 text-[12px] text-zinc-500">Batal</button>
      </div>
      {err && <p className="mt-1 text-[11px] text-rose-600">{err}</p>}
    </div>
  );
}
