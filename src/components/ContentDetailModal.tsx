"use client";

import React from "react";
import {
  X,
  ExternalLink,
  ThumbsUp,
  MessageSquare,
  Share2,
  Eye,
  Calendar,
  Sparkles,
  ShieldCheck,
  Tag,
  Copy,
  Check
} from "lucide-react";

export interface DetailContentItem {
  id: string;
  itemType: "post" | "comment";
  platform: string;
  author: string;
  content: string;
  url?: string;
  thumbnailUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
  viewsCount?: number;
  reach?: number;
  emv?: string;
  postedAt: string;
  sentiment: "positif" | "negatif" | "netral";
  sentimentScore: number;
  modelUsed?: string;
  reasoning?: string;
  topic?: string;
}

interface ContentDetailModalProps {
  item: DetailContentItem | null;
  onClose: () => void;
}

export default function ContentDetailModal({ item, onClose }: ContentDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!item) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(item.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Platform styling
  const platformColor = {
    instagram: "bg-pink-100 text-pink-700 border-pink-200",
    tiktok: "bg-slate-900 text-white border-slate-700",
    twitter: "bg-sky-100 text-sky-700 border-sky-200",
    facebook: "bg-blue-100 text-blue-700 border-blue-200",
    news: "bg-emerald-100 text-emerald-700 border-emerald-200",
    threads: "bg-purple-100 text-purple-700 border-purple-200",
  }[item.platform.toLowerCase()] || "bg-slate-100 text-slate-700 border-slate-200";

  // Sentiment styling
  const sentimentColor = {
    positif: "bg-emerald-50 text-emerald-700 border-emerald-200",
    negatif: "bg-rose-50 text-rose-700 border-rose-200",
    netral: "bg-slate-100 text-slate-700 border-slate-200",
  }[item.sentiment] || "bg-slate-100 text-slate-700 border-slate-200";

  // Highlight keywords
  const highlightKeywords = (text: string) => {
    const keywords = ["pemkot denpasar", "kota denpasar", "walikota denpasar", "pemkab badung"];
    let parts: { text: string; highlight: boolean }[] = [{ text, highlight: false }];

    for (const kw of keywords) {
      const newParts: typeof parts = [];
      for (const p of parts) {
        if (p.highlight) {
          newParts.push(p);
          continue;
        }
        const regex = new RegExp(`(${kw})`, "gi");
        const splits = p.text.split(regex);
        for (const s of splits) {
          if (s.toLowerCase() === kw.toLowerCase()) {
            newParts.push({ text: s, highlight: true });
          } else if (s) {
            newParts.push({ text: s, highlight: false });
          }
        }
      }
      parts = newParts;
    }

    return parts.map((p, i) =>
      p.highlight ? (
        <span key={i} className="bg-amber-200/80 text-amber-900 px-1 py-0.5 rounded font-semibold">
          {p.text}
        </span>
      ) : (
        <span key={i}>{p.text}</span>
      )
    );
  };

  const formattedDate = new Date(item.postedAt).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Makassar",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${platformColor}`}>
              {item.platform}
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                {item.author}
                <ShieldCheck className="w-4 h-4 text-blue-500 inline" />
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formattedDate} WITA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Media Preview if exists */}
          {item.thumbnailUrl && (
            <div className="relative rounded-xl overflow-hidden bg-slate-900 max-h-72 flex items-center justify-center shadow-inner border border-slate-100">
              <img
                src={item.thumbnailUrl}
                alt="Konten media"
                className="w-full h-full object-cover max-h-72"
              />
              <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[11px] px-2.5 py-1 rounded-full font-medium">
                {item.platform.toUpperCase()} Preview
              </div>
            </div>
          )}

          {/* Text Content */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
            {highlightKeywords(item.content)}
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
              <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1 mb-1">
                <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                Likes
              </div>
              <div className="font-bold text-slate-900 text-base">
                {item.likesCount?.toLocaleString() || "0"}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
              <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                Komentar
              </div>
              <div className="font-bold text-slate-900 text-base">
                {item.commentsCount?.toLocaleString() || "0"}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
              <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1 mb-1">
                <Eye className="w-3.5 h-3.5 text-purple-500" />
                Reach / Views
              </div>
              <div className="font-bold text-slate-900 text-base">
                {item.viewsCount?.toLocaleString() || item.reach?.toLocaleString() || "24.5K"}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
              <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1 mb-1">
                <Share2 className="w-3.5 h-3.5 text-amber-500" />
                EMV Est.
              </div>
              <div className="font-bold text-slate-900 text-base">
                {item.emv || "Rp 3.8M"}
              </div>
            </div>
          </div>

          {/* AI Sentiment Intelligence Panel */}
          <div className="p-4 rounded-xl border bg-gradient-to-br from-slate-50 to-blue-50/40 border-blue-100 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Analisis Sentimen DeepSeek-v4
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border uppercase ${sentimentColor}`}>
                  Sentimen {item.sentiment} ({Math.round(item.sentimentScore * 100)}%)
                </span>
                {item.topic && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-blue-200 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {item.topic}
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs text-slate-700 bg-white/80 p-3 rounded-lg border border-slate-200/70 leading-relaxed">
              <span className="font-semibold text-slate-900 block mb-1">
                Sudut Pandang Evaluasi Pemkot Denpasar:
              </span>
              {item.reasoning || "Dianalisis secara otomatis berdasarkan indikator pelayanan publik Kota Denpasar."}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-200/60 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Tersalin!" : "Salin Teks"}
          </button>

          <div className="flex items-center gap-2">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition"
              >
                Buka Link Asli
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
