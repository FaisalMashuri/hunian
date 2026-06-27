"use client";

import { useEffect, useRef, useState } from "react";
import { signOutAction } from "./actions";
import type { AppUser } from "./app-shell";

// Menu profil di navbar (kanan atas). Avatar → dropdown nama/email + Keluar.
export function ProfileMenu({ user }: { user: AppUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-zinc-200 py-1 pl-1 pr-2.5 transition-colors hover:bg-stone-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-[12px] font-bold text-white">
          {user.initial}
        </span>
        <span className="hidden max-w-[120px] truncate text-[13px] font-semibold text-zinc-700 sm:block">
          {user.name}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-56 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
          <div className="border-b border-zinc-100 px-4 py-3">
            <div className="truncate text-[13px] font-semibold text-zinc-900">{user.name}</div>
            <div className="truncate text-[12px] text-zinc-500">{user.email}</div>
          </div>
          <form action={signOutAction}>
            <button className="w-full px-4 py-2.5 text-left text-[13px] font-medium text-rose-600 transition-colors hover:bg-rose-50">
              Keluar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
