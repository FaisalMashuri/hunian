"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { invitePartnerAction, revokePartnerAction } from "./actions";

export type Partner = { email: string; role: string };
export type SharedWithMe = { ownerName: string | null; ownerEmail: string };

function Avatar({ text }: { text: string }) {
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-violet-100 text-[13px] font-bold text-violet-700">
      {text.charAt(0).toUpperCase()}
    </span>
  );
}

export function KolaborasiClient({ partners, sharedWithMe }: { partners: Partner[]; sharedWithMe: SharedWithMe[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("viewer");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const invite = () => {
    setErr(null);
    start(async () => {
      const r = await invitePartnerAction(email, role);
      if (!r.ok) { setErr(r.error); return; }
      setEmail("");
      router.refresh();
    });
  };

  const revoke = (partnerEmail: string) => {
    start(async () => {
      const r = await revokePartnerAction(partnerEmail);
      if (r.ok) router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* UNDANG PARTNER */}
      <section className="rounded-2xl border border-[#E4E3DF] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold tracking-tight text-zinc-900">Bagikan shortlist ke partner</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-zinc-500">
          Masukkan email Google pasanganmu. Saat dia masuk dengan email itu, seluruh hunian di
          shortlist-mu akan muncul di dashboard &amp; halaman Bandingkan miliknya — <strong>hanya bisa dilihat</strong>,
          hanya kamu yang bisa mengubah datanya.
        </p>
        <div className="mt-3.5 flex flex-col gap-2 sm:flex-row">
          <input
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") invite(); }}
            placeholder="email.pasangan@gmail.com"
            className="h-11 flex-1 rounded-xl border border-[#E4E3DF] bg-[#FAFAF9] px-3.5 text-[14px] text-zinc-900 outline-none transition-colors focus:border-teal-500 focus:bg-white"
          />
          <button
            type="button"
            onClick={invite}
            disabled={pending || !email.trim()}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 disabled:opacity-50"
          >
            {pending ? "Menyimpan…" : "Bagikan"}
          </button>
        </div>
        {/* Pilih peran akses */}
        <div className="mt-2.5 flex gap-1 rounded-xl border border-[#E4E3DF] bg-[#FAFAF9] p-1">
          {([
            { v: "viewer", label: "Hanya lihat", desc: "Melihat & membandingkan" },
            { v: "editor", label: "Bisa edit", desc: "Ikut edit & isi survei" },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setRole(opt.v)}
              className={`flex-1 rounded-lg px-3 py-2 text-left transition-colors ${role === opt.v ? "bg-white shadow-sm ring-1 ring-teal-200" : "hover:bg-white/60"}`}
            >
              <div className={`text-[13px] font-semibold ${role === opt.v ? "text-teal-700" : "text-zinc-600"}`}>{opt.label}</div>
              <div className="text-[11px] text-zinc-400">{opt.desc}</div>
            </button>
          ))}
        </div>
        {err && <p className="mt-2 text-[12.5px] text-rose-600">{err}</p>}
      </section>

      {/* PARTNER YANG SUDAH DIUNDANG */}
      <section className="rounded-2xl border border-[#E4E3DF] bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold tracking-tight text-zinc-900">Partner yang punya akses</h2>
        {partners.length === 0 ? (
          <p className="mt-2 text-[13px] text-zinc-500">Belum ada. Undang partnermu di atas.</p>
        ) : (
          <ul className="mt-3 flex flex-col divide-y divide-[#E4E3DF]">
            {partners.map((p) => (
              <li key={p.email} className="flex items-center gap-3 py-2.5">
                <Avatar text={p.email} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium text-zinc-900">{p.email}</div>
                  <div className="text-[11.5px] text-zinc-400">{p.role === "editor" ? "Bisa lihat & edit shortlist-mu" : "Bisa melihat shortlist-mu"}</div>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold ${p.role === "editor" ? "bg-teal-50 text-teal-700" : "bg-zinc-100 text-zinc-500"}`}>
                  {p.role === "editor" ? "Editor" : "Viewer"}
                </span>
                <button
                  type="button"
                  onClick={() => revoke(p.email)}
                  disabled={pending}
                  className="shrink-0 rounded-lg border border-[#E4E3DF] px-3 py-1.5 text-[12.5px] font-medium text-zinc-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                >
                  Cabut akses
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* SHORTLIST YANG DIBAGIKAN KE KAMU */}
      {sharedWithMe.length > 0 && (
        <section className="rounded-2xl border border-[#E4E3DF] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold tracking-tight text-zinc-900">Shortlist yang dibagikan ke kamu</h2>
          <ul className="mt-3 flex flex-col divide-y divide-[#E4E3DF]">
            {sharedWithMe.map((o) => (
              <li key={o.ownerEmail} className="flex items-center gap-3 py-2.5">
                <Avatar text={o.ownerName ?? o.ownerEmail} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13.5px] font-medium text-zinc-900">{o.ownerName ?? o.ownerEmail}</div>
                  <div className="truncate text-[11.5px] text-zinc-400">{o.ownerEmail} · hunian-nya tampil di dashboard-mu</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
