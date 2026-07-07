"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { uploadPhotoAction, deletePhotoAction } from "./photo-actions";
import type { Photo } from "@/lib/photos";

// S2-1: galeri foto NYATA (Supabase Storage, signed URL). Listing & survei dipisah via `source`.

function useUploader(candidateId: string, source: "listing" | "survey") {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const uploadFiles = useCallback((files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith("image/"));
    if (imgs.length === 0) return;
    start(async () => {
      setErr(null);
      for (const file of imgs) {
        const fd = new FormData();
        fd.set("candidateId", candidateId);
        fd.set("source", source);
        fd.set("file", file);
        const res = await uploadPhotoAction(fd);
        if (!res.ok) { setErr(res.error); break; }
      }
      router.refresh();
    });
  }, [candidateId, source, router, start]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // izinkan pilih file sama lagi
    uploadFiles(files);
  };

  // Tempel gambar dari clipboard (Ctrl/⌘+V) → upload sebagai foto.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const imgs = Array.from(e.clipboardData?.items ?? [])
        .filter((it) => it.kind === "file" && it.type.startsWith("image/"))
        .map((it) => it.getAsFile())
        .filter((f): f is File => !!f);
      if (imgs.length) { e.preventDefault(); uploadFiles(imgs); }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [uploadFiles]);

  return { inputRef, pending, err, onPick, trigger: () => inputRef.current?.click() };
}

function DeleteBtn({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        start(async () => {
          const r = await deletePhotoAction(id);
          if (r.ok) router.refresh();
        });
      }}
      disabled={pending}
      className="absolute right-1.5 top-1.5 z-[3] hidden h-6 w-6 place-items-center rounded-md bg-black/55 text-[11px] text-white backdrop-blur transition-colors hover:bg-black/80 group-hover:grid"
      aria-label="Hapus foto"
    >
      ✕
    </button>
  );
}

function AddTile({ trigger, pending, label }: { trigger: () => void; pending: boolean; label: string }) {
  return (
    <button type="button" onClick={trigger} disabled={pending} className="flex flex-col items-center justify-center gap-1 rounded-[10px] border-2 border-dashed border-[#D1D0CC] bg-[#FAFAF9] text-zinc-400 transition-colors hover:border-teal-400 hover:text-teal-700 disabled:opacity-50">
      {pending ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14" /><path d="M12 5v14" /></svg>
      )}
      <span className="text-[11px] font-semibold">{pending ? "Mengunggah…" : label}</span>
    </button>
  );
}

function Lightbox({ photos, index, onClose, onNav }: { photos: Photo[]; index: number; onClose: () => void; onNav: (d: number) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onNav(-1);
      else if (e.key === "ArrowRight") onNav(1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose, onNav]);

  const p = photos[index];
  if (!p) return null;
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-black/93 p-6" onClick={onClose}>
      <button className="fixed right-5 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-xl text-white hover:bg-white/25" onClick={onClose} aria-label="Tutup">✕</button>
      {photos.length > 1 && (
        <>
          <button className="fixed left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/25" onClick={(e) => { e.stopPropagation(); onNav(-1); }} aria-label="Sebelumnya">‹</button>
          <button className="fixed right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/25" onClick={(e) => { e.stopPropagation(); onNav(1); }} aria-label="Berikutnya">›</button>
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.url} alt={p.caption ?? "Foto"} className="max-h-[78vh] max-w-[860px] rounded-2xl object-contain" onClick={(e) => e.stopPropagation()} />
      <div className="mt-3 text-xs text-white/50">{index + 1} / {photos.length}{p.caption ? ` · ${p.caption}` : ""}</div>
    </div>
  );
}

function Thumb({ photo, onOpen, priority, sizes, canEdit }: { photo: Photo; onOpen: () => void; priority?: boolean; sizes: string; canEdit: boolean }) {
  return (
    <div className="group relative h-full w-full cursor-pointer overflow-hidden rounded-[10px] bg-zinc-100" onClick={onOpen}>
      {/* next/image: lazy + preload hero (priority) untuk LCP; `unoptimized` karena signed URL Supabase rotasi tiap jam. */}
      <Image
        src={photo.url}
        alt={photo.caption ?? "Foto"}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized
        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      {photo.source === "survey" && (
        <span className="absolute bottom-1.5 left-1.5 z-[2] rounded-md bg-[#E8621A]/85 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white backdrop-blur">Survey</span>
      )}
      {canEdit && <DeleteBtn id={photo.id} />}
    </div>
  );
}

// ── Galeri foto listing (grid hero + add)
export function PhotoGallery({ candidateId, photos, canEdit = true }: { candidateId: string; photos: Photo[]; canEdit?: boolean }) {
  const up = useUploader(candidateId, "listing");
  const [lb, setLb] = useState<number | null>(null);
  const nav = (d: number) => setLb((i) => (i == null ? i : (i + d + photos.length) % photos.length));

  // Partner (read-only) tanpa foto → jangan tampilkan tile upload; cukup sembunyikan galeri.
  if (photos.length === 0 && !canEdit) return null;

  return (
    <div>
      {canEdit && <input ref={up.inputRef} type="file" accept="image/*" multiple className="hidden" onChange={up.onPick} />}
      {photos.length === 0 ? (
        <button type="button" onClick={up.trigger} disabled={up.pending} className="flex h-40 w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#D1D0CC] bg-[#FAFAF9] text-zinc-400 transition-colors hover:border-teal-400 hover:text-teal-700 disabled:opacity-50">
          {up.pending ? <span className="h-6 w-6 animate-spin rounded-full border-2 border-teal-200 border-t-teal-700" /> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>}
          <span className="text-[13px] font-semibold">{up.pending ? "Mengunggah…" : "Tambah foto listing"}</span>
        </button>
      ) : (
        <div className="grid auto-rows-[110px] grid-cols-2 gap-1.5 sm:grid-cols-4">
          {photos.map((p, i) => (
            <div key={p.id} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <Thumb
                photo={p}
                onOpen={() => setLb(i)}
                priority={i === 0}
                sizes={i === 0 ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
                canEdit={canEdit}
              />
            </div>
          ))}
          {canEdit && <AddTile trigger={up.trigger} pending={up.pending} label="Tambah foto" />}
        </div>
      )}
      {up.err && <p className="mt-2 text-[12px] text-rose-600">{up.err}</p>}
      {lb != null && <Lightbox photos={photos} index={lb} onClose={() => setLb(null)} onNav={nav} />}
    </div>
  );
}
