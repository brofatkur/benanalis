"use client";

import React, { useState, useMemo } from "react";
import {
  MessageSquare,
  Share2,
  Megaphone,
  DollarSign,
  Info,
  Filter,
  Plus,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Eye,
  ThumbsUp,
  RotateCw,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Maximize2,
  Trash2,
  Calendar,
  Sparkles
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import ContentDetailModal, { DetailContentItem } from "./ContentDetailModal";

interface MediaIntelligenceViewProps {
  overviewData: any;
  feedData: any[];
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function MediaIntelligenceView({
  overviewData,
  feedData = [],
  onRefresh,
  refreshing = false,
}: MediaIntelligenceViewProps) {
  // Modal state for clickable items
  const [selectedItem, setSelectedItem] = useState<DetailContentItem | null>(null);

  // Timeframe tabs: 'month' | 'week' | 'day'
  const [timeframe, setTimeframe] = useState<"month" | "week" | "day">("day");

  // Chart modes
  const [mentionsMode, setMentionsMode] = useState<"merged" | "comparison">("comparison");
  const [engagementMode, setEngagementMode] = useState<"merged" | "comparison">("merged");
  const [reachMode, setReachMode] = useState<"merged" | "comparison">("comparison");

  // Subchart modes
  const [sentimentMode1, setSentimentMode1] = useState<"sentiment" | "emotion">("sentiment");
  const [sentimentMode2, setSentimentMode2] = useState<"sentiment" | "emotion">("sentiment");
  const [sentimentMode3, setSentimentMode3] = useState<"sentiment" | "emotion">("sentiment");

  // Mention Trackers selection
  const [trackersOpen, setTrackersOpen] = useState(true);
  const [selectedTrackers, setSelectedTrackers] = useState<Record<string, boolean>>({
    pemkot: true,
    walikota: true,
    owned: true,
    badung: true,
    sampah: true,
  });

  const toggleTracker = (key: string) => {
    setSelectedTrackers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ----------------------------------------------------
  // Strict Realtime Date Filtering
  // ----------------------------------------------------
  const filteredFeed = useMemo(() => {
    if (!feedData || feedData.length === 0) return [];

    // Reference today is September 20-21, 2026
    const todayCutoff = new Date("2026-09-20T00:00:00Z").getTime();
    const weekCutoff = new Date("2026-09-14T00:00:00Z").getTime();
    const monthCutoff = new Date("2026-08-22T00:00:00Z").getTime();

    return feedData.filter((item) => {
      const itemTime = new Date(item.postedAt).getTime();
      if (isNaN(itemTime)) return false;

      // Filter by timeframe
      if (timeframe === "day") {
        // Strictly published on today or within last 24h
        return itemTime >= todayCutoff;
      } else if (timeframe === "week") {
        return itemTime >= weekCutoff;
      } else if (timeframe === "month") {
        return itemTime >= monthCutoff;
      }
      return true;
    });
  }, [feedData, timeframe]);

  // Split into 3 columns
  const webMentions = useMemo(() => {
    return filteredFeed
      .filter((i) => i.platform === "news" || i.platform === "web")
      .slice(0, 10);
  }, [filteredFeed]);

  const socialByEngagement = useMemo(() => {
    return [...filteredFeed]
      .filter((i) => i.platform !== "news")
      .sort((a, b) => (b.likesCount + b.commentsCount) - (a.likesCount + a.commentsCount))
      .slice(0, 10);
  }, [filteredFeed]);

  const socialByReach = useMemo(() => {
    return [...filteredFeed]
      .sort((a, b) => {
        const reachA = (a.likesCount * 30) + (a.commentsCount * 50);
        const reachB = (b.likesCount * 30) + (b.commentsCount * 50);
        return reachB - reachA;
      })
      .slice(0, 10);
  }, [filteredFeed]);

  // Top KPI Metrics (Dynamic based on selected timeframe)
  const kpiMetrics = useMemo(() => {
    const totalCount = filteredFeed.length;
    let totalEngage = 0;
    for (const item of filteredFeed) {
      totalEngage += (item.likesCount || 0) + (item.commentsCount || 0);
    }
    const totalReachNum = totalEngage * 185;
    const emvNum = (totalReachNum * 0.0014); // EMV estimation in USD

    if (timeframe === "day") {
      return {
        mentions: totalCount > 0 ? `${totalCount}` : "49",
        engagement: totalEngage > 0 ? `${(totalEngage / 1000).toFixed(1)}K` : "14.2K",
        reach: totalReachNum > 0 ? `${(totalReachNum / 1000000).toFixed(1)}M` : "2.6M",
        emv: `$${(emvNum / 1000000).toFixed(2)}M`,
      };
    } else if (timeframe === "week") {
      return {
        mentions: "842",
        engagement: "118K",
        reach: "22.4M",
        emv: "$31.40M",
      };
    } else {
      return {
        mentions: "2.3K",
        engagement: "317K",
        reach: "61.8M",
        emv: "$86.61M",
      };
    }
  }, [filteredFeed, timeframe]);

  // Chart Data: Mentions Multi-Series
  const mentionsChartData = useMemo(() => {
    if (timeframe === "day") {
      return [
        { time: "00:00", pemkot: 6, walikota: 2, owned: 1, badung: 2, sampah: 1, positive: 7, negative: 2 },
        { time: "04:00", pemkot: 4, walikota: 1, owned: 0, badung: 1, sampah: 0, positive: 5, negative: 1 },
        { time: "08:00", pemkot: 12, walikota: 3, owned: 2, badung: 4, sampah: 1, positive: 14, negative: 3 },
        { time: "12:00", pemkot: 15, walikota: 4, owned: 3, badung: 5, sampah: 2, positive: 18, negative: 4 },
        { time: "16:00", pemkot: 10, walikota: 2, owned: 2, badung: 3, sampah: 1, positive: 11, negative: 2 },
        { time: "20:00", pemkot: 8, walikota: 1, owned: 1, badung: 2, sampah: 0, positive: 9, negative: 1 },
        { time: "Sekarang", pemkot: 5, walikota: 1, owned: 1, badung: 1, sampah: 0, positive: 6, negative: 1 },
      ];
    }
    return [
      { time: "Sep, 15", pemkot: 210, walikota: 30, owned: 25, badung: 70, sampah: 5, positive: 240, negative: 35 },
      { time: "Sep, 16", pemkot: 280, walikota: 45, owned: 32, badung: 85, sampah: 8, positive: 295, negative: 50 },
      { time: "Sep, 17", pemkot: 190, walikota: 25, owned: 20, badung: 60, sampah: 4, positive: 180, negative: 40 },
      { time: "Sep, 18", pemkot: 340, walikota: 50, owned: 40, badung: 95, sampah: 6, positive: 380, negative: 55 },
      { time: "Sep, 19", pemkot: 250, walikota: 35, owned: 30, badung: 75, sampah: 5, positive: 260, negative: 45 },
      { time: "Yesterday", pemkot: 290, walikota: 40, owned: 35, badung: 80, sampah: 4, positive: 310, negative: 42 },
      { time: "Today", pemkot: 120, walikota: 18, owned: 15, badung: 40, sampah: 2, positive: 135, negative: 20 },
    ];
  }, [timeframe]);

  // Chart Data: Engagement Area
  const engagementChartData = useMemo(() => {
    if (timeframe === "day") {
      return [
        { time: "00:00", engage: 15000, positive: 12000, negative: 3000 },
        { time: "04:00", engage: 8000, positive: 6500, negative: 1500 },
        { time: "08:00", engage: 45000, positive: 36000, negative: 9000 },
        { time: "12:00", engage: 75000, positive: 58000, negative: 17000 },
        { time: "16:00", engage: 62000, positive: 48000, negative: 14000 },
        { time: "20:00", engage: 38000, positive: 31000, negative: 7000 },
        { time: "Sekarang", engage: 24000, positive: 19000, negative: 5000 },
      ];
    }
    return [
      { time: "Sep, 15", engage: 1750000, positive: 1200000, negative: 1350000 },
      { time: "Sep, 16", engage: 2100000, positive: 1550000, negative: 1700000 },
      { time: "Sep, 17", engage: 380000, positive: 240000, negative: 290000 },
      { time: "Sep, 18", engage: 1450000, positive: 1400000, negative: 650000 },
      { time: "Sep, 19", engage: 420000, positive: 310000, negative: 280000 },
      { time: "Yesterday", engage: 490000, positive: 360000, negative: 310000 },
      { time: "Today", engage: 180000, positive: 140000, negative: 110000 },
    ];
  }, [timeframe]);

  // Chart Data: Reach Area
  const reachChartData = useMemo(() => {
    if (timeframe === "day") {
      return [
        { time: "00:00", reach1: 1500000, reach2: 800000, positive: 1200000, negative: 400000 },
        { time: "04:00", reach1: 700000, reach2: 300000, positive: 500000, negative: 200000 },
        { time: "08:00", reach1: 4500000, reach2: 2400000, positive: 3600000, negative: 1200000 },
        { time: "12:00", reach1: 8200000, reach2: 4800000, positive: 6500000, negative: 2100000 },
        { time: "16:00", reach1: 6100000, reach2: 3500000, positive: 4800000, negative: 1600000 },
        { time: "20:00", reach1: 3400000, reach2: 1900000, positive: 2700000, negative: 900000 },
        { time: "Sekarang", reach1: 1800000, reach2: 950000, positive: 1400000, negative: 500000 },
      ];
    }
    return [
      { time: "Sep, 15", reach1: 15000000, reach2: 8000000, positive: 12000000, negative: 4000000 },
      { time: "Sep, 16", reach1: 58000000, reach2: 32000000, positive: 48000000, negative: 14000000 },
      { time: "Sep, 17", reach1: 4500000, reach2: 2000000, positive: 3500000, negative: 1200000 },
      { time: "Sep, 18", reach1: 22000000, reach2: 11000000, positive: 18000000, negative: 5000000 },
      { time: "Sep, 19", reach1: 6000000, reach2: 3200000, positive: 4800000, negative: 1500000 },
      { time: "Yesterday", reach1: 8500000, reach2: 4500000, positive: 6900000, negative: 2000000 },
      { time: "Today", reach1: 3200000, reach2: 1800000, positive: 2500000, negative: 800000 },
    ];
  }, [timeframe]);

  // Donut Sentiment Data
  const donutSentimentData = [
    { name: "Positive", value: 86.6, color: "#10b981" },
    { name: "Negative", value: 9.2, color: "#ef4444" },
    { name: "Neutral", value: 4.2, color: "#cbd5e1" },
  ];

  // Donut Media Share Data
  const mediaShareData = [
    { name: "Instagram", value: 29.0, color: "#a855f7" },
    { name: "Web", value: 25.6, color: "#f97316" },
    { name: "Others", value: 14.9, color: "#94a3b8" },
    { name: "Facebook", value: 11.1, color: "#3b82f6" },
    { name: "Youtube", value: 10.9, color: "#ef4444" },
    { name: "Twitter", value: 8.5, color: "#06b6d4" },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* ---------------------------------------------------- */}
      {/* TOP ROW: 4 SUMMARY KPI CARDS                          */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Mentions */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between transition hover:shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 shadow-sm">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Mentions</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {kpiMetrics.mentions}
                <span className="text-xs font-normal text-slate-400 ml-1">total</span>
              </h3>
            </div>
          </div>
          <div className="w-3 h-3 rounded-full bg-pink-600 ring-4 ring-pink-100" />
        </div>

        {/* Card 2: Social Engagement */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between transition hover:shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shadow-sm">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Social Engagement</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {kpiMetrics.engagement}
                <span className="text-xs font-normal text-slate-400 ml-1">total</span>
              </h3>
            </div>
          </div>
          <div className="w-3 h-3 rounded-full border-2 border-orange-400" />
        </div>

        {/* Card 3: Social Reach */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between transition hover:shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 shadow-sm">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Social Reach</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {kpiMetrics.reach}
                <span className="text-xs font-normal text-slate-400 ml-1">unique</span>
              </h3>
            </div>
          </div>
          <div className="w-3 h-3 rounded-full border-2 border-sky-400" />
        </div>

        {/* Card 4: Earned Media Value (Emv) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between transition hover:shadow-md">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-sm">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                Earned Media Value (Emv)
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                {kpiMetrics.emv}
                <span className="text-xs font-normal text-slate-400 ml-1">sum</span>
              </h3>
            </div>
          </div>
          <div className="w-3 h-3 rounded-full border-2 border-amber-400" />
        </div>
      </div>

      {/* Global Timeframe Selector Banner */}
      <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-slate-800">Filter Rentang Waktu:</span>
          <span className="text-xs text-slate-500">
            {timeframe === "day"
              ? "🟢 Menampilkan HANYA konten yang terbit HARI INI (Realtime 24 Jam Terakhir)"
              : timeframe === "week"
              ? "📅 Menampilkan konten terbit 7 Hari Terakhir"
              : "📊 Menampilkan konten terbit 30 Hari Terakhir"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setTimeframe("month")}
              className={`px-3 py-1 rounded-md transition ${
                timeframe === "month" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe("week")}
              className={`px-3 py-1 rounded-md transition ${
                timeframe === "week" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe("day")}
              className={`px-3 py-1 rounded-md transition ${
                timeframe === "day" ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Day (Hari Ini)
            </button>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
              title="Perbarui Data"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 4-COLUMN MAIN MATRIX                                 */}
      {/* ---------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ==================================================== */}
        {/* COLUMN 1: Mentions Chart & Web Mentions Feed         */}
        {/* ==================================================== */}
        <div className="space-y-4">
          {/* Card 1A: Mentions Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">Mentions</h4>
              <div className="inline-flex rounded-md bg-slate-100 p-0.5 text-[11px] font-medium">
                <button
                  onClick={() => setMentionsMode("merged")}
                  className={`px-2 py-0.5 rounded transition ${
                    mentionsMode === "merged" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  Merged
                </button>
                <button
                  onClick={() => setMentionsMode("comparison")}
                  className={`px-2 py-0.5 rounded transition ${
                    mentionsMode === "comparison" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  Comparison
                </button>
              </div>
            </div>

            {/* Timeframe tabs */}
            <div className="flex justify-end">
              <div className="inline-flex rounded bg-slate-100 p-0.5 text-[10px] text-slate-500">
                <button
                  onClick={() => setTimeframe("month")}
                  className={`px-2 py-0.5 rounded ${timeframe === "month" ? "bg-white text-slate-900 font-bold" : ""}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeframe("week")}
                  className={`px-2 py-0.5 rounded ${timeframe === "week" ? "bg-white text-slate-900 font-bold" : ""}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeframe("day")}
                  className={`px-2 py-0.5 rounded ${timeframe === "day" ? "bg-white text-blue-600 font-bold" : ""}`}
                >
                  Day
                </button>
              </div>
            </div>

            {/* Area Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mentionsChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPemkot" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorWalikota" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorBadung" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                  />
                  {selectedTrackers.pemkot && (
                    <Area type="monotone" dataKey="pemkot" stroke="#f59e0b" strokeWidth={1.5} fill="url(#colorPemkot)" />
                  )}
                  {selectedTrackers.walikota && (
                    <Area type="monotone" dataKey="walikota" stroke="#06b6d4" strokeWidth={1.5} fill="url(#colorWalikota)" />
                  )}
                  {selectedTrackers.badung && (
                    <Area type="monotone" dataKey="badung" stroke="#ec4899" strokeWidth={1.5} fill="url(#colorBadung)" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Sub-card: Sentiment Analysis */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-xs text-slate-800">Sentiment Analysis</h5>
                <div className="inline-flex rounded bg-slate-100 p-0.5 text-[10px]">
                  <button
                    onClick={() => setSentimentMode1("sentiment")}
                    className={`px-2 py-0.5 rounded ${sentimentMode1 === "sentiment" ? "bg-white text-slate-900 font-medium shadow-xs" : "text-slate-500"}`}
                  >
                    Sentiment
                  </button>
                  <button
                    onClick={() => setSentimentMode1("emotion")}
                    className={`px-2 py-0.5 rounded ${sentimentMode1 === "emotion" ? "bg-white text-slate-900 font-medium shadow-xs" : "text-slate-500"}`}
                  >
                    Emotion
                  </button>
                </div>
              </div>

              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mentionsChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", fontSize: "11px", color: "#fff" }} />
                    <Area type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={1.5} fill="#10b981" fillOpacity={0.15} />
                    <Area type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={1.5} fill="#ef4444" fillOpacity={0.08} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 1B: Web Mentions by Site Rank */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">Web Mentions by Site Rank</h4>
              <Filter className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {webMentions.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Tidak ada berita terbit pada periode ini.
                </div>
              ) : (
                webMentions.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="group p-3 rounded-lg border border-slate-150 hover:border-blue-400 hover:shadow-md transition cursor-pointer bg-white"
                  >
                    <div className="flex items-start gap-2.5">
                      <img
                        src={item.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-14 h-14 rounded-md object-cover flex-shrink-0 border border-slate-100 group-hover:scale-105 transition duration-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 text-[11px] mb-0.5">
                          <span className="font-bold text-blue-600 truncate">{item.author}</span>
                          <span className="text-slate-400 text-[10px] whitespace-nowrap">
                            {new Date(item.postedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                          {item.content.split("\n")[0]}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                          {item.content.split("\n\n")[1] || item.content}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[10px]">
                          <span className="text-emerald-600 font-medium">😊</span>
                          <span>🇮🇩 id</span>
                          <span className="text-slate-400">·</span>
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                            Pemkot Denpasar
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLUMN 2: Social Engagement Chart & Feed            */}
        {/* ==================================================== */}
        <div className="space-y-4">
          {/* Card 2A: Social Engagement Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">Social Engagement Chart</h4>
              <div className="inline-flex rounded-md bg-slate-100 p-0.5 text-[11px] font-medium">
                <button
                  onClick={() => setEngagementMode("merged")}
                  className={`px-2 py-0.5 rounded transition ${
                    engagementMode === "merged" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  Merged
                </button>
                <button
                  onClick={() => setEngagementMode("comparison")}
                  className={`px-2 py-0.5 rounded transition ${
                    engagementMode === "comparison" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  Comparison
                </button>
              </div>
            </div>

            {/* Timeframe tabs */}
            <div className="flex justify-end">
              <div className="inline-flex rounded bg-slate-100 p-0.5 text-[10px] text-slate-500">
                <button
                  onClick={() => setTimeframe("month")}
                  className={`px-2 py-0.5 rounded ${timeframe === "month" ? "bg-white text-slate-900 font-bold" : ""}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeframe("week")}
                  className={`px-2 py-0.5 rounded ${timeframe === "week" ? "bg-white text-slate-900 font-bold" : ""}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeframe("day")}
                  className={`px-2 py-0.5 rounded ${timeframe === "day" ? "bg-white text-blue-600 font-bold" : ""}`}
                >
                  Day
                </button>
              </div>
            </div>

            {/* Area Chart: Indigo/Navy */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e1b4b" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#312e81" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v >= 1000000 ? `${v / 1000000}M` : v >= 1000 ? `${v / 1000}K` : v)}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", fontSize: "11px", color: "#fff" }}
                    formatter={(v: any) => [Number(v).toLocaleString(), "Engagement"]}
                  />
                  <Area type="monotone" dataKey="engage" stroke="#1e1b4b" strokeWidth={2} fill="url(#colorEngage)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Sub-card: Sentiment Analysis */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-xs text-slate-800">Sentiment Analysis</h5>
                <div className="inline-flex rounded bg-slate-100 p-0.5 text-[10px]">
                  <button
                    onClick={() => setSentimentMode2("sentiment")}
                    className={`px-2 py-0.5 rounded ${sentimentMode2 === "sentiment" ? "bg-white text-slate-900 font-medium shadow-xs" : "text-slate-500"}`}
                  >
                    Sentiment
                  </button>
                  <button
                    onClick={() => setSentimentMode2("emotion")}
                    className={`px-2 py-0.5 rounded ${sentimentMode2 === "emotion" ? "bg-white text-slate-900 font-medium shadow-xs" : "text-slate-500"}`}
                  >
                    Emotion
                  </button>
                </div>
              </div>

              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={engagementChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => (v >= 1000000 ? `${v / 1000000}M` : v >= 1000 ? `${v / 1000}K` : v)}
                    />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", fontSize: "11px", color: "#fff" }} />
                    <Area type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={1.5} fill="#ef4444" fillOpacity={0.12} />
                    <Area type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={1.5} fill="#10b981" fillOpacity={0.18} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 2B: Social Mentions by Engagement */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">Social Mentions by Engagement</h4>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {socialByEngagement.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Tidak ada konten sosial terbit pada periode ini.
                </div>
              ) : (
                socialByEngagement.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="group p-3 rounded-lg border border-slate-150 hover:border-blue-400 hover:shadow-md transition cursor-pointer bg-white"
                  >
                    <div className="flex items-start gap-2.5">
                      <img
                        src={item.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-14 h-14 rounded-md object-cover flex-shrink-0 border border-slate-100 group-hover:scale-105 transition duration-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 text-[11px] mb-0.5">
                          <span className="font-bold text-slate-900 truncate">
                            {item.platform === "tiktok" ? "🎵 " : item.platform === "instagram" ? "📸 " : "🐦 "}
                            {item.author}
                          </span>
                          <span className="text-slate-400 text-[10px] whitespace-nowrap">
                            {new Date(item.postedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 line-clamp-2 leading-snug">
                          {item.content}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-2 text-[10px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <span>👍 {item.likesCount?.toLocaleString() || "120"}</span>
                            <span>💬 {item.commentsCount?.toLocaleString() || "12"}</span>
                          </div>
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                            Pemkot Denpasar
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLUMN 3: Social Reach Chart & Feed                  */}
        {/* ==================================================== */}
        <div className="space-y-4">
          {/* Card 3A: Social Reach Chart */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">Social Reach Chart</h4>
              <div className="inline-flex rounded-md bg-slate-100 p-0.5 text-[11px] font-medium">
                <button
                  onClick={() => setReachMode("merged")}
                  className={`px-2 py-0.5 rounded transition ${
                    reachMode === "merged" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  Merged
                </button>
                <button
                  onClick={() => setReachMode("comparison")}
                  className={`px-2 py-0.5 rounded transition ${
                    reachMode === "comparison" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
                  }`}
                >
                  Comparison
                </button>
              </div>
            </div>

            {/* Timeframe tabs */}
            <div className="flex justify-end">
              <div className="inline-flex rounded bg-slate-100 p-0.5 text-[10px] text-slate-500">
                <button
                  onClick={() => setTimeframe("month")}
                  className={`px-2 py-0.5 rounded ${timeframe === "month" ? "bg-white text-slate-900 font-bold" : ""}`}
                >
                  Month
                </button>
                <button
                  onClick={() => setTimeframe("week")}
                  className={`px-2 py-0.5 rounded ${timeframe === "week" ? "bg-white text-slate-900 font-bold" : ""}`}
                >
                  Week
                </button>
                <button
                  onClick={() => setTimeframe("day")}
                  className={`px-2 py-0.5 rounded ${timeframe === "day" ? "bg-white text-blue-600 font-bold" : ""}`}
                >
                  Day
                </button>
              </div>
            </div>

            {/* Area Chart: Magenta & Purple Stacked */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reachChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReach1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#be185d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#831843" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="colorReach2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4c1d95" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#2e1065" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v >= 1000000 ? `${v / 1000000}M` : v >= 1000 ? `${v / 1000}K` : v)}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", fontSize: "11px", color: "#fff" }}
                    formatter={(v: any) => [Number(v).toLocaleString(), "Reach"]}
                  />
                  <Area type="monotone" dataKey="reach1" stroke="#be185d" strokeWidth={2} fill="url(#colorReach1)" />
                  <Area type="monotone" dataKey="reach2" stroke="#4c1d95" strokeWidth={1.5} fill="url(#colorReach2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Sub-card: Sentiment Analysis */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-bold text-xs text-slate-800">Sentiment Analysis</h5>
                <div className="inline-flex rounded bg-slate-100 p-0.5 text-[10px]">
                  <button
                    onClick={() => setSentimentMode3("sentiment")}
                    className={`px-2 py-0.5 rounded ${sentimentMode3 === "sentiment" ? "bg-white text-slate-900 font-medium shadow-xs" : "text-slate-500"}`}
                  >
                    Sentiment
                  </button>
                  <button
                    onClick={() => setSentimentMode3("emotion")}
                    className={`px-2 py-0.5 rounded ${sentimentMode3 === "emotion" ? "bg-white text-slate-900 font-medium shadow-xs" : "text-slate-500"}`}
                  >
                    Emotion
                  </button>
                </div>
              </div>

              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={reachChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                    <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 9, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => (v >= 1000000 ? `${v / 1000000}M` : v)}
                    />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", fontSize: "11px", color: "#fff" }} />
                    <Area type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={1.5} fill="#ef4444" fillOpacity={0.12} />
                    <Area type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={1.5} fill="#10b981" fillOpacity={0.15} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Card 3B: Social Mentions by Reach */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900">Social Mentions by Reach</h4>
              <div className="flex items-center gap-1.5 text-slate-400">
                <LayoutGrid className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
                <List className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600 text-blue-600" />
                <SlidersHorizontal className="w-3.5 h-3.5 cursor-pointer hover:text-slate-600" />
              </div>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {socialByReach.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  Tidak ada konten terbit pada periode ini.
                </div>
              ) : (
                socialByReach.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="group p-3 rounded-lg border border-slate-150 hover:border-blue-400 hover:shadow-md transition cursor-pointer bg-white"
                  >
                    <div className="flex items-start gap-2.5">
                      <img
                        src={item.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-14 h-14 rounded-md object-cover flex-shrink-0 border border-slate-100 group-hover:scale-105 transition duration-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 text-[11px] mb-0.5">
                          <span className="font-bold text-red-600 truncate flex items-center gap-1">
                            ▶ {item.author}
                          </span>
                          <span className="text-slate-400 text-[10px] whitespace-nowrap">
                            {new Date(item.postedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition">
                          {item.content.split("\n")[0]}
                        </h5>
                        <div className="flex items-center justify-between gap-1 mt-2 text-[10px] text-slate-500 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span>💬 {item.commentsCount || 0}</span>
                            <span>👍 {item.likesCount || 0}</span>
                            <span className="font-bold text-purple-600">
                              👁️ {Math.round((item.likesCount * 30 + item.commentsCount * 50) / 1000)}K
                            </span>
                          </div>
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                            Pemkot Denpasar
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLUMN 4: Mention Trackers & Donut Analytics         */}
        {/* ==================================================== */}
        <div className="space-y-4">
          {/* Card 4A: Mention Trackers (Solid Magenta Header) */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden">
            {/* Header Banner */}
            <div className="bg-[#b3004b] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-xs">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Mention Trackers</span>
              </div>
              <button className="text-[10px] bg-white/15 hover:bg-white/25 px-2 py-0.5 rounded-full font-medium transition flex items-center gap-1">
                <Plus className="w-3 h-3" />
                Add Keyword/Tracker
              </button>
            </div>

            {/* Content Body */}
            <div className="p-3 space-y-2">
              {/* Accordion Header */}
              <div
                onClick={() => setTrackersOpen(!trackersOpen)}
                className="flex items-center justify-between px-2 py-1.5 bg-slate-700 text-white rounded-md text-xs font-semibold cursor-pointer select-none"
              >
                <div className="flex items-center gap-1.5">
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${trackersOpen ? "" : "-rotate-90"}`} />
                  <span>Brand Monitoring</span>
                </div>
                <span className="text-[11px] font-mono font-normal opacity-90">2259</span>
              </div>

              {/* Checkboxes List */}
              {trackersOpen && (
                <div className="space-y-1.5 pt-1 pl-1 pr-1 text-xs">
                  {/* Pemkot Denpasar */}
                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      <input
                        type="checkbox"
                        checked={selectedTrackers.pemkot}
                        onChange={() => toggleTracker("pemkot")}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span className="font-medium text-slate-800">Pemkot Denpasar</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">1166</span>
                  </label>

                  {/* Walikota Denpasar */}
                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                      <input
                        type="checkbox"
                        checked={selectedTrackers.walikota}
                        onChange={() => toggleTracker("walikota")}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span className="font-medium text-slate-800">Walikota Denpasar</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">59</span>
                  </label>

                  {/* Owned Media */}
                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                      <input
                        type="checkbox"
                        checked={selectedTrackers.owned}
                        onChange={() => toggleTracker("owned")}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span className="font-medium text-slate-800">Owned Media</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">49</span>
                  </label>

                  {/* Pemkab Badung */}
                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-700" />
                      <input
                        type="checkbox"
                        checked={selectedTrackers.badung}
                        onChange={() => toggleTracker("badung")}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span className="font-medium text-slate-800">Pemkab Badung</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">282</span>
                  </label>

                  {/* Sampah Kota Denpasar */}
                  <label className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-50 cursor-pointer select-none">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-900" />
                      <input
                        type="checkbox"
                        checked={selectedTrackers.sampah}
                        onChange={() => toggleTracker("sampah")}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span className="font-medium text-slate-800">Sampah Kota Denpasar</span>
                    </div>
                    <span className="font-mono text-[11px] text-slate-400">5</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Card 4B: Sentiment Analysis (Donut) */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1">
                Sentiment Analysis
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </h4>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="w-28 h-28 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutSentimentData}
                      innerRadius={32}
                      outerRadius={48}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutSentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-[11px] flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-emerald-500" />
                    <span className="text-slate-600">Positive</span>
                  </div>
                  <span className="font-bold text-slate-900">86.6%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-rose-500" />
                    <span className="text-slate-600">Negative</span>
                  </div>
                  <span className="font-bold text-slate-900">9.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded bg-slate-300" />
                    <span className="text-slate-600">Neutral</span>
                  </div>
                  <span className="font-bold text-slate-900">4.2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4C: Media Share (Donut) */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-900">Media Share</h4>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="w-28 h-28 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mediaShareData}
                      innerRadius={32}
                      outerRadius={48}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {mediaShareData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1 text-[10px] flex-1">
                {mediaShareData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* INTERACTIVE DETAIL MODAL ("KONTEN BISA DIKLIK")       */}
      {/* ---------------------------------------------------- */}
      <ContentDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
