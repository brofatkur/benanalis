"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MessageSquare,
  Share2,
  ThumbsUp,
  RefreshCw,
  FileText,
  Send,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Info,
  Layers,
  BarChart3,
  Search,
  Filter,
  Sliders,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Smartphone,
  Check,
  XCircle,
  Database,
  ImageIcon,
  Play
} from "lucide-react";
import ExecutiveReportModal from "@/components/ExecutiveReportModal";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

const COLORS = {
  positif: "#10b981", // Emerald-500
  netral: "#94a3b8",  // Slate-400
  negatif: "#ef4444", // Red-500
  primary: "#2563eb", // Blue-600
  instagram: "#e1306c",
  tiktok: "#000000",
  twitter: "#1da1f2",
  facebook: "#1877f2",
};

export default function MediaAnalitikDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "topics" | "feed" | "profile" | "integrations">("overview");
  const [overviewData, setOverviewData] = useState<any>(null);
  const [topicsData, setTopicsData] = useState<any[]>([]);
  const [feedData, setFeedData] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Feed filters
  const [feedType, setFeedType] = useState<"all" | "post" | "comment">("all");
  const [feedPlatform, setFeedPlatform] = useState<string>("all");
  const [feedSentiment, setFeedSentiment] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // WhatsApp Simulator State
  const [simPhone, setSimPhone] = useState("628123456789");
  const [simMessage, setSimMessage] = useState("sentimen hari ini gimana?");
  const [botChatHistory, setBotChatHistory] = useState<Array<{ sender: string; text: string; time: string }>>([
    {
      sender: "bot",
      text: "Om Swastyastu! Saya Asisten AI Media Analitik Pemkot Denpasar 🏛️. Silakan tanyakan sentimen harian atau keluhan warga terkait fasilitas publik.",
      time: "10:00",
    },
  ]);
  const [botLoading, setBotLoading] = useState(false);

  // Anomaly test state
  const [anomalyResult, setAnomalyResult] = useState<any>(null);
  const [anomalyTesting, setAnomalyTesting] = useState(false);

  // PDF report preview modal
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [ovRes, topRes, feedRes, profRes] = await Promise.all([
        fetch("/api/analytics/overview?days=30"),
        fetch("/api/analytics/topics"),
        fetch("/api/analytics/feed?limit=50"),
        fetch("/api/profile"),
      ]);

      if (ovRes.ok) {
        const ovJson = await ovRes.json();
        setOverviewData(ovJson.data);
      }
      if (topRes.ok) {
        const topJson = await topRes.json();
        setTopicsData(topJson.data || []);
      }
      if (feedRes.ok) {
        const feedJson = await feedRes.json();
        setFeedData(feedJson.data || []);
      }
      if (profRes.ok) {
        const profJson = await profRes.json();
        setProfileData(profJson.data);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter feed when controls change
  const fetchFilteredFeed = async () => {
    try {
      const url = new URL("/api/analytics/feed", window.location.origin);
      url.searchParams.set("type", feedType);
      if (feedPlatform !== "all") url.searchParams.set("platform", feedPlatform);
      if (feedSentiment !== "all") url.searchParams.set("sentiment", feedSentiment);
      if (searchQuery) url.searchParams.set("q", searchQuery);

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        setFeedData(json.data || []);
      }
    } catch (err) {
      console.error("Feed filter error:", err);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchFilteredFeed();
    }
  }, [feedType, feedPlatform, feedSentiment, searchQuery]);

  // Trigger manual crawl & pipeline run
  const triggerCrawlPipeline = async () => {
    try {
      setRefreshing(true);
      setActionMessage("Menghubungi SocialCrawl & memproses ETL pipeline...");
      const res = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: profileData?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        await fetchData();
      } else {
        setActionMessage(`Gagal: ${data.error}`);
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setRefreshing(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  // Trigger anomaly check
  const triggerAnomalyCheck = async () => {
    try {
      setAnomalyTesting(true);
      const res = await fetch("/api/notify/anomaly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: profileData?.id }),
      });
      const data = await res.json();
      if (data.success) {
        setAnomalyResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnomalyTesting(false);
    }
  };

  const [sendingDailyReport, setSendingDailyReport] = useState(false);
  const [dailyReportSentStatus, setDailyReportSentStatus] = useState<string | null>(null);

  // WhatsApp bot test send
  const handleSendBotMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simMessage.trim()) return;

    const userText = simMessage;
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setBotChatHistory((prev) => [...prev, { sender: "user", text: userText, time: nowStr }]);
    setSimMessage("");
    setBotLoading(true);

    try {
      const res = await fetch("/api/webhook/kirimdev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: simPhone,
          message: userText,
          org_id: profileData?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBotChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      setBotChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Terjadi kesalahan pada server WhatsApp gateway.", time: nowStr },
      ]);
    } finally {
      setBotLoading(false);
    }
  };

  const handleSendQuickBotMessage = async (text: string) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setBotChatHistory((prev) => [...prev, { sender: "user", text, time: nowStr }]);
    setBotLoading(true);

    try {
      const res = await fetch("/api/webhook/kirimdev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: simPhone,
          message: text,
          org_id: profileData?.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBotChatHistory((prev) => [
          ...prev,
          {
            sender: "bot",
            text: data.reply,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch {
      setBotChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "Terjadi kesalahan pada server WhatsApp gateway.", time: nowStr },
      ]);
    } finally {
      setBotLoading(false);
    }
  };

  const handleTriggerDailyBroadcast = async () => {
    setSendingDailyReport(true);
    setDailyReportSentStatus(null);
    try {
      const res = await fetch("/api/notify/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sendDirect: true }),
      });
      const data = await res.json();
      if (data.success) {
        setDailyReportSentStatus("✅ Laporan harian berhasil dikirim ke nomor WhatsApp berwenang!");
      } else {
        setDailyReportSentStatus("❌ Gagal mengirim broadcast laporan harian.");
      }
    } catch {
      setDailyReportSentStatus("❌ Kesalahan koneksi saat mengirim broadcast.");
    } finally {
      setSendingDailyReport(false);
    }
  };

  // Perspective profile form update
  const [profileForm, setProfileForm] = useState<any>(null);
  useEffect(() => {
    if (profileData) {
      setProfileForm(JSON.parse(JSON.stringify(profileData)));
    }
  }, [profileData]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm) return;
    try {
      setRefreshing(true);
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        await fetchData();
      } else {
        setActionMessage(`Gagal simpan: ${data.error}`);
      }
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setRefreshing(false);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  if (loading && !overviewData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold tracking-wide">Memuat Dashboard Media Analitik...</h2>
        <p className="text-slate-400 text-sm mt-1">Mengambil data Insforge PostgreSQL & analisis sentimen...</p>
      </div>
    );
  }

  const summary = overviewData?.summary || {
    totalInteractions: 0,
    totalPosts: 0,
    totalComments: 0,
    netSentiment: 0,
    posPercentage: 0,
    negPercentage: 0,
    neuPercentage: 0,
    postsBreakdown: { pos: 0, neg: 0, neu: 0 },
    commentsBreakdown: { pos: 0, neg: 0, neu: 0 },
  };

  const trend = overviewData?.trend || [];
  const platforms = overviewData?.platforms || {};

  const platformPieData = [
    { name: "Instagram", value: platforms.instagram || 8, color: COLORS.instagram },
    { name: "TikTok", value: platforms.tiktok || 6, color: "#000000" },
    { name: "Twitter / X", value: platforms.twitter || 6, color: COLORS.twitter },
    { name: "Facebook", value: platforms.facebook || 4, color: COLORS.facebook },
  ];

  const postVsCommentBarData = [
    {
      kategori: "Post Konten Utama",
      Positif: summary.postsBreakdown?.pos || 12,
      Netral: summary.postsBreakdown?.neu || 5,
      Negatif: summary.postsBreakdown?.neg || 7,
    },
    {
      kategori: "Kolom Komentar Publik",
      Positif: summary.commentsBreakdown?.pos || 18,
      Netral: summary.commentsBreakdown?.neu || 10,
      Negatif: summary.commentsBreakdown?.neg || 24,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg tracking-tight">
                  Media Analitik ASA Group
                </h1>
                <span className="bg-blue-900/60 text-blue-300 text-xs px-2 py-0.5 rounded-full font-medium border border-blue-700/50">
                  Pilot: Pemkot Denpasar
                </span>
                <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-mono">
                  v{profileData?.profile_version || 1}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Database className="w-3.5 h-3.5 text-emerald-400 inline" />
                Insforge PostgreSQL · RLS Multi-Tenant Aktif · IndoBERT + DeepSeek
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={triggerCrawlPipeline}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Memproses ETL..." : "Crawl & Analisis Baru"}
            </button>
            <button
              onClick={() => {
                setActiveTab("integrations");
                triggerAnomalyCheck();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600/90 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow transition"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Deteksi Anomali
            </button>
            <button
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" />
              Laporan PDF
            </button>
          </div>
        </div>

        {/* Global Toast / Action Message */}
        {actionMessage && (
          <div className="bg-blue-600/95 text-white text-xs font-medium px-4 py-2 text-center animate-fade-in flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            {actionMessage}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 border-t border-slate-800/80 overflow-x-auto">
          {[
            { id: "overview", label: "Ringkasan Eksekutif", icon: BarChart3 },
            { id: "topics", label: "Analisis Topik & Isu", icon: Layers },
            { id: "feed", label: "Social Stream & Komentar", icon: MessageSquare },
            { id: "profile", label: "Profil & Aturan Sentimen", icon: Sliders },
            { id: "integrations", label: "WhatsApp Bot & Notifikasi", icon: Smartphone },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? "border-blue-500 text-blue-400 bg-slate-800/40"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ======================= TAB 1: OVERVIEW ======================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Net Sentiment Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Net Sentiment Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span
                      className={`text-3xl font-extrabold ${
                        summary.netSentiment >= 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {summary.netSentiment > 0 ? `+${summary.netSentiment}` : summary.netSentiment}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">skala -100 ~ +100</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-center gap-1 font-medium">
                  {summary.netSentiment >= 0 ? (
                    <>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600">Dominan Positif</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                      <span className="text-red-600">Perlu Atensi Pemda</span>
                    </>
                  )}
                </div>
              </div>

              {/* Total Interaction Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Volume
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {summary.totalInteractions.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">konten</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span>Post: <b>{summary.totalPosts}</b></span>
                  <span>Komentar: <b>{summary.totalComments}</b></span>
                </div>
              </div>

              {/* Positive Sentiment Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Positif
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-extrabold text-emerald-600">
                      {summary.posPercentage}%
                    </span>
                    <span className="text-xs text-slate-400">({summary.totalPos})</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${summary.posPercentage}%` }}
                  />
                </div>
              </div>

              {/* Neutral Sentiment Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400" /> Netral
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-extrabold text-slate-700">
                      {summary.neuPercentage}%
                    </span>
                    <span className="text-xs text-slate-400">({summary.totalNeu})</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-slate-400 h-full rounded-full"
                    style={{ width: `${summary.neuPercentage}%` }}
                  />
                </div>
              </div>

              {/* Negative Sentiment Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-red-700 uppercase tracking-wider flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Negatif (Keluhan)
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-extrabold text-red-600">
                      {summary.negPercentage}%
                    </span>
                    <span className="text-xs text-slate-400">({summary.totalNeg})</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-red-500 h-full rounded-full"
                    style={{ width: `${summary.negPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Anomaly Banner if alert is active */}
            {overviewData?.anomaly?.is_anomaly && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3 shadow-sm">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-800">
                    Anomali Sentimen Terdeteksi pada {overviewData.anomaly.check_date}
                  </h4>
                  <p className="text-xs text-red-700 mt-1 leading-relaxed">
                    Rasio sentimen negatif melonjak di atas baseline 7 hari. Pemicu utama: keluhan
                    infrastruktur jalan PUPR dan tumpukan sampah DLHK. Notifikasi otomatis telah
                    disiapkan untuk gateway WhatsApp.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("integrations")}
                  className="text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition"
                >
                  Detail Alert
                </button>
              </div>
            )}

            {/* Main Trend Chart */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Tren Sentimen Media Sosial (30 Hari Terakhir)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data historis dari tabel materialized <code>daily_rollup</code> di Insforge PostgreSQL
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" /> Positif
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="w-3 h-3 rounded-full bg-slate-400" /> Netral
                  </span>
                  <span className="flex items-center gap-1.5 text-red-600">
                    <span className="w-3 h-3 rounded-full bg-red-500" /> Negatif
                  </span>
                </div>
              </div>

              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.positif} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={COLORS.positif} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorNeg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.negatif} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={COLORS.negatif} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorNeu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.netral} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.netral} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="positif"
                      stroke={COLORS.positif}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPos)"
                      name="Positif"
                    />
                    <Area
                      type="monotone"
                      dataKey="netral"
                      stroke={COLORS.netral}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorNeu)"
                      name="Netral"
                    />
                    <Area
                      type="monotone"
                      dataKey="negatif"
                      stroke={COLORS.negatif}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorNeg)"
                      name="Negatif"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Row: Post vs Comments & Platform Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Post vs. Komentar Deep Dive (PRD Key requirement) */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Perbandingan Sentimen: Post vs. Kolom Komentar
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sesuai PRD: komentar dianalisis terpisah karena reaksi publik paling tajam muncul di kolom komentar
                    </p>
                  </div>
                </div>

                <div className="h-60 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={postVsCommentBarData}
                      layout="vertical"
                      margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tickLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                      <YAxis
                        type="category"
                        dataKey="kategori"
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#1e293b", fontWeight: 600 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          borderColor: "#334155",
                          borderRadius: "8px",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Legend iconSize={10} wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                      <Bar dataKey="Positif" fill={COLORS.positif} radius={[0, 4, 4, 0]} />
                      <Bar dataKey="Netral" fill={COLORS.netral} radius={[0, 4, 4, 0]} />
                      <Bar dataKey="Negatif" fill={COLORS.negatif} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>
                    <b>Temuan Analitik:</b> Sentimen negatif pada kolom komentar tercatat 2.4x lebih tinggi
                    dibandingkan konten post. Warga aktif menyampaikan keluhan teknis (jalan berlubang,
                    antrian RSUD) pada tanggapan publik.
                  </span>
                </div>
              </div>

              {/* Platform Distribution Breakdown */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Distribusi Platform</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Sebaran sumber data SocialCrawl API</p>

                  <div className="h-48 w-full mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={platformPieData}
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {platformPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            borderColor: "#334155",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  {platformPieData.map((p) => (
                    <div key={p.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.name}
                      </span>
                      <span className="font-bold text-slate-900">{p.value} post</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: TOPICS ======================= */}
        {activeTab === "topics" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Pemodelan Topik (BERTopic Clustering)
                </h2>
                <p className="text-xs text-slate-500">
                  Pengelompokan otomatis isu publik dan sentimen per bidang dinas Pemkot Denpasar
                </p>
              </div>
              <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-2.5 py-1 rounded-full border border-purple-200">
                Model: Multilingual Sentence Transformers + BERTopic
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {topicsData.map((topic) => {
                const isHighNegative = topic.negPercentage >= 50;
                return (
                  <div
                    key={topic.id}
                    className={`bg-white rounded-xl border p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between ${
                      isHighNegative ? "border-red-300" : "border-slate-200"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-400 font-mono">
                          Topic #{topic.topic_id}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isHighNegative
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {topic.negPercentage}% Negatif
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base mb-2">
                        {topic.label}
                      </h3>

                      {/* Keywords chips */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {topic.keywords?.slice(0, 6).map((kw: string) => (
                          <span
                            key={kw}
                            className="bg-slate-100 text-slate-600 text-[11px] px-2 py-0.5 rounded font-medium"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      {/* Sentiment Bar */}
                      <div className="text-xs text-slate-500 mb-1 flex justify-between font-medium">
                        <span>Sebaran Sentimen</span>
                        <span>{topic.totalVolume} Interaksi</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full flex overflow-hidden">
                        <div
                          style={{ width: `${topic.posPercentage}%` }}
                          className="bg-emerald-500 h-full"
                          title={`Positif: ${topic.posPercentage}%`}
                        />
                        <div
                          style={{ width: `${topic.neuPercentage}%` }}
                          className="bg-slate-400 h-full"
                          title={`Netral: ${topic.neuPercentage}%`}
                        />
                        <div
                          style={{ width: `${topic.negPercentage}%` }}
                          className="bg-red-500 h-full"
                          title={`Negatif: ${topic.negPercentage}%`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500">
                        <span className="text-emerald-600">🟢 {topic.positif} Pos</span>
                        <span className="text-slate-500">⚪ {topic.netral} Net</span>
                        <span className="text-red-600">🔴 {topic.negatif} Neg</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================= TAB 3: SOCIAL FEED & DRILL-DOWN ======================= */}
        {activeTab === "feed" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center flex-wrap gap-2">
                {/* Type Switcher */}
                <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-semibold">
                  {(["all", "post", "comment"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFeedType(t)}
                      className={`px-3 py-1.5 rounded-md transition ${
                        feedType === t
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {t === "all" ? "Semua Feed" : t === "post" ? "Hanya Post" : "Hanya Komentar"}
                    </button>
                  ))}
                </div>

                {/* Platform Filter */}
                <select
                  value={feedPlatform}
                  onChange={(e) => setFeedPlatform(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700"
                >
                  <option value="all">Semua Platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="twitter">Twitter / X</option>
                  <option value="facebook">Facebook</option>
                </select>

                {/* Sentiment Filter */}
                <select
                  value={feedSentiment}
                  onChange={(e) => setFeedSentiment(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-medium text-slate-700"
                >
                  <option value="all">Semua Sentimen</option>
                  <option value="positif">🟢 Positif</option>
                  <option value="netral">⚪ Netral</option>
                  <option value="negatif">🔴 Negatif (Keluhan)</option>
                </select>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari konten atau author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Feed Cards */}
            <div className="space-y-3">
              {feedData.length === 0 ? (
                <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500 text-sm">
                  Tidak ditemukan post atau komentar yang sesuai filter.
                </div>
              ) : (
                feedData.map((item) => {
                  const isPost = item.itemType === "post";
                  const sentimentColor =
                    item.sentiment === "positif"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : item.sentiment === "negatif"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition hover:border-slate-300"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              isPost
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {isPost ? "Konten Post" : "Komentar Warga"}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            @{item.author}
                          </span>
                          <span className="text-xs text-slate-400 uppercase font-semibold">
                            · {item.platform}
                          </span>
                          <span className="text-xs text-slate-400">
                            · {new Date(item.postedAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${sentimentColor}`}
                          >
                            {item.sentiment.toUpperCase()} ({(item.sentimentScore * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>

                      {/* Content Body with Thumbnail */}
                      <div className="flex flex-col sm:flex-row gap-4 mt-3">
                        {item.thumbnailUrl && (
                          <div className="sm:w-36 h-28 flex-shrink-0 relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs">
                            <img
                              src={item.thumbnailUrl}
                              alt={item.author}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                              loading="lazy"
                            />
                            {/* Platform Tag Badge Overlay */}
                            <div className="absolute top-1.5 left-1.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                              {item.platform === "tiktok" && <Play className="w-2.5 h-2.5 fill-white" />}
                              {item.platform === "instagram" && <ImageIcon className="w-2.5 h-2.5" />}
                              <span className="capitalize">{item.platform}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          {/* Content Text */}
                          <p className="text-slate-800 text-sm leading-relaxed font-normal">
                            {item.content}
                          </p>

                          {/* Perspective Profile Explanation Box */}
                          <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start gap-2 text-xs">
                            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-slate-600">
                              <span className="font-semibold text-slate-800">
                                Analisis Institusi ({item.modelUsed}):{" "}
                              </span>
                              {item.reasoning}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-3.5 h-3.5" /> {item.likesCount || 0}
                          </span>
                          {isPost && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5" /> {item.commentsCount || 0} komentar
                            </span>
                          )}
                        </div>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            Lihat di {item.platform} <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================= TAB 4: PERSPECTIVE PROFILE ======================= */}
        {activeTab === "profile" && profileForm && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Profil Sudut Pandang Institusi (Perspective Profile)
                </h2>
                <p className="text-xs text-slate-500">
                  Menyesuaikan acuan evaluasi sentimen khusus untuk Pemerintah Kota Denpasar. Perubahan akan membuat versi baru secara otomatis.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full border border-blue-200">
                  Versi Aktif: v{profileForm.profile_version}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Identitas Institusi
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Institusi
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tipe Organisasi
                    </label>
                    <input
                      type="text"
                      value={profileForm.org_type}
                      onChange={(e) => setProfileForm({ ...profileForm, org_type: e.target.value })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Focus Areas */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                  Area Fokus Pemantauan & OPD/Dinas Terkait
                </h3>
                <div className="space-y-2">
                  {profileForm.focus_areas?.map((fa: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div className="flex-1 font-semibold text-slate-800">{fa.name}</div>
                      <div className="text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">{fa.dinas}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Context Rules (Key PRD feature) */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">
                    Aturan Konteks Sentimen Institusi (Context Rules)
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Disuntikkan ke System Prompt DeepSeek & Klasifikasi
                  </span>
                </div>

                <div className="space-y-2.5">
                  {profileForm.context_rules?.map((rule: any, rIdx: number) => (
                    <div key={rIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs gap-3">
                      <div className="flex-1">
                        <span className="font-bold text-slate-700 uppercase text-[10px] bg-white px-2 py-0.5 rounded border mr-2">
                          {rule.scope}
                        </span>
                        <span className="text-slate-800">{rule.condition}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            rule.classification === "positif"
                              ? "bg-emerald-100 text-emerald-800"
                              : rule.classification === "negatif"
                              ? "bg-red-100 text-red-800"
                              : "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {rule.classification.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={refreshing}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Simpan Perubahan & Rilis Versi Baru
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======================= TAB 5: INTEGRATIONS & WHATSAPP ======================= */}
        {activeTab === "integrations" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* WhatsApp Kirimdev Bot Simulator */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[560px]">
              <div className="p-4 border-b border-slate-200 bg-emerald-700 text-white rounded-t-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Bot WhatsApp Kirimdev</h3>
                    <p className="text-[11px] text-emerald-100">Kirimdev-hermes / Webhook Gateway</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded font-mono text-emerald-200">
                    Access Control: Aktif
                  </span>
                </div>
              </div>

              {/* Chat history */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#e5ddd5]/30">
                {botChatHistory.map((msg, mIdx) => {
                  const isBot = msg.sender === "bot";
                  return (
                    <div
                      key={mIdx}
                      className={`flex ${isBot ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 text-xs shadow-sm leading-relaxed whitespace-pre-line ${
                          isBot
                            ? "bg-white text-slate-800 border border-slate-200 rounded-tl-none"
                            : "bg-[#dcf8c6] text-slate-900 rounded-tr-none"
                        }`}
                      >
                        {msg.text}
                        <div className="text-[9px] text-slate-400 text-right mt-1">
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {botLoading && (
                  <div className="text-xs text-slate-400 italic">Bot sedang mengetik...</div>
                )}
              </div>

              {/* Quick Action Chips */}
              <div className="px-3 pt-2 pb-1 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-slate-400 font-medium mr-0.5">Pintasan Cepat:</span>
                <button
                  type="button"
                  onClick={() => handleSendQuickBotMessage("Laporan Harian")}
                  disabled={botLoading}
                  className="px-2 py-0.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 rounded text-[10.5px] font-medium transition shadow-xs"
                >
                  📊 Laporan Harian
                </button>
                <button
                  type="button"
                  onClick={() => handleSendQuickBotMessage("Isu Positif")}
                  disabled={botLoading}
                  className="px-2 py-0.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 rounded text-[10.5px] font-medium transition shadow-xs"
                >
                  🟢 Isu Positif
                </button>
                <button
                  type="button"
                  onClick={() => handleSendQuickBotMessage("Isu Negatif")}
                  disabled={botLoading}
                  className="px-2 py-0.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 rounded text-[10.5px] font-medium transition shadow-xs"
                >
                  🔴 Isu Negatif
                </button>
                <button
                  type="button"
                  onClick={() => handleSendQuickBotMessage("Rekomendasi Konten")}
                  disabled={botLoading}
                  className="px-2 py-0.5 bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 rounded text-[10.5px] font-medium transition shadow-xs"
                >
                  💡 Rekomendasi
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendBotMessage} className="p-3 bg-white border-t border-slate-200 flex flex-col gap-2 rounded-b-xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold">Nomor Pengirim:</span>
                  <input
                    type="text"
                    value={simPhone}
                    onChange={(e) => setSimPhone(e.target.value)}
                    placeholder="628123456789"
                    className="p-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono w-36"
                  />
                  <span className="text-[10px] text-slate-400">(Ubah untuk uji verifikasi akses)</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    placeholder="Tanya sentimen hari ini, keluhan jalan rusak, isu sampah..."
                    className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="submit"
                    disabled={botLoading}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Daily Report Broadcast & Anomaly Detection */}
            <div className="space-y-6">
              {/* Daily Report Broadcast Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">
                        Notifikasi Laporan Harian WhatsApp
                      </h3>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        Standar Pemkot
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Format pesan monitoring harian terstruktur: KPI ringkasan, Isu Positif, Isu Negatif Aktif, Isu Potensi Negatif & Rekomendasi Konten.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-3 text-xs border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                      Preview Template Pesan:
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">19 September 2026</span>
                  </div>
                  <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-[11px] text-slate-700 max-h-32 overflow-y-auto whitespace-pre-line leading-relaxed">
{`*📊 Laporan Harian Media Monitoring*
*Pemkot Denpasar — 19 September 2026*

Data mention 18–19 September 2026: *254 mention* (22 media online · 232 media sosial), *125.308 views*.
Sentimen: *70,1% positif* · 27,2% netral · 2,8% negatif.

🟢 *Isu Positif*
1. Papan nama multifungsi dari sampah plastik (BWC–Pepsico) di Taman Kota Lumintang
2. Gubernur Koster kunjungi SMPN 13 Denpasar, didampingi Walikota
3. Pembetonan Jl. Gajah Mada sebagai awal penataan heritage

🔴 *Isu Negatif Aktif*
1. Wi-Fi Corner Pemkot di ruang publik mati (Taman Kota Lumintang)

🟡 *Isu Potensi Negatif*
1. Keluhan & penataan parkir (UMKM, pedagang bermobil, trotoar)
2. Sorotan Fraksi Gerindra: pegawai Perumda Pasar 639 orang

💡 *Rekomendasi Konten* (4 rencana konten Reels, TikTok, Carousel)
📌 Laporan lengkap (PDF) sudah dikirim di chat ini.`}
                  </div>
                </div>

                {dailyReportSentStatus && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-medium">
                    {dailyReportSentStatus}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => handleSendQuickBotMessage("Laporan Harian")}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 flex items-center gap-1.5 transition"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    Simulasikan di Bot
                  </button>
                  <button
                    onClick={handleTriggerDailyBroadcast}
                    disabled={sendingDailyReport}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingDailyReport ? "Mengirim ke Gateway..." : "Kirim via Kirimdev Gateway"}
                  </button>
                </div>
              </div>

              {/* Anomaly Detection & Cron Scheduler */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Deteksi Anomali Harian
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Membandingkan sentimen negatif hari ini terhadap moving average 7 hari
                    </p>
                  </div>
                  <button
                    onClick={triggerAnomalyCheck}
                    disabled={anomalyTesting}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {anomalyTesting ? "Menganalisis..." : "Jalankan Tes"}
                  </button>
                </div>

                {anomalyResult ? (
                  <div className="space-y-3">
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        anomalyResult.isAnomaly
                          ? "bg-red-50 border-red-200 text-red-900"
                          : "bg-emerald-50 border-emerald-200 text-emerald-900"
                      }`}
                    >
                      {anomalyResult.isAnomaly ? (
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-bold text-sm">
                          {anomalyResult.isAnomaly ? "Anomali Terdeteksi!" : "Kondisi Stabil"}
                        </h4>
                        <p className="text-xs mt-1 leading-relaxed">
                          {anomalyResult.message}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 font-medium">Rasio Negatif Hari Ini</span>
                        <div className="text-xl font-bold text-slate-900 mt-1">
                          {(anomalyResult.currentNegRatio * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <span className="text-slate-400 font-medium">Baseline 7 Hari</span>
                        <div className="text-xl font-bold text-slate-900 mt-1">
                          {(anomalyResult.baseline7dNegRatio * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Klik tombol "Jalankan Tes" untuk memicu simulasi pengecekan anomali terhadap data Insforge.
                  </p>
                )}
              </div>

              {/* Cron & Pipeline Status */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
                  Status Scheduler & Integrasi
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">SocialCrawl Ingestion Cron</span>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">Aktif (Tiap 4 Jam)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">BERTopic Batch Job Python</span>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">Jadwal Malam (23:00 WITA)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">Notifikasi WhatsApp Harian</span>
                    <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded">Trigger 08:00 WITA</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700">Insforge Multi-Tenant RLS</span>
                    <span className="text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded">Terkunci per Org</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ======================= EXECUTIVE 12-PAGE PRESENTATION REPORT MODAL ======================= */}
      <ExecutiveReportModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
      />
    </div>
  );
}
