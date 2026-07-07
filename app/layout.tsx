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

const TITLE = "Hunian — Bandingkan hunian sewa tanpa spreadsheet";
const DESCRIPTION =
  "Copy deskripsi dari WhatsApp, Hunian ekstrak otomatis & bantu kamu pilih hunian sewa yang paling masuk akal.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Hunian",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Hunian",
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
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hunian",
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
