"use client";

import Link from "next/link";

export function Success({
  title,
  id,
  locationWarning,
  onAddAnother,
}: {
  title: string;
  id: string;
  locationWarning: string | null;
  onAddAnother: () => void;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[20px] bg-emerald-50 shadow-[0_4px_20px_rgba(5,150,105,.2)]">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
      </div>
      <h1 className="mb-2 text-2xl font-extrabold tracking-tight text-zinc-900">Kandidat ditambahkan! 🎉</h1>
      <p className="mx-auto mb-7 max-w-md text-[15px] leading-relaxed text-zinc-500">
        <strong className="font-semibold text-zinc-700">{title}</strong> berhasil disimpan dan langsung dievaluasi berdasarkan preferensimu. Kamu bisa melengkapi data survey setelah kunjungan langsung.
      </p>

      {locationWarning && (
        <div className="mx-auto mb-7 max-w-md rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-[13px] text-amber-800">
          <strong>Skor lokasi belum aktif:</strong> {locationWarning} Kamu bisa melengkapi alamat/jarak lewat tombol Edit di halaman kandidat.
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2.5">
        <Link href={`/kandidat/${id}`} className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-800">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
          Lihat Kandidat
        </Link>
        <button type="button" onClick={onAddAnother} className="inline-flex items-center rounded-xl border-[1.5px] border-[#E4E3DF] px-5 py-3 text-sm text-zinc-500 transition-colors hover:bg-[#F4F3F0]">+ Tambah Kandidat Lain</button>
        <Link href="/kandidat" className="inline-flex items-center rounded-xl border-[1.5px] border-[#E4E3DF] px-5 py-3 text-sm text-zinc-500 transition-colors hover:bg-[#F4F3F0]">← Kembali ke Daftar</Link>
      </div>
    </div>
  );
}
