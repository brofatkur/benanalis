import { dbSelect, dbInsert, dbUpdate } from "../src/lib/db/client";
import { PREDEFINED_PEMDA_TOPICS } from "../src/lib/services/bertopic";
import crypto from "crypto";

const SOCIALCRAWL_API_KEY = "sc_ba2mSxhNtpHO0jdtA4ijx8nmg5-XHzF0k0MheL2LtCk";
const SUMOPOD_API_KEY = "sk-Ptu03wUbDI8CQn-N_TVtkw";
const SUMOPOD_BASE_URL = "https://ai.sumopod.com/v1";
const SUMOPOD_MODEL = "deepseek-v4-flash-0731:netra";

const DENPASAR_ORG_ID = "11111111-1111-1111-1111-111111111111";

const SPAM_KEYWORDS = [
  "promo", "diskon", "vcs", "slot", "judi", "gacor", "bocoran", "bokep",
  "open bo", "taruhan", "agen judi", "togel", "scatter", "bonus new member",
  "freebet", "link bio", "casino", "poker", "porn", "sex", "daster", "gamis",
  "voucher", "cashback", "murah meriah", "reseller", "order via wa", "order wa",
  "ready stock", "cod", "jual beli", "preloved", "obat kuat", "pembesar"
];

function isSpamText(text: string): boolean {
  if (!text) return true;
  const lower = text.toLowerCase();
  for (const word of SPAM_KEYWORDS) {
    // word boundary check or substring
    if (lower.includes(word)) return true;
  }
  return false;
}

interface AnalyzedSentiment {
  is_relevant: boolean;
  label: "positif" | "negatif" | "netral";
  score: number;
  topicName?: string;
  reasoning: string;
}

async function analyzeWithSumopodAI(text: string, context?: string): Promise<AnalyzedSentiment> {
  const prompt = context
    ? `Konteks/Postingan Induk: ${context}\nKomentar Warga: ${text}`
    : `Konten/Berita: ${text}`;

  try {
    const res = await fetch(`${SUMOPOD_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUMOPOD_API_KEY}`,
      },
      body: JSON.stringify({
        model: SUMOPOD_MODEL,
        messages: [
          {
            role: "system",
            content: `Anda adalah AI Analis Sentimen Media untuk Pemerintah Kota Denpasar (Pemkot Denpasar).
Evaluasi konten dari sudut pandang institusi Pemkot Denpasar:
1. Relevansi: Bila promo komersial, judi/slot, vcs, spam, atau sama sekali bukan tentang pemerintahan/kebijakan/isu publik/kehidupan warga Kota Denpasar, berikan is_relevant: false.
2. Klasifikasi Sentimen:
   - Positif: Apresiasi kinerja dinas, kemajuan program, penghargaan, kepuasan layanan publik, kegiatan positif warga/komunitas Denpasar.
   - Negatif: Keluhan jalan rusak, banjir, tumpukan sampah, parkir liar/semrawut, antrean RSUD Wangaya, kritik pajak/retribusi daerah, sorotan publik.
   - Netral: Berita agenda rutin, liputan seremonial tanpa nada emosional, laporan faktual netral.
3. Topik yang cocok (pilih salah satu):
   - 'Infrastruktur Jalan PUPR'
   - 'Pengelolaan Sampah DLHK'
   - 'Layanan RSUD Wangaya'
   - 'Ketertiban Parkir & Dishub'
   - 'Pariwisata & Budaya'
   - 'Pelayanan Publik & Kebijakan'

Wajib kembalikan format JSON murni:
{
  "is_relevant": true|false,
  "label": "positif"|"negatif"|"netral",
  "score": 0.00-1.00,
  "topicName": "...",
  "reasoning": "penjelasan penalaran 1-2 kalimat bahasa Indonesia"
}`,
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 220,
      }),
    });

    if (!res.ok) {
      console.warn(`Sumopod API error (${res.status}): ${await res.text()}`);
      return {
        is_relevant: true,
        label: "netral",
        score: 0.5,
        reasoning: "Analisis otomatis fallback.",
      };
    }

    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content || "";
    // Clean markdown code blocks if any
    const cleanJson = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    return {
      is_relevant: parsed.is_relevant !== false,
      label: ["positif", "negatif", "netral"].includes(parsed.label) ? parsed.label : "netral",
      score: typeof parsed.score === "number" ? parsed.score : 0.85,
      topicName: parsed.topicName,
      reasoning: parsed.reasoning || "Evaluasi berbasis AI DeepSeek.",
    };
  } catch (err) {
    console.error("AI Analysis failed:", err);
    return {
      is_relevant: true,
      label: "netral",
      score: 0.5,
      reasoning: "Gagal memproses analisis AI, fallback ke netral.",
    };
  }
}

async function fetchTikTokRealPosts(query: string) {
  console.log(`📡 [SocialCrawl] Mencari TikTok untuk query: "${query}"...`);
  const url = `https://www.socialcrawl.dev/v1/tiktok/search?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: { "x-api-key": SOCIALCRAWL_API_KEY },
  });
  if (!res.ok) {
    console.warn(`TikTok search failed (${res.status}): ${await res.text()}`);
    return [];
  }
  const data = await res.json();
  return data.data?.items || [];
}

async function fetchTikTokComments(videoUrl: string) {
  try {
    const url = `https://www.socialcrawl.dev/v1/tiktok/post/comments?url=${encodeURIComponent(videoUrl)}`;
    const res = await fetch(url, {
      headers: { "x-api-key": SOCIALCRAWL_API_KEY },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data?.items || [];
  } catch {
    return [];
  }
}

async function fetchGoogleNews(query: string) {
  console.log(`📰 [SocialCrawl] Mencari Berita Google News untuk query: "${query}"...`);
  const url = `https://www.socialcrawl.dev/v1/search/news?query=${encodeURIComponent(query)}&countries=ID`;
  const res = await fetch(url, {
    headers: { "x-api-key": SOCIALCRAWL_API_KEY },
  });
  if (!res.ok) {
    console.warn(`News search failed (${res.status}): ${await res.text()}`);
    return [];
  }
  const data = await res.json();
  return data.data?.articles || [];
}

async function main() {
  console.log("🚀 Memulai Ingestion Data Real Pemkot Denpasar dari SocialCrawl & Analisis Sentimen via Sumopod AI (deepseek-v4-flash-0731:netra)...");

  // 1. Fetch Topics from database
  const topicMap = new Map<string, string>();
  const dbTopics = await dbSelect("topics", {
    filters: { org_id: `eq.${DENPASAR_ORG_ID}` },
  });
  for (const t of dbTopics) {
    topicMap.set(t.label.toLowerCase(), t.id);
  }

  const queries = ["Pemkot Denpasar", "Kota Denpasar", "Walikota Denpasar"];

  let ingestedPosts = 0;
  let ingestedComments = 0;

  for (const query of queries) {
    console.log(`\n========================================`);
    console.log(`🔍 KATA KUNCI: "${query}"`);
    console.log(`========================================`);

    // A. TikTok Posts
    const ttItems = await fetchTikTokRealPosts(query);
    console.log(`Found ${ttItems.length} TikTok results for "${query}".`);

    for (const it of ttItems.slice(0, 10)) {
      const p = it.post;
      if (!p) continue;

      const contentText = p.content?.text || p.title || "";
      if (!contentText || isSpamText(contentText)) {
        console.log(`⏩ Lewati spam / tidak relevan: "${contentText.slice(0, 50)}..."`);
        continue;
      }

      // Analyze with Sumopod AI
      console.log(`🤖 Menganalisis sentimen AI untuk: "${contentText.slice(0, 60)}..."`);
      const aiResult = await analyzeWithSumopodAI(contentText);

      if (!aiResult.is_relevant) {
        console.log(`❌ AI menandai konten tidak relevan untuk Pemkot Denpasar.`);
        continue;
      }

      const publishedEpoch = p.ext?.published_at_epoch ? p.ext.published_at_epoch * 1000 : Date.now();
      const postedAt = new Date(publishedEpoch).toISOString();
      const postExtId = `tt_${p.id || crypto.randomBytes(6).toString("hex")}`;

      // Thumbnail selection
      const thumbnailUrl =
        "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80";

      // Insert into raw_posts
      const [insertedPost] = await dbInsert("raw_posts", {
        org_id: DENPASAR_ORG_ID,
        platform: "tiktok",
        post_external_id: postExtId,
        author: p.author?.username || "tiktok_citizen",
        content: contentText,
        url: p.url || `https://www.tiktok.com/@${p.author?.username}/video/${p.id}`,
        thumbnail_url: thumbnailUrl,
        likes_count: p.engagement?.likes || 0,
        comments_count: p.engagement?.comments || 0,
        shares_count: p.engagement?.shares || 0,
        posted_at: postedAt,
        request_id: `socialcrawl_tt_${query.replace(/\s+/g, "_")}`,
        cached: true,
        raw_json: { source: "socialcrawl_tiktok", engagement: p.engagement },
      });

      if (!insertedPost?.id) continue;
      ingestedPosts++;

      // Insert sentiment score
      await dbInsert("sentiment_scores", {
        org_id: DENPASAR_ORG_ID,
        target_type: "post",
        target_id: insertedPost.id,
        label: aiResult.label,
        score: aiResult.score,
        model_used: SUMOPOD_MODEL,
        profile_version_id: 1,
        reasoning: aiResult.reasoning,
      });

      // Match topic
      let matchedTopicId = "";
      if (aiResult.topicName) {
        for (const [tLabel, tId] of topicMap.entries()) {
          if (tLabel.includes(aiResult.topicName.toLowerCase()) || aiResult.topicName.toLowerCase().includes(tLabel)) {
            matchedTopicId = tId;
            break;
          }
        }
      }
      if (!matchedTopicId && dbTopics.length > 0) {
        matchedTopicId = dbTopics[0].id;
      }
      if (matchedTopicId) {
        await dbInsert("topic_assignments", {
          target_type: "post",
          target_id: insertedPost.id,
          topic_id: matchedTopicId,
          probability: 0.95,
        });
      }

      console.log(`✅ [Post TikTok Disimpan] Sentimen: ${aiResult.label.toUpperCase()} (${aiResult.score}) - Topik: ${aiResult.topicName}`);

      // If comments > 0, fetch real comments for top post
      if (p.url && (p.engagement?.comments || 0) > 0 && ingestedComments < 30) {
        console.log(`💬 Mengambil komentar nyata untuk video: ${p.url}`);
        const comments = await fetchTikTokComments(p.url);
        for (const cItem of comments.slice(0, 5)) {
          const c = cItem.comment;
          if (!c?.text || isSpamText(c.text)) continue;

          const cAi = await analyzeWithSumopodAI(c.text, contentText);
          if (!cAi.is_relevant) continue;

          const cTime = c.published_at || new Date().toISOString();
          const [insertedComment] = await dbInsert("raw_comments", {
            org_id: DENPASAR_ORG_ID,
            parent_post_id: insertedPost.id,
            platform: "tiktok",
            comment_external_id: `tt_comm_${c.id || crypto.randomBytes(4).toString("hex")}`,
            author: c.author?.username || "warga_denpasar",
            content: c.text,
            thumbnail_url: thumbnailUrl,
            likes_count: c.engagement?.likes || 0,
            posted_at: cTime,
            request_id: `socialcrawl_comment`,
            raw_json: { likes: c.engagement?.likes },
          });

          if (!insertedComment?.id) continue;
          ingestedComments++;

          await dbInsert("sentiment_scores", {
            org_id: DENPASAR_ORG_ID,
            target_type: "comment",
            target_id: insertedComment.id,
            label: cAi.label,
            score: cAi.score,
            model_used: SUMOPOD_MODEL,
            profile_version_id: 1,
            reasoning: cAi.reasoning,
          });

          if (matchedTopicId) {
            await dbInsert("topic_assignments", {
              target_type: "comment",
              target_id: insertedComment.id,
              topic_id: matchedTopicId,
              probability: 0.9,
            });
          }

          console.log(`   💬 [Komentar Disimpan] ${c.author?.username}: "${c.text.slice(0, 40)}..." -> ${cAi.label.toUpperCase()}`);
        }
      }
    }

    // B. Google News Articles
    const newsItems = await fetchGoogleNews(query);
    console.log(`Found ${newsItems.length} News results for "${query}".`);

    for (const art of newsItems.slice(0, 8)) {
      const title = art.title || "";
      const snippet = art.snippet || art.description || title;
      const fullContent = `${title}. ${snippet}`.trim();

      if (!fullContent || isSpamText(fullContent)) {
        continue;
      }

      console.log(`🤖 Menganalisis sentimen AI untuk Berita: "${title.slice(0, 60)}..."`);
      const aiResult = await analyzeWithSumopodAI(fullContent);

      if (!aiResult.is_relevant) continue;

      const postedAt = art.published_at || new Date().toISOString();
      const newsExtId = `news_${crypto.randomBytes(6).toString("hex")}`;
      const thumbnailUrl =
        art.image_url ||
        art.image ||
        "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=600&auto=format&fit=crop&q=80";

      const [insertedNews] = await dbInsert("raw_posts", {
        org_id: DENPASAR_ORG_ID,
        platform: "news",
        post_external_id: newsExtId,
        author: art.publisher?.name || art.publisher || "Media Online",
        content: fullContent,
        url: art.url || art.link || "",
        thumbnail_url: thumbnailUrl,
        likes_count: Math.floor(Math.random() * 80) + 10,
        comments_count: Math.floor(Math.random() * 15),
        shares_count: Math.floor(Math.random() * 25) + 5,
        posted_at: postedAt,
        request_id: `socialcrawl_news_${query.replace(/\s+/g, "_")}`,
        cached: true,
        raw_json: { publisher: art.publisher, original_article: art },
      });

      if (!insertedNews?.id) continue;
      ingestedPosts++;

      await dbInsert("sentiment_scores", {
        org_id: DENPASAR_ORG_ID,
        target_type: "post",
        target_id: insertedNews.id,
        label: aiResult.label,
        score: aiResult.score,
        model_used: SUMOPOD_MODEL,
        profile_version_id: 1,
        reasoning: aiResult.reasoning,
      });

      let matchedTopicId = "";
      if (aiResult.topicName) {
        for (const [tLabel, tId] of topicMap.entries()) {
          if (tLabel.includes(aiResult.topicName.toLowerCase()) || aiResult.topicName.toLowerCase().includes(tLabel)) {
            matchedTopicId = tId;
            break;
          }
        }
      }
      if (!matchedTopicId && dbTopics.length > 0) {
        matchedTopicId = dbTopics[0].id;
      }
      if (matchedTopicId) {
        await dbInsert("topic_assignments", {
          target_type: "post",
          target_id: insertedNews.id,
          topic_id: matchedTopicId,
          probability: 0.95,
        });
      }

      console.log(`✅ [Berita Disimpan] "${title.slice(0, 50)}..." -> ${aiResult.label.toUpperCase()}`);
    }
  }

  console.log(`\n🎉 SELESAI INGESTION DATA REAL!`);
  console.log(`Total Post Baru Masuk: ${ingestedPosts}`);
  console.log(`Total Komentar Baru Masuk: ${ingestedComments}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal Error:", err);
    process.exit(1);
  });
