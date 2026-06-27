"use client";

const PLACEHOLDER = `Tempel teks di sini...

Contoh dari WhatsApp:
"Kontrakan di Jatibening, 3,5 jt/bln nego. 2 kamar tidur, 1 kamar mandi dalam. Ada carport, dapur. Listrik token. Deposit 2 bulan. Hubungi Pak Budi 0812-3456-7890"

Atau dari OLX:
"Disewakan rumah minimalis Pondok Gede Bekasi..."`;

const SOURCES = ["📱 WhatsApp", "🛍 OLX", "📘 Facebook", "🏠 Mamikos", "📋 Teks apapun"];

export function PasteCard({
  value,
  onChange,
  loading,
}: {
  value: string;
  onChange: (v: string) => void;
  loading: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E4E3DF] bg-white shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-[#E4E3DF] bg-[#FAFAF9] px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-teal-50">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /></svg>
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold text-zinc-900">Tempel deskripsi listing</div>
          <div className="text-xs text-zinc-500">Copy dari WhatsApp, OLX, Facebook, atau mana saja — AI akan ekstrak datanya</div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={7}
            disabled={loading}
            className="block min-h-[180px] w-full resize-y rounded-xl border-2 border-[#E4E3DF] bg-white p-4 text-sm leading-relaxed text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-teal-700"
          />
          {loading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/90 backdrop-blur-sm">
              <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-teal-200 border-t-teal-700" />
              <span className="text-sm font-semibold text-teal-700">AI sedang membaca deskripsi...</span>
              <span className="text-xs text-zinc-500">Biasanya selesai dalam 3–5 detik</span>
            </div>
          )}
        </div>

        <div className="mt-1.5 text-right font-mono text-[11.5px] text-zinc-400">
          {value.length.toLocaleString("id-ID")} karakter
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-zinc-400">Bisa dari:</span>
          {SOURCES.map((s) => (
            <span key={s} className="rounded-full border border-[#E4E3DF] bg-[#FAFAF9] px-2.5 py-[3px] text-[11.5px] font-medium text-zinc-500">{s}</span>
          ))}
        </div>

        <div className="mt-3.5 flex items-start gap-2 rounded-[10px] border border-teal-200 bg-teal-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-teal-700">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-px shrink-0" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
          Semakin lengkap teks yang ditempel, semakin banyak data yang bisa diekstrak otomatis. Kamu bisa lengkapi sisanya di langkah berikutnya.
        </div>
      </div>
    </div>
  );
}
