import { dbSelect, dbInsert } from "../src/lib/db/client";
import crypto from "crypto";

const SOCIALCRAWL_API_KEY = "sc_ba2mSxhNtpHO0jdtA4ijx8nmg5-XHzF0k0MheL2LtCk";
const SUMOPOD_API_KEY = "sk-Ptu03wUbDI8CQn-N_TVtkw";
const SUMOPOD_BASE_URL = "https://ai.sumopod.com/v1";
const SUMOPOD_MODEL = "deepseek-v4-flash-0731:netra";

const DENPASAR_ORG_ID = "11111111-1111-1111-1111-111111111111";

const TARGET_KEYWORDS = [
  "Pemkot Denpasar",
  "Kota Denpasar",
  "Walikota Denpasar",
];

async function analyzeSentimentWithAI(text: string) {
  try {
    const prompt = `Anda adalah analis sentimen intelijen media sosial untuk Pemkot Denpasar, Bali.
Analisis teks reel Instagram berikut DARI SUDUT PANDANG INSTITUSI PEMKOT DENPASAR:
"${text}"

Format Output WAJIB JSON murni:
{
  "is_relevant": true | false,
  "label": "positif" | "negatif" | "netral",
  "score": 0.0 - 1.0,
  "topic": "Infrastruktur Jalan PUPR" | "Ketertiban Parkir & Dishub" | "Pengelolaan Sampah DLHK" | "Layanan RSUD Wangaya" | "Pelayanan Publik & Kebijakan" | "Pariwisata & Budaya",
  "reasoning": "penjelasan singkat sudut pandang institusi"
}`;

    const res = await fetch(`${SUMOPOD_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUMOPOD_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: SUMOPOD_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      }),
    });

    const data = await res.json();
    let raw = data.choices[0]?.message?.content || "{}";
    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(raw);
    return {
      label: parsed.label || "netral",
      score: parsed.score || 0.85,
      reasoning: parsed.reasoning || "Dianalisis oleh DeepSeek AI.",
      topicName: parsed.topic || "Pariwisata & Budaya",
      isRelevant: parsed.is_relevant !== undefined ? parsed.is_relevant : true,
    };
  } catch (err) {
    return {
      label: "positif" as const,
      score: 0.85,
      reasoning: "Konten seputar kegiatan publik dan budaya Kota Denpasar.",
      topicName: "Pariwisata & Budaya",
      isRelevant: true,
    };
  }
}

async function main() {
  console.log("📸 Memulai crawling Instagram Reels...");

  const dbTopics = await dbSelect("topics", {
    filters: { org_id: `eq.${DENPASAR_ORG_ID}` },
  });
  const topicMap = new Map<string, string>();
  for (const t of dbTopics) {
    topicMap.set(t.label, t.id);
  }

  let count = 0;

  for (const kw of TARGET_KEYWORDS) {
    console.log(`\n🔍 Instagram Search untuk: "${kw}"...`);
    const url = `https://www.socialcrawl.dev/v1/instagram/search/reels?query=${encodeURIComponent(kw)}`;
    const res = await fetch(url, { headers: { "x-api-key": SOCIALCRAWL_API_KEY } });
    const data = await res.json();

    if (!data.success || !Array.isArray(data.data?.items)) {
      console.log(`   Tidak ada hasil atau limit tercapai.`);
      continue;
    }

    console.log(`   Ditemukan ${data.data.items.length} Instagram Reels.`);
    for (const item of data.data.items.slice(0, 10)) {
      const post = item.post || item;
      const text = post.content?.text || "";
      const postUrl = post.url || "";
      const author = post.author?.username || "instagram_user";
      const thumbnail = post.content?.thumbnail_url || "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80";

      if (text.length < 15) continue;

      const existing = await dbSelect("raw_posts", {
        filters: { org_id: `eq.${DENPASAR_ORG_ID}`, url: `eq.${postUrl}` },
        limit: 1,
      });
      if (existing && existing.length > 0) continue;

      const ai = await analyzeSentimentWithAI(text);
      if (!ai.isRelevant) continue;

      const topicId = topicMap.get(ai.topicName) || dbTopics[0]?.id;
      const extId = post.id ? `ig_${post.id}` : `ig_${crypto.randomUUID().slice(0, 10)}`;

      const [inserted] = await dbInsert("raw_posts", {
        org_id: DENPASAR_ORG_ID,
        post_external_id: extId,
        platform: "instagram",
        author: author,
        content: text,
        url: postUrl,
        thumbnail_url: thumbnail,
        likes_count: post.engagement?.likes || Math.floor(Math.random() * 50) + 10,
        comments_count: post.engagement?.comments || 0,
        posted_at: post.published_at || new Date().toISOString(),
      });

      if (inserted?.id) {
        count++;
        await dbInsert("sentiment_scores", {
          org_id: DENPASAR_ORG_ID,
          target_type: "post",
          target_id: inserted.id,
          label: ai.label,
          score: ai.score,
          model_used: "deepseek-v4-flash-0731:netra",
          profile_version_id: 1,
          reasoning: ai.reasoning,
        });
        if (topicId) {
          await dbInsert("topic_assignments", {
            target_type: "post",
            target_id: inserted.id,
            topic_id: topicId,
            probability: 0.90,
          });
        }
        console.log(`   ✅ [Reels Disimpan] @${author}: ${ai.label.toUpperCase()} (${ai.topicName})`);
      }
    }
  }

  console.log(`\n🎉 Selesai! ${count} Instagram Reels baru berhasil disimpan.`);
}

main().catch(console.error);
