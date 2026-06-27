"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Bar progres tipis di atas layar — feedback "sedang pindah halaman" agar transisi tak terasa stuck.
// START: dideteksi dari KLIK pada <a> internal (capture phase, sebelum navigasi jalan) — bukan dari
// history.pushState, yang di App Router baru dipanggil saat commit (telat) + memicu error
// "useInsertionEffect must not schedule updates".
// FINISH: saat `pathname` berubah (halaman tujuan sudah commit).
export function NavProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || a.target === "_blank" || a.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(a.href, location.href);
      } catch {
        return;
      }
      // Hanya navigasi internal yang benar-benar pindah (beda path/query) — abaikan link luar & klik ke halaman yang sama.
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      setActive(true);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  // FINISH: pathname berubah → tujuan sudah commit.
  useEffect(() => {
    setActive(false);
  }, [pathname]);

  // Safety: bila navigasi dibatalkan (mis. query-only / gagal), jangan menggantung.
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), 8_000);
    return () => clearTimeout(t);
  }, [active]);

  if (!active) return null;
  return (
    <div className="nav-progress" role="status" aria-label="Memuat halaman">
      <div className="nav-progress__bar" />
    </div>
  );
}
