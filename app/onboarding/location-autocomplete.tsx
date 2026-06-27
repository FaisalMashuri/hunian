"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { placesAutocompleteAction, type Prediction } from "./actions";

function PinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <div className="h-8 w-8 flex-none rounded-lg bg-zinc-100" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-2/3 rounded bg-zinc-100" />
        <div className="h-2.5 w-1/3 rounded bg-zinc-100" />
      </div>
    </div>
  );
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder,
  className,
  autoResolve = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  // Saat true: alamat yang sudah terisi (mis. dari AI) otomatis dicocokkan ke
  // lokasi paling sesuai di balik layar (saat mount & saat blur tanpa memilih).
  autoResolve?: boolean;
}) {
  const reduce = useReducedMotion();
  const [preds, setPreds] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolvedNote, setResolvedNote] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const seq = useRef(0);
  const justSelected = useRef(false);
  const dirty = useRef(false);
  const didMountResolve = useRef(false);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Cocokkan ke lokasi terbaik (silent) — pakai prediksi teratas.
  const resolve = (query: string) => {
    if (!query.trim() || query.trim().length < 3) return;
    const my = ++seq.current;
    setResolving(true);
    (async () => {
      const res = await placesAutocompleteAction(query);
      if (my !== seq.current) return;
      setResolving(false);
      if (res.length > 0) {
        const top = res[0];
        if (top.description !== query) {
          justSelected.current = true;
          onChange(top.description);
        }
        setResolvedNote(true);
        setOpen(false);
      }
    })();
  };

  // Auto-resolve sekali saat mount bila sudah ada isi (mis. hasil ekstraksi).
  useEffect(() => {
    if (autoResolve && !didMountResolve.current && value.trim().length >= 3) {
      didMountResolve.current = true;
      resolve(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onInput = (q: string) => {
    onChange(q);
    dirty.current = true;
    setResolvedNote(false);
    if (timer.current) clearTimeout(timer.current);
    if (justSelected.current) {
      justSelected.current = false;
      return;
    }
    if (q.trim().length < 3) {
      setPreds([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    const my = ++seq.current;
    setOpen(true);
    setLoading(true);
    setPreds([]);
    timer.current = setTimeout(async () => {
      const res = await placesAutocompleteAction(q);
      if (my !== seq.current) return;
      setPreds(res);
      setLoading(false);
    }, 300);
  };

  const select = (p: Prediction) => {
    justSelected.current = true;
    dirty.current = false;
    seq.current++;
    onChange(p.description);
    setPreds([]);
    setOpen(false);
    setResolvedNote(true);
  };

  const onBlur = () => {
    // Snap ke lokasi terbaik bila user mengetik lalu pindah fokus tanpa memilih.
    if (autoResolve && dirty.current && !justSelected.current && value.trim().length >= 3) {
      dirty.current = false;
      // tunda agar klik item dropdown (select) sempat diproses lebih dulu
      setTimeout(() => {
        if (!justSelected.current) resolve(value);
      }, 150);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <input
        value={value}
        onChange={(e) => onInput(e.target.value)}
        onFocus={() => preds.length > 0 && setOpen(true)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />

      {open && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl shadow-zinc-300/40"
        >
          {loading ? (
            <div className="animate-pulse">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : preds.length === 0 ? (
            <div className="px-4 py-7 text-center">
              <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-zinc-400">
                <PinIcon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-zinc-700">Lokasi tidak ditemukan</p>
              <p className="mt-0.5 text-xs text-zinc-400">Coba kata kunci lain atau lebih spesifik.</p>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {preds.map((p) => (
                <li key={p.placeId}>
                  <button
                    type="button"
                    onClick={() => select(p)}
                    className="group flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-teal-50/60"
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-stone-100 text-zinc-400 transition-colors group-hover:bg-teal-100 group-hover:text-teal-700">
                      <PinIcon />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-zinc-900">
                        {p.mainText}
                      </span>
                      {p.secondaryText && (
                        <span className="block truncate text-xs text-zinc-500">
                          {p.secondaryText}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && (
            <div className="border-t border-zinc-100 px-3.5 py-1.5 text-right text-[10px] text-zinc-300">
              Google
            </div>
          )}
        </motion.div>
      )}

      {resolving && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-zinc-200 border-t-teal-600" />
          Mencocokkan lokasi…
        </p>
      )}
      {resolvedNote && !resolving && !open && (
        <p className="mt-1 text-xs font-medium text-emerald-600">✓ Lokasi dicocokkan otomatis</p>
      )}
    </div>
  );
}
