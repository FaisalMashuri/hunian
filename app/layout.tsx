import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { NavProgress } from "@/components/app/nav-progress";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <NavProgress />
        {children}
      </body>
    </html>
  );
}
