"use client";

import { useEffect } from "react";

// Mendaftarkan service worker agar aplikasi installable sebagai PWA.
// Hanya jalan di production (dev/HMR bisa bentrok dengan SW cache).
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    // Di dev: buang SW lama (sisa build production) agar tidak membajak dev
    // server & menyajikan cache basi. SW hanya aktif di production.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Diamkan — kegagalan registrasi SW tidak boleh mengganggu aplikasi.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
