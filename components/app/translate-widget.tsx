"use client";

import { useEffect, useRef, useState } from "react";

// Tombol translate di pojok kanan atas — muncul di semua halaman.
// Memakai Google Website Translator (auto-translate seluruh isi halaman).
// Kita sembunyikan UI bawaan Google & pakai tombol sendiri; pemilihan bahasa
// diset via cookie `googtrans` lalu reload agar terjemahan konsisten.

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
  }
}

const LANGS = [
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "en", label: "English", flag: "🇬🇧" },
] as const;

const PAGE_LANG = "id"; // bahasa asli konten

function currentTarget(): string {
  if (typeof document === "undefined") return PAGE_LANG;
  const m = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
  return m?.[1] ?? PAGE_LANG;
}

function setGoogTrans(target: string) {
  const host = window.location.hostname;
  const value = target === PAGE_LANG ? "" : `/${PAGE_LANG}/${target}`;
  // Set/clear pada path & domain (termasuk varian leading-dot untuk subdomain).
  const variants = [
    `googtrans=${value}; path=/`,
    `googtrans=${value}; path=/; domain=${host}`,
    `googtrans=${value}; path=/; domain=.${host}`,
  ];
  if (value === "") {
    // Hapus cookie (set kedaluwarsa) untuk kembali ke bahasa asli.
    const expiry = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `googtrans=; path=/; ${expiry}`;
    document.cookie = `googtrans=; path=/; domain=${host}; ${expiry}`;
    document.cookie = `googtrans=; path=/; domain=.${host}; ${expiry}`;
  } else {
    variants.forEach((v) => (document.cookie = v));
  }
}

export function TranslateWidget() {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<string>(PAGE_LANG);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setTarget(currentTarget()), []);

  // Muat script Google Translate sekali (widget-nya disembunyikan via CSS).
  useEffect(() => {
    if (document.getElementById("google-translate-script")) return;
    window.googleTranslateElementInit = () => {
      // eslint-disable-next-line @typescript-eslint/no-new
      new window.google.translate.TranslateElement(
        { pageLanguage: PAGE_LANG, includedLanguages: LANGS.map((l) => l.code).join(","), autoDisplay: false },
        "google_translate_element",
      );
    };
    const s = document.createElement("script");
    s.id = "google-translate-script";
    s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(s);
  }, []);

  // Tutup dropdown saat klik di luar.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const choose = (code: string) => {
    setOpen(false);
    if (code === target) return;
    setGoogTrans(code);
    window.location.reload();
  };

  const active = LANGS.find((l) => l.code === target) ?? LANGS[0];

  return (
    <>
      {/* Container tersembunyi untuk widget Google (wajib ada). */}
      <div id="google_translate_element" className="sr-only" aria-hidden />

      {/* Top bar tipis di paling atas — di atas app shell (fixed, full-width). */}
      <div
        className="fixed inset-x-0 top-0 z-[2000] flex h-9 items-center justify-end border-b border-zinc-200 bg-white/90 px-3 backdrop-blur"
        translate="no"
      >
        <div ref={ref} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>{active.flag} {active.code.toUpperCase()}</span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {open && (
            <div role="menu" className="absolute right-0 top-full mt-1.5 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg">
              {LANGS.map((l) => {
                const on = l.code === target;
                return (
                  <button
                    key={l.code}
                    type="button"
                    role="menuitemradio"
                    aria-checked={on}
                    onClick={() => choose(l.code)}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] transition-colors hover:bg-teal-50/70 ${on ? "font-semibold text-teal-700" : "font-medium text-zinc-700"}`}
                  >
                    <span className="text-base" aria-hidden>{l.flag}</span>
                    <span className="flex-1">{l.label}</span>
                    {on && <span className="text-teal-600" aria-hidden>✓</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
