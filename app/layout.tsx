import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Font sesuai design direction (sengaja bukan Inter). display:swap + fallback sistem.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hunian — Bandingkan hunian sewa tanpa spreadsheet",
  description:
    "Copy deskripsi dari WhatsApp, Hunian ekstrak otomatis & bantu kamu pilih hunian sewa yang paling masuk akal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={jakarta.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
