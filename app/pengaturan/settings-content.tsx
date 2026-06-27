"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updatePreferencesAction, type PrefsInput } from "./actions";
import { signOutAction } from "@/components/app/actions";
import { TRANSPORTS, PRIORITIES, DEAL_BREAKERS, toggle, computeWeights } from "@/app/onboarding/options";
import { LocationAutocomplete } from "@/app/onboarding/location-autocomplete";
import type { TransportMode } from "@/lib/types/db";

export type SettingsInitial = {
  budgetIdeal: number;
  budgetMax: number;
  tujuan: string;
  transportModes: TransportMode[];
  priorities: string[];
  dealBreakers: string[];
  customDealBreakers: string[];
  deadline: string | null;
};

type PanelId = "budget" | "tujuan" | "prioritas" | "dealbreaker" | "deadline";

const rp = (n: number | null) => (n == null ? "—" : "Rp " + new Intl.NumberFormat("id-ID").format(n));
const DB_EMOJI: Record<string, string> = {
  no_parkir_motor: "🅿️", km_di_luar: "🚿", no_memasak: "🍳", bayar_setahun_dimuka: "📅", no_dapur: "🏠", lantai_3_tanpa_lift: "🛗", no_pasutri: "💑",
};
const PRIO_EMOJI: Record<string, string> = { harga: "💰", lokasi: "📍", fasilitas: "🛋️", kondisi: "🛡️", owner: "👤" };
// Opsi prioritas yang BELUM jadi dimensi skor tersendiri (tercakup di survei/kelak) — tampil disabled.
const SOON_PRIOS = [
  { emoji: "🤫", label: "Ketenangan / tidak bising" },
  { emoji: "📶", label: "Internet cepat" },
];

const daysLeftOf = (d: string | null): number | null => {
  if (!d) return null;
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return null;
  return Math.ceil((t.getTime() - Date.now()) / 86_400_000);
};

function Stars({ w }: { w: number }) {
  const n = Math.min(5, Math.max(0, Math.round(w * 5)));
  return <span className="tracking-tight"><span className="text-amber-500">{"★".repeat(n)}</span><span className="text-zinc-300">{"★".repeat(5 - n)}</span></span>;
}

const fieldInput = "w-full rounded-[9px] border-[1.5px] border-[#E4E3DF] bg-white px-3 py-2.5 text-[13.5px] text-zinc-900 outline-none transition-colors focus:border-teal-700 placeholder:text-zinc-400";
const prefixWrap = "flex items-stretch overflow-hidden rounded-[9px] border-[1.5px] border-[#E4E3DF] bg-white transition-colors focus-within:border-teal-700";

export function SettingsContent({
  initial,
  user,
}: {
  initial: SettingsInitial;
  user: { name: string; email: string; initial: string; candidateCount: number };
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState<PanelId | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const [budgetIdeal, setBudgetIdeal] = useState(initial.budgetIdeal);
  const [budgetMax, setBudgetMax] = useState(initial.budgetMax);
  const [tujuan, setTujuan] = useState(initial.tujuan);
  const [transportModes, setTransportModes] = useState<TransportMode[]>(initial.transportModes);
  const [priorities, setPriorities] = useState<string[]>(initial.priorities);
  const [dealBreakers, setDealBreakers] = useState<string[]>(initial.dealBreakers);
  const [customDBs, setCustomDBs] = useState<string[]>(initial.customDealBreakers);
  const [customInput, setCustomInput] = useState("");
  const [deadline, setDeadline] = useState<string | null>(initial.deadline);

  const w = computeWeights(priorities);
  const dl = daysLeftOf(deadline);

  const toast = (m: string) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 2800); };
  const togglePanel = (id: PanelId) => setOpen((cur) => (cur === id ? null : id));

  const build = (): PrefsInput => ({ budgetIdeal, budgetMax, tujuan, transportModes, priorities, dealBreakers, customDealBreakers: customDBs, deadline });

  const MSG: Record<PanelId, string> = {
    budget: "Budget diperbarui — budget zone semua hunian dihitung ulang ✓",
    tujuan: "Tujuan & transportasi diperbarui — skor lokasi dihitung ulang ✓",
    prioritas: "Prioritas diperbarui — skor semua hunian dihitung ulang ✓",
    dealbreaker: "Deal breaker diperbarui — flag hunian diperbarui ✓",
    deadline: "Deadline diperbarui ✓",
  };
  const save = (id: PanelId) => start(async () => {
    const res = await updatePreferencesAction(build());
    if (res.ok) { router.refresh(); setOpen(null); toast(MSG[id]); }
    else toast(res.error);
  });

  const addCustom = () => {
    const v = customInput.trim();
    if (!v) return;
    setCustomDBs((c) => [...c, v]);
    setCustomInput("");
  };
  const setRelative = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDeadline(d.toISOString().split("T")[0]);
  };

  return (
    <div className="mx-auto max-w-[760px] px-1 pt-1 sm:px-2">
      <div className="mb-6 flex items-baseline gap-3">
        <h1 className="text-[22px] font-extrabold tracking-tight text-zinc-900">Pengaturan</h1>
        <span className="text-[12.5px] text-zinc-500">Preferensi pencarian &amp; akun</span>
      </div>

      {/* ── PREFERENSI PENCARIAN ── */}
      <div className="mb-7">
        <div className="mb-3">
          <div className="flex items-center gap-2 text-[13px] font-bold tracking-tight text-zinc-900">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-teal-50 text-sm">🔍</span>
            Preferensi Pencarian
          </div>
          <p className="mt-1 pl-9 text-xs text-zinc-500">Mengubah preferensi menghitung ulang skor semua hunian aktif otomatis.</p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#E4E3DF] bg-white shadow-sm">
          {/* BUDGET */}
          <SettingRow open={open === "budget"} onToggle={() => togglePanel("budget")} icon="💰" iconBg="#EDE9FE" label="Budget Bulanan"
            summary={<><span>Ideal <strong className="text-zinc-700">{rp(budgetIdeal)}</strong></span><Dot /><span>Maks <strong className="text-zinc-700">{rp(budgetMax)}</strong></span><Impact cls="bg-[#EDE9FE] text-[#5B21B6]">⬟ Budget zone</Impact></>}
            footer={<Footer note="Berlaku ke semua hunian aktif" onCancel={() => setOpen(null)} onSave={() => save("budget")} pending={pending} saveLabel="Simpan Budget" />}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Budget Ideal / bulan" hint="Target kenyamanan finansialmu">
                <div className={prefixWrap}><Prefix /><input className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-[13.5px] outline-none" type="number" value={budgetIdeal} onChange={(e) => setBudgetIdeal(Number(e.target.value) || 0)} /></div>
              </Field>
              <Field label="Budget Maksimal / bulan" hint="Batas keras yang tak bisa dilewati">
                <div className={prefixWrap}><Prefix /><input className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-[13.5px] outline-none" type="number" value={budgetMax} onChange={(e) => setBudgetMax(Number(e.target.value) || 0)} /></div>
              </Field>
            </div>
            <Info>Budget zone semua hunian (Hemat / Ideal / Menekan / Di atas maks) diperbarui otomatis.</Info>
          </SettingRow>

          {/* TUJUAN & TRANSPORTASI */}
          <SettingRow open={open === "tujuan"} onToggle={() => togglePanel("tujuan")} icon="📍" iconBg="#DBEAFE" label="Tujuan & Transportasi"
            summary={<><span className="truncate">{tujuan || "Belum diatur"}</span><Dot /><span>{TRANSPORTS.find((t) => t.id === transportModes[0])?.icon ?? "—"} {TRANSPORTS.find((t) => t.id === transportModes[0])?.label ?? "Belum dipilih"}</span><Impact cls="bg-teal-50 text-teal-700">⬟ Skor lokasi</Impact></>}
            footer={<Footer note="Skor lokasi semua hunian dihitung ulang" onCancel={() => setOpen(null)} onSave={() => save("tujuan")} pending={pending} saveLabel="Simpan Tujuan" />}>
            <Field label="Lokasi tujuan utama (kantor / kampus / dll)" hint="Dipakai menghitung jarak semua hunian">
              <LocationAutocomplete value={tujuan} onChange={setTujuan} placeholder="Ketik alamat atau nama tempat…" className={fieldInput} autoResolve />
            </Field>
            <div className="mt-3">
              <div className="mb-1.5 text-[12.5px] font-semibold text-zinc-700">Moda transportasi utama</div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {TRANSPORTS.map((t) => {
                  const on = transportModes.includes(t.id);
                  return (
                    <button key={t.id} type="button" onClick={() => setTransportModes((m) => toggle(m, t.id))} className={`rounded-[10px] border-[1.5px] px-2 py-2.5 text-center transition-colors ${on ? "border-teal-700 bg-teal-50" : "border-[#E4E3DF] bg-white hover:border-[#D1D0CC]"}`}>
                      <span className="mb-1 block text-xl">{t.icon}</span>
                      <span className="text-xs font-semibold text-zinc-900">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </SettingRow>

          {/* PRIORITAS */}
          <SettingRow open={open === "prioritas"} onToggle={() => togglePanel("prioritas")} icon="⭐" iconBg="#FEF3C7" label="Prioritas Pencarian"
            summary={<>{(["harga", "lokasi", "fasilitas"] as const).map((k, i) => (<span key={k} className="flex items-center gap-1 text-[12.5px]">{i > 0 && <Dot />}{PRIO_EMOJI[k]} <Stars w={k === "harga" ? w.harga : k === "lokasi" ? w.lokasi : w.fasilitas} /></span>))}<Impact cls="bg-teal-50 text-teal-700">⬟ Semua skor</Impact></>}
            footer={<Footer note="Skor semua hunian aktif dihitung ulang" onCancel={() => setOpen(null)} onSave={() => save("prioritas")} pending={pending} saveLabel="Simpan Prioritas" />}>
            <p className="mb-3.5 text-[13px] text-zinc-500">Pilih semua yang penting bagimu. Sistem generate bobot otomatis — tak perlu isi persen.</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {PRIORITIES.map((p) => {
                const on = priorities.includes(p.id);
                return (
                  <button key={p.id} type="button" onClick={() => setPriorities((cur) => toggle(cur, p.id))} className={`flex items-center gap-2.5 rounded-[10px] border-[1.5px] px-3.5 py-2.5 text-left transition-colors ${on ? "border-teal-700 bg-teal-50" : "border-[#E4E3DF] bg-white hover:border-[#D1D0CC]"}`}>
                    <span className={`grid h-[18px] w-[18px] place-items-center rounded-[5px] border-2 text-[11px] font-bold text-white ${on ? "border-teal-700 bg-teal-700" : "border-[#E4E3DF] bg-white"}`}>{on ? "✓" : ""}</span>
                    <span className="text-[13px] font-semibold text-zinc-900">{PRIO_EMOJI[p.id]} {p.label}</span>
                  </button>
                );
              })}
              {SOON_PRIOS.map((p) => (
                <div key={p.label} className="flex cursor-not-allowed items-center gap-2.5 rounded-[10px] border-[1.5px] border-[#E4E3DF] bg-[#FAFAF9] px-3.5 py-2.5 opacity-60">
                  <span className="grid h-[18px] w-[18px] place-items-center rounded-[5px] border-2 border-[#E4E3DF] bg-white" />
                  <span className="flex-1 text-[13px] font-semibold text-zinc-500">{p.emoji} {p.label}</span>
                  <span className="rounded-full bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-bold uppercase text-amber-700">Segera</span>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-[10px] border border-[#E4E3DF] bg-white p-3.5">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Preview Prioritasmu (5 aspek)</div>
              {[{ k: "harga", e: "💰", l: "Harga", w: w.harga }, { k: "lokasi", e: "📍", l: "Lokasi", w: w.lokasi }, { k: "fasilitas", e: "🛋️", l: "Fasilitas", w: w.fasilitas }, { k: "kondisi", e: "🛡️", l: "Kondisi & lingkungan", w: w.kondisi }, { k: "owner", e: "👤", l: "Owner", w: w.owner }].map((d) => (
                <div key={d.k} className="mb-1 flex items-center justify-between text-[13px] last:mb-0"><span className="text-zinc-500">{d.e} {d.l}</span><Stars w={d.w} /></div>
              ))}
              <p className="mt-2 text-[11.5px] text-zinc-400">Kondisi &amp; Owner mempengaruhi skor setelah hunian disurvey. Yang tidak dipilih dapat bobot sisa dibagi rata.</p>
            </div>
          </SettingRow>

          {/* DEAL BREAKER */}
          <SettingRow open={open === "dealbreaker"} onToggle={() => togglePanel("dealbreaker")} icon="🛡️" iconBg="#FFFBEB" label="Deal Breaker"
            summary={<><span className="font-semibold text-amber-600">{dealBreakers.length + customDBs.length} aktif</span>{(dealBreakers[0] || customDBs[0]) && <><Dot /><span className="truncate">{dealBreakers[0] ? DEAL_BREAKERS.find((d) => d.id === dealBreakers[0])?.label : customDBs[0]}</span></>}<Impact cls="bg-[#F4F3F0] text-zinc-500">⬟ Flag only</Impact></>}
            footer={<Footer note="Flag hunian yang melanggar diperbarui" onCancel={() => setOpen(null)} onSave={() => save("dealbreaker")} pending={pending} saveLabel="Simpan Deal Breaker" />}>
            <div className="mb-3.5 flex items-start gap-2 text-[13px] text-zinc-500">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-px shrink-0" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
              Deal breaker hanya menandai hunian — tidak menghapus. Hunian tetap bisa dilihat & dinilai.
            </div>
            <div className="flex flex-col gap-1.5">
              {DEAL_BREAKERS.map((db) => {
                const on = dealBreakers.includes(db.id);
                return (
                  <div key={db.id} className={`flex items-center justify-between rounded-[10px] border-[1.5px] px-3.5 py-2.5 transition-colors ${on ? "border-amber-200 bg-amber-50" : "border-[#E4E3DF] bg-white"}`}>
                    <span className="flex items-center gap-2 text-[13px] font-medium text-zinc-900"><span className="w-6 text-center">{DB_EMOJI[db.id]}</span>{db.label}</span>
                    <button type="button" role="switch" aria-checked={on} onClick={() => setDealBreakers((cur) => toggle(cur, db.id))} className={`relative h-[22px] w-10 rounded-full transition-colors ${on ? "bg-amber-500" : "bg-[#E4E3DF]"}`}>
                      <span className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow transition-all ${on ? "left-[21px]" : "left-[3px]"}`} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mb-2 mt-4 text-[11.5px] font-bold uppercase tracking-wider text-zinc-400">Deal Breaker Kustom</div>
            {customDBs.length > 0 && (
              <div className="mb-2.5 flex flex-col gap-1.5">
                {customDBs.map((db, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-[#E4E3DF] bg-white px-3 py-2 text-[13px] text-zinc-900">
                    <span>🔖</span>{db}
                    <button type="button" onClick={() => setCustomDBs((c) => c.filter((_, j) => j !== i))} className="ml-auto grid h-[22px] w-[22px] place-items-center rounded-md text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-1.5">
              <input className="flex-1 rounded-[9px] border-[1.5px] border-dashed border-[#D1D0CC] bg-white px-3 py-2 text-[13px] outline-none focus:border-solid focus:border-teal-700" value={customInput} onChange={(e) => setCustomInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="Tambah syarat kustom…" />
              <button type="button" onClick={addCustom} className="whitespace-nowrap rounded-[9px] bg-teal-700 px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-teal-800">+ Tambah</button>
            </div>
            <p className="mt-2 text-[11.5px] text-zinc-400">Kustom = pengingat pribadi. <strong className="text-zinc-500">Belum otomatis menandai hunian</strong> (hanya preset yang auto-flag).</p>
          </SettingRow>

          {/* DEADLINE */}
          <SettingRow open={open === "deadline"} onToggle={() => togglePanel("deadline")} icon="📅" iconBg="#FEF0E8" label="Deadline Pindah" last
            summary={deadline && dl != null ? <><span>{new Date(deadline).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span><Dot /><span className="font-semibold text-amber-600">{dl <= 0 ? "Hari ini!" : `${dl} hari lagi`}</span></> : <span className="text-zinc-400">Belum diatur</span>}
            footer={<Footer note="Mempengaruhi urgensi di dashboard" onCancel={() => setOpen(null)} onSave={() => save("deadline")} pending={pending} saveLabel="Simpan Deadline" />}>
            <p className="mb-3.5 text-[13px] text-zinc-500">Deadline mempengaruhi urgensi rekomendasi. Makin dekat, sistem makin pragmatis.</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <input type="date" value={deadline ?? ""} onChange={(e) => setDeadline(e.target.value || null)} className="rounded-[9px] border-[1.5px] border-[#E4E3DF] bg-white px-3 py-2.5 text-[13.5px] outline-none focus:border-teal-700" />
              <span className="font-mono text-[13px] font-semibold text-amber-600">{dl == null ? "Fleksibel" : dl <= 0 ? "Hari ini!" : `${dl} hari lagi`}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[{ l: "+2 minggu", d: 14 }, { l: "+1 bulan", d: 30 }, { l: "+2 bulan", d: 60 }].map((b) => (
                <button key={b.l} type="button" onClick={() => setRelative(b.d)} className="rounded-lg border border-[#E4E3DF] px-3 py-1.5 text-xs text-zinc-600 transition-colors hover:bg-[#F4F3F0]">{b.l}</button>
              ))}
              <button type="button" onClick={() => setDeadline(null)} className="rounded-lg border border-[#E4E3DF] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-[#F4F3F0]">Belum tahu</button>
            </div>
          </SettingRow>
        </div>
      </div>

      {/* ── AKUN ── */}
      <div className="mb-7">
        <div className="mb-3 flex items-center gap-2 text-[13px] font-bold tracking-tight text-zinc-900">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-zinc-100 text-sm">👤</span>
          Akun
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#E4E3DF] bg-white shadow-sm">
          <div className="flex items-center gap-3.5 border-b border-[#E4E3DF] p-5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-lg font-extrabold text-white">{user.initial}</span>
            <div className="min-w-0">
              <div className="truncate text-base font-bold text-zinc-900">{user.name}</div>
              <div className="truncate text-[13px] text-zinc-500">{user.email}</div>
              <div className="mt-0.5 text-[11.5px] text-zinc-400">{user.candidateCount} hunian di shortlist</div>
            </div>
          </div>
          <AccountRow icon="📦" iconBg="#EDE9FE" label="Ekspor Data" sub="Download semua hunian sebagai spreadsheet" right="Segera hadir ›" onClick={() => toast("Fitur ekspor data akan segera hadir")} />
          <AccountRow icon="🔗" iconBg="#DBEAFE" label="Bagikan Daftar" sub="Ajak pasangan atau keluarga melihat shortlist-mu" right="Segera hadir ›" onClick={() => toast("Fitur berbagi akan segera hadir")} />
          <AccountRow icon="🔒" iconBg="#F4F3F0" label="Kebijakan Privasi" sub="Bagaimana data kamu digunakan" right="›" onClick={() => toast("Kebijakan privasi akan segera hadir")} />
          <AccountRow icon="🚪" iconBg="#FFF1F2" label="Keluar dari Akun" sub="Datamu tetap tersimpan dan bisa diakses saat masuk lagi" right="Keluar ›" danger onClick={() => setLogoutOpen(true)} />
        </div>
      </div>

      {/* ── TENTANG ── */}
      <div className="py-5 text-center">
        <div className="text-[15px] font-extrabold tracking-tight text-zinc-900">Hunian</div>
        <div className="text-xs text-zinc-400">Versi 1.0.0 · Decision Support untuk Hunian Sewa</div>
        <div className="mt-1 text-[11.5px] italic text-zinc-400">&quot;Hunian doesn&apos;t optimize decisions. It optimizes how decisions are formed.&quot;</div>
      </div>

      {/* LOGOUT DIALOG */}
      {logoutOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/45 p-6" onClick={() => setLogoutOpen(false)}>
          <div className="w-full max-w-[400px] rounded-[20px] bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 text-4xl">👋</div>
            <h2 className="mb-2 text-lg font-extrabold tracking-tight text-zinc-900">Keluar dari Hunian?</h2>
            <p className="mb-5 text-[13.5px] leading-relaxed text-zinc-500">Data dan shortlist-mu tetap tersimpan dengan aman. Kamu bisa masuk kembali kapan saja.</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setLogoutOpen(false)} className="flex-1 rounded-[10px] border-[1.5px] border-[#E4E3DF] py-2.5 text-[13.5px] text-zinc-500 transition-colors hover:bg-[#F4F3F0]">Tetap di sini</button>
              <form action={signOutAction} className="flex-1">
                <button type="submit" className="w-full rounded-[10px] bg-rose-600 py-2.5 text-[13.5px] font-bold text-white transition-colors hover:bg-rose-700">Keluar</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-5 left-1/2 z-[999] -translate-x-1/2 rounded-xl bg-zinc-900 px-5 py-2.5 text-[13px] font-medium text-white shadow-xl">{toastMsg}</div>
      )}
    </div>
  );
}

// ════════════ sub-komponen (module scope agar input tak remount) ════════════
function Dot() {
  return <span className="text-zinc-300">·</span>;
}
function Prefix() {
  return <span className="flex items-center border-r-[1.5px] border-[#E4E3DF] bg-[#FAFAF9] px-2.5 text-[13px] font-medium text-zinc-500">Rp</span>;
}
function Impact({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{children}</span>;
}
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[12.5px] font-semibold text-zinc-700">{label}</div>
      {hint && <div className="-mt-1 text-[11.5px] text-zinc-400">{hint}</div>}
      {children}
    </div>
  );
}
function Info({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-3 flex items-center gap-2 rounded-[9px] border border-teal-200 bg-teal-50 px-3.5 py-2.5 text-[12.5px] text-teal-700">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
      {children}
    </div>
  );
}
function Footer({ note, onCancel, onSave, pending, saveLabel }: { note: string; onCancel: () => void; onSave: () => void; pending: boolean; saveLabel: string }) {
  return (
    <div className="flex items-center gap-2 border-t border-[#E4E3DF] bg-white px-5 py-3">
      <div className="flex flex-1 items-center gap-1.5 text-xs text-zinc-500">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6 9 17l-5-5" /></svg>
        {note}
      </div>
      <button type="button" onClick={onCancel} className="rounded-[9px] border border-[#E4E3DF] px-3.5 py-2 text-[13px] text-zinc-500 transition-colors hover:bg-[#F4F3F0]">Batal</button>
      <button type="button" onClick={onSave} disabled={pending} className="rounded-[9px] bg-teal-700 px-5 py-2 text-[13px] font-bold text-white transition-colors hover:bg-teal-800 disabled:opacity-50">{pending ? "Menyimpan…" : saveLabel}</button>
    </div>
  );
}
function SettingRow({ open, onToggle, icon, iconBg, label, summary, footer, children, last }: { open: boolean; onToggle: () => void; icon: string; iconBg: string; label: string; summary: React.ReactNode; footer: React.ReactNode; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={last ? "" : "border-b border-[#E4E3DF]"}>
      <div className="flex cursor-pointer select-none items-center gap-3 px-[18px] py-3.5 transition-colors hover:bg-[#FAFAF9]" onClick={onToggle}>
        <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[10px] text-base" style={{ background: iconBg }}>{icon}</span>
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-semibold text-zinc-900">{label}</div>
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[12.5px] text-zinc-500">{summary}</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-[7px] border px-2.5 py-1 text-xs font-semibold transition-colors ${open ? "border-zinc-900 bg-zinc-900 text-white" : "border-teal-200 bg-teal-50 text-teal-700"}`}>{open ? "Tutup" : "Edit"}</span>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={`text-zinc-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`} aria-hidden><path d="m9 18 6-6-6-6" /></svg>
        </div>
      </div>
      {open && (
        <div className="border-t border-[#E4E3DF] bg-[#FAFAF9]">
          <div className="p-5">{children}</div>
          {footer}
        </div>
      )}
    </div>
  );
}
function AccountRow({ icon, iconBg, label, sub, right, danger, onClick }: { icon: string; iconBg: string; label: string; sub: string; right: string; danger?: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between border-b border-[#E4E3DF] px-5 py-3.5 text-left transition-colors last:border-0 hover:bg-[#FAFAF9]">
      <span className="flex items-center gap-2.5">
        <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-lg text-sm" style={{ background: iconBg }}>{icon}</span>
        <span>
          <span className={`block text-[13.5px] font-semibold ${danger ? "text-rose-600" : "text-zinc-900"}`}>{label}</span>
          <span className="block text-xs text-zinc-500">{sub}</span>
        </span>
      </span>
      <span className={`shrink-0 text-[12.5px] ${danger ? "text-rose-600" : "text-zinc-400"}`}>{right}</span>
    </button>
  );
}
