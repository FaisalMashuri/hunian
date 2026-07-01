import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline — Hunian",
  robots: { index: false, follow: false },
};

// Halaman fallback saat offline & rute yang diminta belum ada di cache.
// Sengaja statis penuh (tanpa auth/fetch) supaya selalu bisa dirender dari cache SW.
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Image
        src="/icon.png"
        alt="Hunian"
        width={72}
        height={72}
        priority
        className="h-16 w-16 object-contain opacity-90"
      />
      <h1 className="mt-6 text-xl font-extrabold tracking-tight text-zinc-900">
        Kamu sedang offline
      </h1>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        Halaman ini belum tersimpan untuk dibuka tanpa koneksi. Sambungkan
        internet lagi, lalu coba muat ulang.
      </p>
      <a
        href="/"
        className="mt-6 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
      >
        Coba lagi
      </a>
    </main>
  );
}
