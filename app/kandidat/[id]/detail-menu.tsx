"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Tombol titik-tiga di topbar → buka dropdown dulu, lalu pilihan (Edit, Salin tautan).
export function DetailMenu({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // diabaikan — clipboard tak tersedia
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Menu opsi"
        className={`grid h-[34px] w-[34px] place-items-center rounded-lg border border-[#E4E3DF] text-zinc-500 transition-colors hover:bg-[#F4F3F0] ${open ? "bg-[#F4F3F0]" : ""}`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-[calc(100%+6px)] z-40 w-48 overflow-hidden rounded-xl border border-[#E4E3DF] bg-white py-1 shadow-lg">
          <Link
            href={`/kandidat/${id}/edit`}
            role="menuitem"
            className="flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-zinc-700 transition-colors hover:bg-[#F4F3F0]"
            onClick={() => setOpen(false)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" /></svg>
            Edit kandidat
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-zinc-700 transition-colors hover:bg-[#F4F3F0]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
            {copied ? "Tautan disalin ✓" : "Salin tautan"}
          </button>
        </div>
      )}
    </div>
  );
}
