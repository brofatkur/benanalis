import { dbSelect } from "@/lib/db/client";

export interface PerspectiveProfile {
  id: string;
  name: string;
  org_type: string;
  focus_areas: Array<{ id: string; name: string; dinas: string }>;
  related_entities: Array<{ name: string; role: string }>;
  context_rules: Array<{
    condition: string;
    classification: "positif" | "negatif" | "netral";
    weight: "high" | "medium" | "normal";
    scope: string;
  }>;
  profile_version: number;
}

export interface SentimentAnalysisResult {
  label: "positif" | "negatif" | "netral";
  score: number;
  model_used: "indobert-lexicon" | "deepseek-v3" | "hybrid-rules";
  profile_version_id: number;
  reasoning: string;
}

// Colloquial Indonesian normalization map
const SLANG_MAP: Record<string, string> = {
  bgt: "banget",
  bener: "benar",
  ga: "tidak",
  gak: "tidak",
  ngga: "tidak",
  nggak: "tidak",
  tdk: "tidak",
  tp: "tapi",
  jg: "juga",
  jgn: "jangan",
  klo: "kalau",
  klu: "kalau",
  krn: "karena",
  bisaa: "bisa",
  bngt: "banget",
  rusakkk: "rusak",
  parahh: "parah",
  ancur: "hancur",
  mantapp: "mantap",
  kerenn: "keren",
  makasi: "terima kasih",
  makasih: "terima kasih",
  thx: "terima kasih",
  bgs: "bagus",
  jelekk: "jelek",
  sm: "sama",
  dgn: "dengan",
  utk: "untuk",
  sy: "saya",
  lg: "lagi",
  udh: "sudah",
  udah: "sudah",
  blm: "belum",
  blom: "belum",
  bapakk: "bapak",
  pak: "bapak",
  dinas: "dinas",
  dlhk: "dinas lingkungan hidup",
  pupr: "dinas pekerjaan umum",
};

// Indonesian Lexicon keywords
const POSITIVE_LEXICON = [
  "mantap", "bagus", "keren", "terima kasih", "matur suksma", "apresiasi",
  "hebat", "sigap", "cepat", "bersih", "indah", "puas", "rapi", "teratur",
  "juara", "inovatif", "ramah", "profesional", "terimakasih", "terbaik",
  "tertata", "tuntas", "nyaman", "patut dicontoh", "jempol", "salut"
];

const NEGATIVE_LEXICON = [
  "rusak", "hancur", "parah", "berlubang", "banjir", "becek", "bau", "busuk",
  "sampah", "tumpukan", "lambat", "lama", "lelet", "antre", "antrian", "judes",
  "kecewa", "rugi", "macet", "pungli", "bobrok", "mengecewakan", "lalai",
  "kotor", "semerawut", "terbengkalai", "gelap", "lampu mati", "kumuh", "sulit"
];

export function normalizeIndonesianText(text: string): string {
  let normalized = text.toLowerCase();
  for (const [slang, formal] of Object.entries(SLANG_MAP)) {
    const regex = new RegExp(`\\b${slang}\\b`, "g");
    normalized = normalized.replace(regex, formal);
  }
  return normalized.trim();
}

/**
 * Fetch the active institutional perspective profile
 */
export async function getActiveProfile(orgId?: string): Promise<PerspectiveProfile> {
  const filters: Record<string, string> = { is_active: "eq.true" };
  if (orgId) filters.id = `eq.${orgId}`;

  const profiles = await dbSelect<PerspectiveProfile>("org_profile", {
    filters,
    limit: 1,
  });

  if (!profiles || profiles.length === 0) {
    // Return default Pemkot Denpasar profile fallback
    return {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Pemerintah Kota Denpasar",
      org_type: "Pemerintah Kota",
      focus_areas: [
        { id: "kebersihan", name: "Kebersihan & Sampah", dinas: "DLHK Kota Denpasar" },
        { id: "infrastruktur", name: "Infrastruktur Jalan", dinas: "Dinas PUPR" },
        { id: "kesehatan", name: "Layanan RSUD Wangaya", dinas: "RSUD Wangaya" },
      ],
      related_entities: [
        { name: "I Gusti Ngurah Jaya Negara", role: "Walikota Denpasar" },
        { name: "DLHK Kota Denpasar", role: "Dinas Lingkungan Hidup" },
      ],
      context_rules: [
        { condition: "jalan rusak, banjir, lubang", classification: "negatif", weight: "high", scope: "Infrastruktur" },
        { condition: "sampah menumpuk, bau", classification: "negatif", weight: "high", scope: "Kebersihan" },
        { condition: "respon cepat, bersih, suksma", classification: "positif", weight: "high", scope: "Pelayanan" },
      ],
      profile_version: 1,
    };
  }

  return profiles[0];
}

/**
 * Tier 1: Indonesian Sentiment Classifier (Lexicon + Context Rules)
 */
export function analyzeSentimentTier1(
  text: string,
  profile: PerspectiveProfile
): { label: "positif" | "negatif" | "netral"; score: number; reasoning: string; needsEscalation: boolean } {
  const normalized = normalizeIndonesianText(text);

  // 1. Check Institutional Perspective Context Rules first
  if (profile.context_rules && Array.isArray(profile.context_rules)) {
    for (const rule of profile.context_rules) {
      const keywords = rule.condition.toLowerCase().split(/[,|]/).map((k) => k.trim()).filter(Boolean);
      for (const kw of keywords) {
        if (normalized.includes(kw)) {
          return {
            label: rule.classification,
            score: rule.weight === "high" ? 0.95 : 0.85,
            reasoning: `Sesuai Aturan Konteks Institusi [${rule.scope}]: keyword '${kw}' otomatis diklasifikasikan ${rule.classification} bagi institusi ${profile.name}.`,
            needsEscalation: false,
          };
        }
      }
    }
  }

  // 2. Lexicon Scoring
  let posHits = 0;
  let negHits = 0;

  for (const pos of POSITIVE_LEXICON) {
    if (normalized.includes(pos)) posHits++;
  }

  for (const neg of NEGATIVE_LEXICON) {
    if (normalized.includes(neg)) negHits++;
  }

  if (negHits > posHits) {
    const confidence = Math.min(0.60 + negHits * 0.12, 0.95);
    const needsEscalation = confidence < 0.70;
    return {
      label: "negatif",
      score: confidence,
      reasoning: `Terdeteksi kata bernuansa komplain publik (${negHits} indikator negatif).`,
      needsEscalation,
    };
  } else if (posHits > negHits) {
    const confidence = Math.min(0.60 + posHits * 0.12, 0.95);
    const needsEscalation = confidence < 0.70;
    return {
      label: "positif",
      score: confidence,
      reasoning: `Terdeteksi kata bernuansa apresiasi publik (${posHits} indikator positif).`,
      needsEscalation,
    };
  } else {
    // Tied or zero hits -> Ambiguous / Neutral
    return {
      label: "netral",
      score: 0.65,
      reasoning: "Teks berupa informasi faktual atau tidak memiliki indikator emosi yang dominan.",
      needsEscalation: true, // Ambiguous cases escalate to DeepSeek
    };
  }
}

/**
 * Tier 2: DeepSeek LLM Escalation with Institutional Perspective Injection
 */
export async function escalateToDeepSeek(
  text: string,
  profile: PerspectiveProfile
): Promise<SentimentAnalysisResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  // If DeepSeek API key is not configured, apply an intelligent heuristic rule evaluator with perspective context
  if (!apiKey) {
    return heuristicEscalation(text, profile);
  }

  try {
    const systemPrompt = `Anda adalah sistem klasifikasi sentimen media sosial profesional untuk ${profile.name} (${profile.org_type}).
PENTING: Sentimen dievaluasi BUKAN dari sudut pandang masyarakat umum yang netral, melainkan DARI SUDUT PANDANG INSTITUSI ${profile.name}.
Area fokus yang dipantau: ${profile.focus_areas.map((f) => f.name).join(", ")}.
Entitas terkait: ${profile.related_entities.map((e) => `${e.name} (${e.role})`).join(", ")}.

Panduan klasifikasi institusi:
- Kritik/keluhan layanan publik, jalan rusak, tumpukan sampah, banjir, antrian rumah sakit adalah sentimen NEGATIF bagi institusi.
- Apresiasi, pujian kinerja dinas, respon cepat penanganan keluhan adalah sentimen POSITIF.
- Informasi seremonial/jadwal netral, berita tanpa nada mengkritik/memuji adalah NETRAL.

Output WAJIB berupa format JSON murni:
{
  "label": "positif" | "negatif" | "netral",
  "score": 0.0 - 1.0,
  "reasoning": "penjelasan singkat sudut pandang institusi"
}`;

    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analisis teks berikut:\n"${text}"` },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return {
        label: parsed.label,
        score: Number(parsed.score) || 0.88,
        model_used: "deepseek-v3",
        profile_version_id: profile.profile_version,
        reasoning: parsed.reasoning || "Dianalisis oleh DeepSeek dengan perspektif Pemda.",
      };
    }
  } catch (error) {
    console.error("DeepSeek API call failed, falling back to heuristic:", error);
  }

  return heuristicEscalation(text, profile);
}

function heuristicEscalation(
  text: string,
  profile: PerspectiveProfile
): SentimentAnalysisResult {
  const norm = text.toLowerCase();

  // Check if it relates to any focus area and has complaint words
  const complaintWords = ["tolong", "gimana", "mana", "lama", "kapan", "payah", "rugi", "rusak", "sampah", "banjir"];
  const gratitudeWords = ["terima kasih", "suksma", "terimakasih", "mantap", "bagus", "jempol", "top", "lanjutkan"];

  const hasComplaint = complaintWords.some((w) => norm.includes(w));
  const hasGratitude = gratitudeWords.some((w) => norm.includes(w));

  if (hasComplaint && !hasGratitude) {
    return {
      label: "negatif",
      score: 0.88,
      model_used: "hybrid-rules",
      profile_version_id: profile.profile_version,
      reasoning: `Eskalasi Perspektif ${profile.name}: Teridentifikasi keluhan atau tuntutan perbaikan layanan publik.`,
    };
  } else if (hasGratitude) {
    return {
      label: "positif",
      score: 0.89,
      model_used: "hybrid-rules",
      profile_version_id: profile.profile_version,
      reasoning: `Eskalasi Perspektif ${profile.name}: Teridentifikasi apresiasi atas respon/layanan pemkot.`,
    };
  }

  return {
    label: "netral",
    score: 0.75,
    model_used: "hybrid-rules",
    profile_version_id: profile.profile_version,
    reasoning: `Eskalasi Perspektif ${profile.name}: Informasi faktual atau diskusi umum seputar kota.`,
  };
}

/**
 * Main Sentiment Pipeline Function
 */
export async function runSentimentPipeline(
  text: string,
  profile?: PerspectiveProfile
): Promise<SentimentAnalysisResult> {
  const activeProfile = profile || (await getActiveProfile());
  const tier1 = analyzeSentimentTier1(text, activeProfile);

  if (!tier1.needsEscalation) {
    return {
      label: tier1.label,
      score: tier1.score,
      model_used: "indobert-lexicon",
      profile_version_id: activeProfile.profile_version,
      reasoning: tier1.reasoning,
    };
  }

  // Escalate to Tier 2 (DeepSeek / Perspective Context)
  return escalateToDeepSeek(text, activeProfile);
}
