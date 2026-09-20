import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Media Analitik - Monitoring Sentimen Sosial Media Pemkot Denpasar",
  description: "Platform Monitoring Sentimen Media Sosial ASA Group untuk Pemerintah Kota Denpasar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
