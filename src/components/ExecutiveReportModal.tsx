"use client";

import React, { useState } from "react";
import {
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Layers,
  Sparkles,
  ExternalLink
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExecutiveReportModal({ isOpen, onClose }: ExecutiveReportModalProps) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [viewMode, setViewMode] = useState<"slides" | "all">("slides");

  if (!isOpen) return null;

  // Chart data for Page 3
  const mediaDistributionData = [
    { name: "Instagram", value: 39.0, color: "#1e3a5f" },
    { name: "Facebook", value: 31.9, color: "#2563eb" },
    { name: "Web", value: 8.7, color: "#d97706" },
    { name: "X", value: 6.3, color: "#38bdf8" },
    { name: "Youtube", value: 6.3, color: "#94a3b8" },
    { name: "TikTok", value: 5.1, color: "#64748b" },
    { name: "Bluesky", value: 2.8, color: "#cbd5e1" },
  ];

  const trend4hData = [
    { time: "04–08", sosmed: 28, online: 5 },
    { time: "08–12", sosmed: 87, online: 0 },
    { time: "12–16", sosmed: 49, online: 5 },
    { time: "16–20", sosmed: 46, online: 7 },
    { time: "20–24", sosmed: 17, online: 4 },
    { time: "00–04", sosmed: 5, online: 1 },
  ];

  // Chart data for Page 4
  const mediaOnlinePie = [
    { name: "Positif", value: 86.4, color: "#15803d" },
    { name: "Negatif", value: 13.6, color: "#b91c1c" },
  ];

  const sosmedPie = [
    { name: "Positif", value: 68.5, color: "#15803d" },
    { name: "Netral", value: 29.7, color: "#94a3b8" },
    { name: "Negatif", value: 1.7, color: "#b91c1c" },
  ];

  // Chart data for Page 5 (Emosi)
  const emotionData = [
    { name: "Senang", pct: 68.5, color: "#1e3a5f" },
    { name: "Netral", pct: 28.3, color: "#475569" },
    { name: "Marah", pct: 2.4, color: "#dc2626" },
    { name: "Sedih", pct: 0.4, color: "#64748b" },
    { name: "Takut", pct: 0.4, color: "#94a3b8" },
  ];

  // Chart data for Page 6 (Situs & Akun)
  const webSitesData = [
    { name: "podiumnews.com", count: 6 },
    { name: "rri.co.id", count: 4 },
    { name: "detik.com", count: 3 },
    { name: "jawapos.com", count: 3 },
    { name: "baliilu.com", count: 2 },
    { name: "baliviralnews.com", count: 2 },
    { name: "viva.co.id", count: 1 },
    { name: "mcwnews.com", count: 1 },
  ];

  const sosmedAccountsData = [
    { name: "Pemkot Denpasar", count: 58 },
    { name: "BALIPORTALNEWS", count: 7 },
    { name: "NusaBali.com", count: 6 },
    { name: "joyful.denpasar", count: 5 },
    { name: "UPDATEBALI.com", count: 4 },
    { name: "pmidenpasar", count: 3 },
    { name: "Disdikpora Dps", count: 2 },
    { name: "dpmd_kotadps", count: 2 },
  ];

  // Chart data for Page 7 (Walikota)
  const walikotaTopicsData = [
    { topic: "Kegiatan adat & upacara", count: 4 },
    { topic: "Sampah kemasan BWC", count: 3 },
    { topic: "Gubernur ke SMPN 13", count: 2 },
    { topic: "Transformasi digital", count: 1 },
    { topic: "Dokumen kependudukan", count: 1 },
    { topic: "Perubahan APBD 2026", count: 1 },
    { topic: "Parkir UMKM", count: 1 },
  ];

  // Helper for slide footer
  const renderFooter = (page: number) => (
    <div className="w-full flex items-center justify-between text-[10px] text-slate-400 pt-3 border-t border-slate-100 mt-auto">
      <span>
        Laporan Harian Pemerintah Kota Denpasar • 19 September 2026 • Oleh: <b>Benlaris</b>
      </span>
      <span>{page}</span>
    </div>
  );

  // Helper for category header
  const renderCategoryHeader = (category: string, title: string, subtitle?: string) => (
    <div className="mb-4">
      <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold mb-1">
        {category}
      </div>
      <h2 className="text-2xl font-bold font-serif text-[#0f2942] tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-start p-2 sm:p-4 overflow-y-auto backdrop-blur-sm print:p-0 print:bg-white print:static">
      {/* Modal Toolbar (hidden in print) */}
      <div className="w-full max-w-5xl bg-slate-900 text-white px-4 py-2.5 rounded-t-xl flex items-center justify-between shadow-xl print:hidden sticky top-2 z-50">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold font-sans">
            Dokumen Laporan Eksekutif Pemkot Denpasar (Contoh PRD Benlaris)
          </span>
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
            {currentSlide} / 12 Halaman
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <button
            onClick={() => setViewMode(viewMode === "slides" ? "all" : "slides")}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md font-medium text-slate-200 transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            {viewMode === "slides" ? "Tampilkan 12 Halaman" : "Mode Slide"}
          </button>

          {/* Print PDF Button */}
          <button
            onClick={() => window.print()}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak / Simpan PDF
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md transition ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Slides Container */}
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-b-xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none">
        {/* ==================== SLIDE 1: COVER ==================== */}
        {(viewMode === "all" || currentSlide === 1) && (
          <div className="slide-page w-full aspect-[16/9] min-h-[580px] bg-white p-8 sm:p-12 relative flex flex-col justify-between overflow-hidden print:aspect-auto print:h-[100vh] print:p-12 border-b border-slate-200 print:border-none">
            {/* Background Graphic: Candi Bentar Balinese Gate & Moon Backdrop */}
            <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none flex items-center justify-end">
              <svg viewBox="0 0 400 500" className="w-full h-full object-contain opacity-95">
                {/* Soft Light Blue Backdrop Circle */}
                <circle cx="300" cy="220" r="160" fill="#e8f1f8" />
                {/* Constellation Dots Accent */}
                {[...Array(8)].map((_, i) => (
                  <circle
                    key={i}
                    cx={150 + i * 28}
                    cy={35}
                    r="3"
                    fill="#3b82f6"
                    opacity={0.4}
                  />
                ))}
                {/* Candi Bentar Split Gate - Left Wing */}
                <g transform="translate(180, 260)">
                  {/* Gate Base */}
                  <rect x="0" y="100" width="45" height="120" fill="#1e293b" />
                  {/* Stepped Pagoda Roofs */}
                  <polygon points="5,100 45,100 45,80 12,80" fill="#b91c1c" />
                  <polygon points="8,80 45,80 45,62 16,62" fill="#991b1b" />
                  <polygon points="12,62 45,62 45,46 20,46" fill="#b91c1c" />
                  <polygon points="16,46 45,46 45,32 24,32" fill="#991b1b" />
                  <polygon points="20,32 45,32 45,20 28,20" fill="#b91c1c" />
                  <polygon points="25,20 45,20 45,10 32,10" fill="#991b1b" />
                  <polygon points="30,10 45,10 45,0 36,0" fill="#b91c1c" />
                </g>
                {/* Candi Bentar Split Gate - Right Wing */}
                <g transform="translate(245, 260)">
                  {/* Gate Base */}
                  <rect x="0" y="100" width="45" height="120" fill="#1e293b" />
                  {/* Stepped Pagoda Roofs */}
                  <polygon points="0,100 40,100 33,80 0,80" fill="#b91c1c" />
                  <polygon points="0,80 37,80 29,62 0,62" fill="#991b1b" />
                  <polygon points="0,62 33,62 25,46 0,46" fill="#b91c1c" />
                  <polygon points="0,46 29,46 21,32 0,32" fill="#991b1b" />
                  <polygon points="0,32 25,32 17,20 0,20" fill="#b91c1c" />
                  <polygon points="0,20 20,20 13,10 0,10" fill="#991b1b" />
                  <polygon points="0,10 15,10 9,0 0,0" fill="#b91c1c" />
                </g>
              </svg>
            </div>

            {/* Header */}
            <div>
              <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#0f2942]">
                PEMERINTAH KOTA DENPASAR
              </div>
              <div className="text-xs font-semibold text-[#b91c1c] tracking-wider mt-0.5">
                Analisis Media & Monitoring
              </div>
            </div>

            {/* Title Section */}
            <div className="my-auto max-w-xl z-10 space-y-4">
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold font-serif text-[#0f2942] tracking-tight">
                  Laporan Harian
                </h1>
                <p className="text-2xl sm:text-3xl italic font-serif text-[#1e3a5f] mt-1">
                  Pemerintah Kota Denpasar
                </p>
              </div>

              {/* Date Badge */}
              <div className="inline-block bg-[#b91c1c] text-white text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-md shadow-sm">
                19 SEPTEMBER 2026
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Data mention: <b>18–19 September 2026</b> · <b>254 mention</b> (22 media online · 232 media sosial)
              </p>
            </div>

            {/* Footer */}
            <div className="z-10 border-t border-slate-200/80 pt-3 max-w-xs">
              <div className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                DISUSUN OLEH
              </div>
              <div className="text-sm font-bold text-[#0f2942]">
                Benlaris
              </div>
            </div>
          </div>
        )}

        {/* ==================== SLIDE 2: RINGKASAN EKSEKUTIF ==================== */}
        {(viewMode === "all" || currentSlide === 2) && (
          <div className="slide-page w-full aspect-[16/9] min-h-[580px] bg-white p-8 sm:p-12 flex flex-col justify-between print:aspect-auto print:h-[100vh] print:p-12 border-b border-slate-200 print:border-none">
            {renderCategoryHeader("RINGKASAN EKSEKUTIF", "Apa yang Perlu Diketahui")}

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-4 gap-4 my-2">
              <div className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold font-serif text-[#0f2942]">254</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Total Mention</div>
                <div className="text-[11px] text-slate-500 mt-0.5">22 media online · 232 media sosial</div>
              </div>

              <div className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold font-serif text-emerald-700">70,1%</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Sentimen Positif</div>
                <div className="text-[11px] text-slate-500 mt-0.5">2,8% negatif · 27,2% netral</div>
              </div>

              <div className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold font-serif text-[#0f2942]">125.308</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Total Views</div>
                <div className="text-[11px] text-slate-500 mt-0.5">4.980 engagement (like, komentar, share)</div>
              </div>

              <div className="bg-[#f8fafc] p-4 rounded-xl border border-slate-200">
                <div className="text-3xl font-bold font-serif text-[#0f2942]">58.313</div>
                <div className="text-xs font-bold text-slate-800 mt-1">Views Isu Terbesar</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Papan nama dari sampah plastik (BWC–Pepsico) · 10 konten</div>
              </div>
            </div>

            {/* Poin Utama */}
            <div className="space-y-2.5 my-2">
              <h3 className="font-bold text-sm text-[#0f2942]">Poin Utama</h3>
              <ul className="space-y-2 text-xs text-slate-700 leading-relaxed list-disc pl-5">
                <li>
                  Volume <b>254 mention didominasi media sosial (91,3%; Instagram 39,0% dan Facebook 31,9%)</b>, sedangkan media online mencatat 22 mention (8,7%).
                </li>
                <li>
                  <b>Isu positif terbesar:</b> papan nama dari sampah plastik (10 konten, 58 rb views; TikTok NusaBali 811 likes & 109 komentar), disusul kunjungan Gubernur Koster ke SMPN 13 dan pembetonan Jl. Gajah Mada (33 rb views).
                </li>
                <li>
                  <b>Satu isu negatif aktif:</b> Wi-Fi Corner mati di ruang publik (3 konten, 3,9 rb views). Pemkot sudah merespons pada 18 September — sebagian titik pulih, sisanya dalam perbaikan.
                </li>
                <li>
                  <b>Perlu dipantau:</b> keluhan parkir (UMKM, pedagang bermobil, trotoar) dan sorotan Fraksi Gerindra atas jumlah pegawai Perumda Pasar (639 orang vs kebutuhan ideal ±400).
                </li>
              </ul>
            </div>

            {renderFooter(2)}
          </div>
        )}

        {/* ==================== SLIDE 3: OVERVIEW ==================== */}
        {(viewMode === "all" || currentSlide === 3) && (
          <div className="slide-page w-full aspect-[16/9] min-h-[580px] bg-white p-8 sm:p-12 flex flex-col justify-between print:aspect-auto print:h-[100vh] print:p-12 border-b border-slate-200 print:border-none">
            {renderCategoryHeader("OVERVIEW", "Distribusi Sumber & Tren Volume Pemberitaan")}

            <div className="grid grid-cols-2 gap-8 my-auto items-center">
              {/* Left: Donut Chart */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">Distribusi Sumber Media</h3>
                <div className="flex items-center gap-4">
                  <div className="w-44 h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mediaDistributionData}
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {mediaDistributionData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1 text-xs">
                    {mediaDistributionData.map((m) => (
                      <div key={m.name} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: m.color }} />
                        <span className="text-slate-600">{m.name}</span>
                        <span className="font-bold text-slate-900">— {m.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Line Chart */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 mb-2">
                  Tren Volume Mention per 4 Jam (18–19 September)
                </h3>
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend4hData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="sosmed" stroke="#1e3a5f" strokeWidth={2.5} dot={{ r: 4 }} name="Sosial Media" />
                      <Line type="monotone" dataKey="online" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} name="Media Online" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 text-[11px] mt-1">
                  <span className="flex items-center gap-1.5 text-[#1e3a5f] font-bold">
                    <span className="w-3 h-0.5 bg-[#1e3a5f]" /> Sosial Media
                  </span>
                  <span className="flex items-center gap-1.5 text-sky-500 font-bold">
                    <span className="w-3 h-0.5 bg-sky-400" /> Media Online
                  </span>
                </div>
              </div>
            </div>

            {/* Insight Box */}
            <div className="bg-[#f0f7ff] border border-blue-100 p-3 rounded-lg text-xs text-slate-700 leading-relaxed">
              <b>Insight:</b> Media sosial mendominasi (232 dari 254 mention) dengan puncak volume pada rentang 08–12 (87 mention, seluruhnya media sosial). Media online (22 mention) baru menguat pada rentang 12–20 seiring liputan kegiatan Wawali, persetujuan Perubahan APBD, dan program sampah kemasan.
            </div>

            {renderFooter(3)}
          </div>
        )}

        {/* ==================== SLIDE 4: SENTIMEN PEMBERITAAN ==================== */}
        {(viewMode === "all" || currentSlide === 4) && (
          <div className="slide-page w-full aspect-[16/9] min-h-[580px] bg-white p-8 sm:p-12 flex flex-col justify-between print:aspect-auto print:h-[100vh] print:p-12 border-b border-slate-200 print:border-none">
            {renderCategoryHeader(
              "SENTIMEN PEMBERITAAN",
              "Sentimen Pemkot Denpasar: Online vs Sosial Media",
              "Catatan: konten belasungkawa, imbauan/PSA Pemkot, dan mention di luar topik pemerintahan kota dihitung netral."
            )}

            {/* Side-by-side Donut Charts */}
            <div className="grid grid-cols-2 gap-6 my-2">
              <div className="flex items-center justify-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={mediaOnlinePie} innerRadius={28} outerRadius={42} dataKey="value">
                        {mediaOnlinePie.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-800 text-sm">Media Online (n = 22)</div>
                  <div className="text-emerald-700 font-bold mt-1">86.4% Positif</div>
                  <div className="text-red-700 font-bold">13.6% Negatif</div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={sosmedPie} innerRadius={28} outerRadius={42} dataKey="value">
                        {sosmedPie.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs">
                  <div className="font-bold text-slate-800 text-sm">Sosial Media (n = 232)</div>
                  <div className="text-emerald-700 font-bold mt-1">68.5% Positif</div>
                  <div className="text-slate-500 font-medium">29.7% Netral</div>
                  <div className="text-red-700 font-bold">1.7% Negatif</div>
                </div>
              </div>
            </div>

            {/* 4 Cards Grid (2x2) */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">MEDIA ONLINE • POSITIF</div>
                <div className="font-bold text-slate-900 mt-1">Pemkot Gandeng BWC–Pepsico, Kelola Sampah Kemasan</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Radar Bali — sampah kemasan diolah jadi papan nama taman kota.</div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">SOSIAL MEDIA • POSITIF</div>
                <div className="font-bold text-slate-900 mt-1">Papan Nama Multifungsi di Taman Kota Lumintang</div>
                <div className="text-slate-600 text-[11px] mt-0.5">TikTok NusaBali.com — 811 likes, 109 komentar, 56.795 views.</div>
              </div>

              <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
                <div className="text-[10px] font-bold text-red-800 uppercase">MEDIA ONLINE • NEGATIF</div>
                <div className="font-bold text-slate-900 mt-1">Parkir di Depan UMKM Dikeluhkan, Pemkot Kaji Skema Gratis</div>
                <div className="text-slate-600 text-[11px] mt-0.5">detik.com — Pemkot berencana membenahi skema parkir UMKM.</div>
              </div>

              <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg">
                <div className="text-[10px] font-bold text-red-800 uppercase">SOSIAL MEDIA • NEGATIF</div>
                <div className="font-bold text-slate-900 mt-1">Wi-Fi Milik Pemkot di Taman Kota Lumintang Mati</div>
                <div className="text-slate-600 text-[11px] mt-0.5">TikTok NusaBali.com — 16 likes, 1 komentar, 2.813 views.</div>
              </div>
            </div>

            {renderFooter(4)}
          </div>
        )}

        {/* ==================== SLIDE 5: ANALISIS EMOSI ==================== */}
        {(viewMode === "all" || currentSlide === 5) && (
          <div className="slide-page w-full aspect-[16/9] min-h-[580px] bg-white p-8 sm:p-12 flex flex-col justify-between print:aspect-auto print:h-[100vh] print:p-12 border-b border-slate-200 print:border-none">
            {renderCategoryHeader("ANALISIS EMOSI", "Emosi Dominan di Balik Sentimen Warganet")}

            <div className="grid grid-cols-12 gap-8 my-auto items-center">
              {/* Left Bar Chart */}
              <div className="col-span-7 space-y-3">
                {emotionData.map((emo) => (
                  <div key={emo.name} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-700">{emo.name}</span>
                      <span className="text-slate-900">{emo.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${emo.pct}%`, backgroundColor: emo.color }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Interpretasi */}
              <div className="col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">Interpretasi</div>
                <div>
                  <span className="font-bold text-emerald-700">🟢 Senang (68.5%): </span>
                  <span className="text-slate-600">Apresiasi program & fasilitas baru. Contoh: "Fast respon" pada perbaikan Wi-Fi.</span>
                </div>
                <div>
                  <span className="font-bold text-slate-600">⚪ Netral (28.3%): </span>
                  <span className="text-slate-600">Konten informatif & Story tanpa caption teks.</span>
                </div>
                <div>
                  <span className="font-bold text-red-700">🔴 Marah (2.4%): </span>
                  <span className="text-slate-600">Kekecewaan layanan publik. Contoh: Wi-Fi mati sejak lama.</span>
                </div>
                <div>
                  <span className="font-bold text-amber-700">🟠 Sedih & Takut (0.8%): </span>
                  <span className="text-slate-600">Kekhawatiran tarif parkir UMKM pinggir jalan.</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-[11px] text-slate-500">
              Catatan metodologi: Label emosi dipetakan dari model NLP menjadi Senang, Marah, Sedih, Takut, dan Netral untuk melihat kecenderungan reaksi warga.
            </div>

            {renderFooter(5)}
          </div>
        )}

        {/* ==================== SLIDE 6: MEDIA TERAKTIF ==================== */}
        {(viewMode === "all" || currentSlide === 6) && (
          <div className="slide-page w-full aspect-[16/9] min-h-[580px] bg-white p-8 sm:p-12 flex flex-col justify-between print:aspect-auto print:h-[100vh] print:p-12 border-b border-slate-200 print:border-none">
            {renderCategoryHeader("MEDIA TERAKTIF", "Situs & Akun Paling Aktif Memberitakan Pemkot")}

            <div className="grid grid-cols-2 gap-8 my-auto">
              {/* Left: Web Sites */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-xs text-slate-900 mb-3">Situs Web Teraktif</h3>
                <div className="space-y-2 text-xs">
                  {webSitesData.map((s) => (
                    <div key={s.name} className="flex items-center justify-between">
                      <span className="text-slate-700 font-mono text-[11px]">{s.name}</span>
                      <div className="flex items-center gap-2 flex-1 max-w-[140px] ml-2">
                        <div className="w-full bg-slate-200 h-3 rounded-sm overflow-hidden">
                          <div
                            style={{ width: `${(s.count / 6) * 100}%` }}
                            className="bg-[#1e3a5f] h-full"
                          />
                        </div>
                        <span className="font-bold text-slate-900 w-4 text-right">{s.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Sosmed Accounts */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-xs text-slate-900 mb-3">Akun Sosial Media Teraktif</h3>
                <div className="space-y-2 text-xs">
                  {sosmedAccountsData.map((a) => (
                    <div key={a.name} className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold text-[11px] truncate max-w-[140px]">{a.name}</span>
                      <div className="flex items-center gap-2 flex-1 max-w-[140px] ml-2">
                        <div className="w-full bg-slate-200 h-3 rounded-sm overflow-hidden">
                          <div
                            style={{ width: `${(a.count / 58) * 100}%` }}
                            className="bg-blue-600 h-full"
                          />
                        </div>
                        <span className="font-bold text-slate-900 w-5 text-right">{a.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 italic">
              Catatan: Akun generik personal atau promosi komersial dikecualikan untuk fokus pada sumber pemberitaan publik terverifikasi.
            </div>

            {renderFooter(6)}
          </div>
        )}

        {/* ==================== SLIDE 7: SOROTAN TOKOH ==================== */}
        {(viewMode === "all" || currentSlide === 7) && (
          <div className="slide-page w-full aspect-[16/9] min-h-[580px] bg-white p-8 sm:p-12 flex flex-col justify-between print:aspect-auto print:h-[100vh] print:p-12 border-b border-slate-200 print:border-none">
            {renderCategoryHeader(
              "SOROTAN TOKOH",
              "Analisis Walikota Denpasar",
              "Analisis khusus 13 mention yang terpantau melalui tracker 'Walikota Denpasar' (bagian dari 254 mention Pemkot Denpasar)."
            )}

            {/* 4 Cards */}
            <div className="grid grid-cols-4 gap-3 my-1">
              <div className="bg-[#f8fafc] p-3 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold font-serif text-[#0f2942]">13</div>
                <div className="text-[11px] font-bold text-slate-800">Total Mention</div>
                <div className="text-[10px] text-slate-500">11 online · 2 sosmed</div>
              </div>
              <div className="bg-[#f8fafc] p-3 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold font-serif text-emerald-700">92,3%</div>
                <div className="text-[11px] font-bold text-slate-800">Sentimen Positif</div>
                <div className="text-[10px] text-slate-500">12 positif · 1 negatif</div>
              </div>
              <div className="bg-[#f8fafc] p-3 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold font-serif text-[#0f2942]">441</div>
                <div className="text-[11px] font-bold text-slate-800">Total Views</div>
                <div className="text-[10px] text-slate-500">Portal berita & sosmed</div>
              </div>
              <div className="bg-[#f8fafc] p-3 rounded-lg border border-slate-200">
                <div className="text-2xl font-bold font-serif text-[#0f2942]">54</div>
                <div className="text-[11px] font-bold text-slate-800">Engagement</div>
                <div className="text-[10px] text-slate-500">49 IG likes + 5 TikTok</div>
              </div>
            </div>

            {/* Topics & Top Engagement */}
            <div className="grid grid-cols-2 gap-6 my-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Topik Liputan</h4>
                <div className="space-y-1.5">
                  {walikotaTopicsData.map((t) => (
                    <div key={t.topic} className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-700">{t.topic}</span>
                      <span className="font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{t.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-2">Konten Engagement Tertinggi</h4>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="font-bold text-slate-800">Kunjungan Gubernur Bali ke SMPN 13</div>
                    <div className="text-slate-500 text-[10px]">Instagram — 49 likes</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="font-bold text-slate-800">Wawali hadiri Pujawali Merajan Agung</div>
                    <div className="text-slate-500 text-[10px]">TikTok — 5 likes, 441 views</div>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <div className="font-bold text-slate-800">Gandeng BWC–Pepsico kelola sampah kemasan</div>
                    <div className="text-slate-500 text-[10px]">Radar Bali (jawapos.com) — Liputan Berita</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insight */}
            <div className="bg-[#f0f7ff] border border-blue-100 p-2.5 rounded-lg text-xs text-slate-700">
              <b>Insight:</b> Mention Walikota didominasi liputan media online (85%) dengan apresiasi tinggi. Peluang: tarik liputan inovasi sampah kemasan dan kunjungan sekolah ke kanal sosial resmi pemkot.
            </div>

            {renderFooter(7)}
          </div>
        )}

        {/* ==================== SLIDE 8: ISU POSITIF ==================== */}
        {(viewMode === "all" || currentSlide === 8) && (
          <div className="slide-page w-full aspect-[16/9] min-h-[580px] bg-white p-8 sm:p-12 flex flex-col justify-between print:aspect-auto print:h-[100vh] print:p-12 border-b border-slate-200 print:border-none">
            {renderCategoryHeader("ISU POSITIF", "Isu Positif Utama")}

            <div className="overflow-x-auto my-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-[10px] uppercase font-bold text-slate-500">
                    <th className="py-2 pr-4 w-1/4">ISU</th>
                    <th className="py-2 pr-4 w-1/3">RINGKASAN & CONTOH KONTEN</th>
                    <th className="py-2 pr-4 w-1/6">STATISTIK</th>
                    <th className="py-2 w-1/4">ANALISIS & SARAN RESPONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="align-top">
                    <td className="py-3 pr-4 font-bold text-slate-900">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                      Papan Nama Multifungsi dari Sampah Plastik (BWC–Pepsico)
                    </td>
                    <td className="py-3 pr-4 text-slate-600 space-y-1">
                      <div>Pemkot & Bali Waste Recycle resmikan papan nama berbahan daur ulang kemasan di Taman Lumintang.</div>
                      <div className="italic text-[11px] text-blue-600">"Papan daur ulang sampah kemasan diresmikan Wawali..." (TikTok NusaBali)</div>
                    </td>
                    <td className="py-3 pr-4 text-slate-700 font-medium">
                      <div>10 konten</div>
                      <div>58.313 views</div>
                      <div className="text-slate-500">824 likes · 109 komen</div>
                    </td>
                    <td className="py-3 text-slate-600">
                      Isu positif terkuat: inovasi konkret. Manfaatkan momentum TikTok untuk edukasi pemilahan sampah di rumah.
                    </td>
                  </tr>

                  <tr className="align-top">
                    <td className="py-3 pr-4 font-bold text-slate-900">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                      Gubernur Koster Kunjungi SMPN 13 Denpasar
                    </td>
                    <td className="py-3 pr-4 text-slate-600 space-y-1">
                      <div>Kunjungan ke Padangsambian Kelod, motivasi siswa jadi pemimpin masa depan Bali.</div>
                      <div className="italic text-[11px] text-blue-600">"Gubernur Bali kunjungi SMPN 13 Denpasar..." (Buleleng Terkini)</div>
                    </td>
                    <td className="py-3 pr-4 text-slate-700 font-medium">
                      <div>10 konten</div>
                      <div>12.817 views</div>
                      <div className="text-slate-500">580 likes · 14 komen</div>
                    </td>
                    <td className="py-3 text-slate-600">
                      Menunjukkan sinergi Pemprov–Pemkot di sektor pendidikan. Momentum baik menonjolkan prestasi sekolah kota.
                    </td>
                  </tr>

                  <tr className="align-top">
                    <td className="py-3 pr-4 font-bold text-slate-900">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />
                      Pembetonan Jalan Gajah Mada, Penataan Heritage
                    </td>
                    <td className="py-3 pr-4 text-slate-600 space-y-1">
                      <div>Pembetonan Jl. Gajah Mada sebagai langkah awal revitalisasi kawasan heritage kota tua.</div>
                      <div className="italic text-[11px] text-blue-600">"Pembetonan Jalan Gajah Mada langkah awal..." (Update Bali)</div>
                    </td>
                    <td className="py-3 pr-4 text-slate-700 font-medium">
                      <div>2 konten</div>
                      <div>33.207 views</div>
                      <div className="text-slate-500">512 likes · 28 komen</div>
                    </td>
                    <td className="py-3 text-slate-600">
                      Volume kecil tapi jangkauan tinggi (33 rb views). Perlu narasi resmi tahapan pengerjaan dan rute alternatif.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {renderFooter(8)}
          </div>
        )}

        {/* ==================== SLIDE 9: ISU NEGATIF AKTIF ==================== */}
        {(viewMode === "all" || currentSlide === 9) && (
          <div className="slide-page w-full aspect-[16/9] min-h-[580px] bg-white p-8 sm:p-12 flex flex-col justify-between print:aspect-auto print:h-[100vh] print:p-12 border-b border-slate-200 print:border-none">
            {renderCategoryHeader(
              "ISU NEGATIF",
              "Isu Negatif Aktif",
              "Berbeda dari isu potensi risiko — isu di bawah ini SUDAH menjadi keluhan aktif warganet dengan sentimen negatif nyata."
            )}

            <div className="my-auto bg-red-50/50 border border-red-200 rounded-xl p-6">
              <div className="grid grid-cols-12 gap-6 text-xs">
                <div className="col-span-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600" />
                    <h3 className="font-bold text-sm text-[#0f2942]">
                      Wi-Fi Corner Pemkot di Ruang Publik Mati (Taman Kota Lumintang)
                    </h3>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    NusaBali dan warganet menyoroti Wi-Fi Corner yang mati sejak lama. Diskominfos menyebut pemancar kerap dicuri dan sedang proses penggantian.
                  </p>
                  <div className="p-2 bg-white rounded border border-red-200 text-[11px] italic text-slate-600">
                    "Kondisi Wi-Fi milik Pemkot Denpasar di Taman Kota Lumintang mati sejak lama" — NusaBali.com
                  </div>
                </div>

                <div className="col-span-3 bg-white p-4 rounded-lg border border-red-200 space-y-2 font-medium">
                  <div className="font-bold text-slate-800 text-xs border-b pb-1">Statistik Isu</div>
                  <div>• 3 konten / mention</div>
                  <div>• 3.853 total views</div>
                  <div>• 35 likes · 1 komentar</div>
                  <div className="text-slate-500">• Dominan TikTok & IG</div>
                </div>

                <div className="col-span-5 bg-white p-4 rounded-lg border border-red-200 space-y-2">
                  <div className="font-bold text-slate-800 text-xs border-b pb-1">Analisis & Rekomendasi Respons</div>
                  <p className="text-slate-600 leading-relaxed">
                    <b>Sudah direspons:</b> Pada 18 September Pemkot mengunggah konten tindak lanjut pengecekan Diskominfos ke lokasi (mendapat 67 likes & pujian "fast respon").
                  </p>
                  <p className="text-slate-600 leading-relaxed font-semibold text-emerald-800">
                    Langkah lanjutan: Publikasikan daftar titik Wi-Fi yang sudah aktif kembali, jadwal perawatan, dan rencana pengamanan perangkat.
                  </p>
                </div>
              </div>
            </div>

            {renderFooter(9)}
          </div>
        )}

        {/* ==================== SLIDE 10: ISU POTENSI NEGATIF ==================== */}
        {(viewMode === "all" || currentSlide === 10) && (
          <div className="slide-page w-full aspect-[16/9] min-h-[580px] bg-white p-8 sm:p-12 flex flex-col justify-between print:aspect-auto print:h-[100vh] print:p-12 border-b border-slate-200 print:border-none">
            {renderCategoryHeader(
              "ISU POTENSI NEGATIF",
              "Isu Berpotensi Negatif & Perlu Dipantau",
              "Isu di bawah masih bervolume kecil atau dalam tahap kajian — berisiko membesar jika tidak dikomunikasikan secara transparan."
            )}

            <div className="space-y-4 my-auto text-xs">
              {/* Card 1 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-12 gap-4">
                <div className="col-span-4 font-bold text-slate-900">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />
                  Keluhan & Penataan Parkir (UMKM, Pedagang Bermobil, Trotoar)
                </div>
                <div className="col-span-4 text-slate-600 space-y-1">
                  <div>Parkir di depan UMKM dikaji untuk skema gratis/elektronik. Dishub menindaklanjuti laporan di Pasar Satria dan Jl. Thamrin.</div>
                  <div className="italic text-[11px] text-blue-600">"Menindaklanjuti laporan masyarakat pedagang bermobil..." (Perumda Bhukti Praja)</div>
                </div>
                <div className="col-span-4 text-slate-600 bg-white p-3 rounded border border-slate-200">
                  <b>Saran Respons:</b> Masih tahap kajian dan belum viral. Komunikasikan hasil penertiban dan skema parkir resmi agar tidak melebar.
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-12 gap-4">
                <div className="col-span-4 font-bold text-slate-900">
                  <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />
                  Sorotan Fraksi Gerindra: Pegawai Perumda Pasar Sewakadarma
                </div>
                <div className="col-span-4 text-slate-600 space-y-1">
                  <div>Fraksi Gerindra DPRD menilai pegawai Perumda Pasar terlalu gemuk (639 orang vs ideal BPKP 400 orang).</div>
                  <div className="italic text-[11px] text-blue-600">"Jumlah pegawai saat ini mencapai 639 orang..." (NusaBali X)</div>
                </div>
                <div className="col-span-4 text-slate-600 bg-white p-3 rounded border border-slate-200">
                  <b>Saran Respons:</b> Baru 1 sumber dari cuitan X. Siapkan data rasio beban kerja dan rencana penataan SDM Perumda Pasar bila isu dikutip media cetak.
                </div>
              </div>
            </div>

            {renderFooter(10)}
          </div>
        )}

        {/* ==================== SLIDE 11: REKOMENDASI KONTEN ==================== */}
        {(viewMode === "all" || currentSlide === 11) && (
          <div className="slide-page w-full aspect-[16/9] min-h-[580px] bg-white p-8 sm:p-12 flex flex-col justify-between print:aspect-auto print:h-[100vh] print:p-12 border-b border-slate-200 print:border-none">
            {renderCategoryHeader("REKOMENDASI KONTEN", "Ide Konten Prioritas")}

            <div className="grid grid-cols-2 gap-4 my-auto text-xs">
              {/* Card 1 */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0f2942] text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Di Balik Papan Nama dari Sampah Plastik</h3>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">REELS / TIKTOK</span>
                  </div>
                </div>
                <p className="italic text-slate-600 text-[11px]">"Dari Kemasan Jajan Jadi Papan Nama Taman: Begini Prosesnya"</p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Manfaatkan isu positif terbesar (56,8 rb views). Tampilkan proses BWC dan DLHK, ajak warga pilah sampah kemasan.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0f2942] text-white flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Update Transparan Wi-Fi Corner</h3>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">CAROUSEL / STORY</span>
                  </div>
                </div>
                <p className="italic text-slate-600 text-[11px]">"Titik Wi-Fi Corner yang Sudah Pulih & Jadwal Perbaikan"</p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Ubah keluhan aktif jadi bukti responsivitas: sebutkan daftar titik aktif, jadwal perbaikan, dan upaya pengamanan.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0f2942] text-white flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Heritage Jalan Gajah Mada</h3>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">VIDEO PENDEK / INFOGRAFIS</span>
                  </div>
                </div>
                <p className="italic text-slate-600 text-[11px]">"Apa yang Sedang Ditata di Jalan Gajah Mada?"</p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Bangun momentum 32 rb views: jelaskan tahapan penataan, durasi pengerjaan, dan skema rekayasa lalin.
                </p>
              </div>

              {/* Card 4 */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#0f2942] text-white flex items-center justify-center font-bold text-sm">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Satu Laporan, Satu Tindak Lanjut</h3>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">CAROUSEL EDUKASI</span>
                  </div>
                </div>
                <p className="italic text-slate-600 text-[11px]">"Laporan Warga yang Sudah Ditindaklanjuti: Parkir Pasar Satria & Thamrin"</p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Klarifikasi proaktif untuk isu parkir: tunjukkan foto sebelum/sesudah penertiban serta kajian tarif UMKM.
                </p>
              </div>
            </div>

            {renderFooter(11)}
          </div>
        )}

        {/* ==================== SLIDE 12: KESIMPULAN (DARK THEME) ==================== */}
        {(viewMode === "all" || currentSlide === 12) && (
          <div className="slide-page w-full aspect-[16/9] min-h-[580px] bg-[#0f172a] text-white p-8 sm:p-12 flex flex-col justify-between print:aspect-auto print:h-[100vh] print:p-12">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold mb-1">
                KESIMPULAN
              </div>
              <h2 className="text-2xl font-bold font-serif text-white tracking-tight">
                Arah Strategi Komunikasi Selanjutnya
              </h2>
            </div>

            {/* Executive Quote Box */}
            <div className="my-3 p-4 bg-slate-800/80 border border-slate-700 rounded-xl text-xs sm:text-sm italic text-slate-200 leading-relaxed">
              "Sentimen publik pada 18–19 September 2026 didominasi konten positif (70,1%), didorong program sampah plastik dan kunjungan Gubernur ke SMPN 13. Mention negatif hanya 2,8% — terutama Wi-Fi Corner dan parkir — dan keduanya sudah mendapat tindak lanjut dari perangkat daerah."
            </div>

            {/* 4 Action Points */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-white flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-bold text-white">Perkuat narasi inovasi sampah plastik</h4>
                  <p className="text-slate-400 text-[11px]">Lanjutkan momentum TikTok NusaBali (56,8 rb views) dengan konten proses dan ajakan pilah sampah.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-white flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-white">Tuntaskan komunikasi Wi-Fi Corner</h4>
                  <p className="text-slate-400 text-[11px]">Publikasikan titik yang sudah pulih, jadwal perbaikan, dan langkah pengamanan perangkat pemancar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-white flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-white">Jelaskan skema parkir secara proaktif</h4>
                  <p className="text-slate-400 text-[11px]">Sampaikan hasil kajian parkir gratis/elektronik untuk UMKM dan hasil penataan Pasar Satria.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-white flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-bold text-white">Siapkan data untuk isu Perumda Pasar</h4>
                  <p className="text-slate-400 text-[11px]">Siapkan penjelasan atas angka 639 pegawai vs kebutuhan ideal ±400 bila sorotan DPRD mulai meluas.</p>
                </div>
              </div>
            </div>

            {/* Slide 12 Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400 mt-2">
              <span className="font-bold text-white">Terima Kasih</span>
              <span>Laporan disusun oleh Benlaris • 19 September 2026</span>
            </div>
          </div>
        )}
      </div>

      {/* Slide Navigation Controls (Bottom Toolbar in Slide Mode) */}
      {viewMode === "slides" && (
        <div className="w-full max-w-5xl bg-slate-900/90 text-white px-4 py-2 mt-2 rounded-xl flex items-center justify-between print:hidden shadow-lg">
          <button
            onClick={() => setCurrentSlide(Math.max(1, currentSlide - 1))}
            disabled={currentSlide === 1}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold rounded-lg flex items-center gap-1 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Halaman Sebelumnya
          </button>

          {/* Slide Dots / Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {[...Array(12)].map((_, idx) => {
              const num = idx + 1;
              return (
                <button
                  key={num}
                  onClick={() => setCurrentSlide(num)}
                  className={`w-7 h-7 rounded-md text-xs font-bold transition flex items-center justify-center ${
                    currentSlide === num
                      ? "bg-blue-600 text-white shadow-md scale-105"
                      : "bg-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentSlide(Math.min(12, currentSlide + 1))}
            disabled={currentSlide === 12}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold rounded-lg flex items-center gap-1 transition"
          >
            Halaman Berikutnya <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
