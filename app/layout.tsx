import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { NavProgress } from "@/components/app/nav-progress";
import { ServiceWorkerRegister } from "@/components/app/service-worker-register";
import { TranslateWidget } from "@/components/app/translate-widget";
import { siteUrl } from "@/lib/site";

// Font sesuai design direction (sengaja bukan Inter). display:swap + fallback sistem.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const TITLE = "Optio — Pahami Pilihanmu, Putuskan dengan Yakin";
const DESCRIPTION =
  "Tempel deskripsi listing dari WhatsApp, Optio ekstrak otomatis & bantu kamu pilih hunian sewa dengan lebih yakin.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Optio",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Optio",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Optio",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F766E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="min-h-screen bg-background pt-9 font-sans text-foreground">
        <NavProgress />
        <ServiceWorkerRegister />
        <TranslateWidget />
        {children}
      </body>
    </html>
  );
}
