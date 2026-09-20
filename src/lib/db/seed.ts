import { dbSelect, dbInsert } from "./client";
import { PREDEFINED_PEMDA_TOPICS } from "../services/bertopic";
import crypto from "crypto";

const DENPASAR_ORG_ID = "11111111-1111-1111-1111-111111111111";

interface SeedPost {
  platform: string;
  author: string;
  content: string;
  topicId: number;
  postSentiment: "positif" | "negatif" | "netral";
  postScore: number;
  postReason: string;
  comments: Array<{
    author: string;
    content: string;
    sentiment: "positif" | "negatif" | "netral";
    score: number;
    reason: string;
  }>;
}

const SEED_DATA_TEMPLATES: SeedPost[] = [
  {
    platform: "instagram",
    author: "infodenpasar",
    content: "Dinas PUPR Kota Denpasar mempercepat perbaikan aspal di Jl. Gatot Subroto Barat dan Jl. Cokroaminoto pasca musim hujan untuk meminimalisir risiko kecelakaan pengendara roda dua.",
    topicId: 1,
    postSentiment: "positif",
    postScore: 0.92,
    postReason: "Apresiasi kinerja dinas PUPR dalam pemeliharaan infrastruktur publik.",
    comments: [
      {
        author: "wayan_denpasar",
        content: "Bagus pak cepat ditambal, tapi jalan di Gatsu Timur juga banyak jeglongan sewu tolong dicek!",
        sentiment: "negatif",
        score: 0.86,
        reason: "Keluhan lanjutan mengenai jalan berlubang di lokasi lain.",
      },
      {
        author: "made_sanur",
        content: "Matur suksma infonya, semoga kualitas aspalnya tahan lama ga cepat amblas lagi.",
        sentiment: "positif",
        score: 0.88,
        reason: "Apresiasi warga disertai harapan positif.",
      },
      {
        author: "kadek_ubung",
        content: "Lampu penerangan jalannya sekalian dibetulin pak, kalau malam gelap rawan begal.",
        sentiment: "negatif",
        score: 0.84,
        reason: "Keluhan lampu penerangan jalan mati.",
      },
    ],
  },
  {
    platform: "tiktok",
    author: "balilife_citizen",
    content: "Kondisi TPS Monang-Maning Denpasar siang ini meluber sampai ke badan jalan dan baunya menyengat. Mohon armada DLHK segera menambah ritase pengangkutan sampah warga.",
    topicId: 2,
    postSentiment: "negatif",
    postScore: 0.94,
    postReason: "Keluhan tumpukan sampah meluber dan bau menyengat di fasilitas publik.",
    comments: [
      {
        author: "gusti_monangmaning",
        content: "Parah banget min, setiap lewat situ harus tahan nafas saking baunya.",
        sentiment: "negatif",
        score: 0.91,
        reason: "Keluhan warga sekitar atas bau busuk sampah.",
      },
      {
        author: "ketut_pedungan",
        content: "Katanya mau disulap jadi TPS3R ramah lingkungan, mana realisasinya?",
        sentiment: "negatif",
        score: 0.89,
        reason: "Kritik atas keterlambatan realisasi program TPS3R.",
      },
      {
        author: "dlhk_officer_denpasar",
        content: "Om Swastyastu, armada cadangan sudah bergerak ke lokasi untuk pembersihan total siang ini. Terima kasih laporannya.",
        sentiment: "positif",
        score: 0.90,
        reason: "Klarifikasi dan tindakan responsif dari petugas dinas.",
      },
    ],
  },
  {
    platform: "twitter",
    author: "dewi_wangaya",
    content: "Pengalaman berobat di RSUD Wangaya Denpasar hari ini: Pelayanan dokter dan perawat ramah, tapi sistem antrean farmasi obat masih memakan waktu hampir 2 jam lebih. Mohon dievaluasi.",
    topicId: 3,
    postSentiment: "negatif",
    postScore: 0.82,
    postReason: "Kritik antrean farmasi yang memakan waktu lama di RSUD daerah.",
    comments: [
      {
        author: "agus_renon",
        content: "Sama kak, minggu lalu nganter bapak juga nunggunya bikin lelah.",
        sentiment: "negatif",
        score: 0.85,
        reason: "Keluhan pengalaman serupa antrean obat.",
      },
      {
        author: "putu_kesehatan",
        content: "Tapi pendaftaran polinya sekarang udah enak lewat aplikasi mobile, lumayan menghemat waktu antri pagi.",
        sentiment: "positif",
        score: 0.87,
        reason: "Pujian terhadap fitur pendaftaran online.",
      },
    ],
  },
  {
    platform: "facebook",
    author: "denpasarkota.official",
    content: "Walikota Denpasar I Gusti Ngurah Jaya Negara meresmikan revitalisasi Pasar Kumbasari dan Bantaran Tukad Badung sebagai ikon ekonomi kreatif dan wisata pusaka Kota Denpasar.",
    topicId: 5,
    postSentiment: "positif",
    postScore: 0.95,
    postReason: "Pencapaian pembangunan fasilitas publik dan ekonomi kreatif.",
    comments: [
      {
        author: "komang_gajahmada",
        content: "Keren sekali penataannya, Tukad Badung jadi mirip Cheonggyecheon di Korea!",
        sentiment: "positif",
        score: 0.96,
        reason: "Pujian tinggi atas estetika penataan sungai kota.",
      },
      {
        author: "nyoman_pedagang",
        content: "Semoga tempat parkirnya dijaga tertib agar pembeli tetap nyaman belanja ke pasar.",
        sentiment: "netral",
        score: 0.75,
        reason: "Saran konstruktif terkait ketertiban parkir.",
      },
    ],
  },
  {
    platform: "instagram",
    author: "punapibali",
    content: "Penertiban parkir liar di Jl. Teuku Umar Denpasar oleh Dishub dan Tim Gabungan Polresta. Kendaraan yang melanggar langsung digembok dan ditempel stiker peringatan.",
    topicId: 4,
    postSentiment: "positif",
    postScore: 0.85,
    postReason: "Langkah tegas penegakan hukum ketertiban lalu lintas kota.",
    comments: [
      {
        author: "indra_bali",
        content: "Mantap tegas! Sering banget bikin macet kalau jam pulang kantor.",
        sentiment: "positif",
        score: 0.90,
        reason: "Dukungan penuh terhadap penertiban.",
      },
      {
        author: "yuda_driver",
        content: "Masalahnya lahan parkirnya ga ada pak, ruko-ruko ga nyediain parkir buat ojol.",
        sentiment: "negatif",
        score: 0.83,
        reason: "Keluhan ketiadaan fasilitas kantong parkir ojek online.",
      },
    ],
  },
  {
    platform: "twitter",
    author: "denpasar_update",
    content: "Layanan pengaduan Pro Denpasar mencatat 94% keluhan masyarakat berhasil ditindaklanjuti dalam waktu kurang dari 24 jam selama triwulan pertama tahun 2026.",
    topicId: 6,
    postSentiment: "positif",
    postScore: 0.93,
    postReason: "Laporan kinerja respon cepat aduan warga.",
    comments: [
      {
        author: "sinta_sesetan",
        content: "Beneran cepat kok, kemarin lapor pohon condong langsung dipangkas tim DLHK besok paginya.",
        sentiment: "positif",
        score: 0.95,
        reason: "Testimoni nyata kepuasan warga terhadap respon aduan.",
      },
    ],
  },
];

export async function runDatabaseSeed() {
  console.log("🚀 Memulai proses seeding data analitik Pemkot Denpasar ke Insforge...");

  // 1. Seed Topics for Pemkot Denpasar
  const topicMap = new Map<number, string>();
  const todayStr = new Date().toISOString().split("T")[0];

  for (const t of PREDEFINED_PEMDA_TOPICS) {
    const existing = await dbSelect("topics", {
      filters: { org_id: `eq.${DENPASAR_ORG_ID}`, topic_id: `eq.${t.topic_id}` },
      limit: 1,
    });

    if (existing && existing.length > 0) {
      topicMap.set(t.topic_id, existing[0].id);
    } else {
      const [inserted] = await dbInsert("topics", {
        org_id: DENPASAR_ORG_ID,
        topic_id: t.topic_id,
        label: t.label,
        keywords: t.keywords,
        run_date: todayStr,
      });
      if (inserted?.id) topicMap.set(t.topic_id, inserted.id);
    }
  }
  console.log(`✅ Topics terkonfigurasi (${topicMap.size} topik).`);

  // 2. Seed 30 Days of Daily Rollups
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const dateObj = new Date(now.getTime() - i * 86400000);
    const dateStr = dateObj.toISOString().split("T")[0];

    // Simulate occasional storm/flood day at day 3 (anomaly spike)
    const isAnomalyDay = i === 3;
    const postPos = isAnomalyDay ? 15 : Math.floor(Math.random() * 25) + 30;
    const postNeg = isAnomalyDay ? 65 : Math.floor(Math.random() * 15) + 12;
    const postNeu = Math.floor(Math.random() * 15) + 15;

    const commentPos = isAnomalyDay ? 30 : Math.floor(Math.random() * 60) + 70;
    const commentNeg = isAnomalyDay ? 180 : Math.floor(Math.random() * 45) + 35;
    const commentNeu = Math.floor(Math.random() * 30) + 25;

    const totalPosts = postPos + postNeg + postNeu;
    const totalComments = commentPos + commentNeg + commentNeu;
    const totalAll = totalPosts + totalComments;
    const netSentiment = Number(((((postPos + commentPos) - (postNeg + commentNeg)) / totalAll) * 100).toFixed(2));

    const existingRollup = await dbSelect("daily_rollup", {
      filters: { org_id: `eq.${DENPASAR_ORG_ID}`, rollup_date: `eq.${dateStr}` },
      limit: 1,
    });

    const rollupPayload = {
      org_id: DENPASAR_ORG_ID,
      rollup_date: dateStr,
      total_posts: totalPosts,
      total_comments: totalComments,
      post_pos_count: postPos,
      post_neg_count: postNeg,
      post_neu_count: postNeu,
      comment_pos_count: commentPos,
      comment_neg_count: commentNeg,
      comment_neu_count: commentNeu,
      net_sentiment_score: netSentiment,
      top_topics: [
        { name: "Infrastruktur Jalan PUPR", neg_pct: isAnomalyDay ? 78 : 55, vol: 120 },
        { name: "Pengelolaan Sampah DLHK", neg_pct: isAnomalyDay ? 62 : 44, vol: 95 },
        { name: "Layanan RSUD Wangaya", neg_pct: 32, vol: 70 },
        { name: "Pariwisata Denpasar", neg_pct: 10, vol: 150 },
      ],
    };

    if (existingRollup && existingRollup.length > 0) {
      // update
      continue;
    } else {
      await dbInsert("daily_rollup", rollupPayload);
    }
  }
  console.log("✅ 30 hari data daily_rollup berhasil diinisialisasi.");

  // 3. Seed Posts and Comments
  let seededPosts = 0;
  let seededComments = 0;

  for (let repeat = 0; repeat < 4; repeat++) {
    for (const tpl of SEED_DATA_TEMPLATES) {
      const postExtId = `seed_post_${repeat}_${crypto.randomBytes(4).toString("hex")}`;
      const postedAt = new Date(now.getTime() - (repeat * 86400000 + Math.random() * 43200000)).toISOString();

      const [post] = await dbInsert("raw_posts", {
        org_id: DENPASAR_ORG_ID,
        platform: tpl.platform,
        post_external_id: postExtId,
        author: tpl.author,
        content: tpl.content,
        url: `https://${tpl.platform}.com/${tpl.author}/p/${postExtId}`,
        thumbnail_url:
          tpl.platform === "instagram"
            ? "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80"
            : tpl.platform === "tiktok"
            ? "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=600&auto=format&fit=crop&q=80"
            : "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80",
        likes_count: Math.floor(Math.random() * 400) + 50,
        comments_count: tpl.comments.length,
        shares_count: Math.floor(Math.random() * 60) + 5,
        posted_at: postedAt,
        request_id: `req_seed_${repeat}`,
        cached: true,
        raw_json: { seeded: true },
      });

      if (!post?.id) continue;
      seededPosts++;

      // Post sentiment score
      await dbInsert("sentiment_scores", {
        org_id: DENPASAR_ORG_ID,
        target_type: "post",
        target_id: post.id,
        label: tpl.postSentiment,
        score: tpl.postScore,
        model_used: "indobert-lexicon",
        profile_version_id: 1,
        reasoning: tpl.postReason,
      });

      // Post topic assignment
      const topicUuid = topicMap.get(tpl.topicId);
      if (topicUuid) {
        await dbInsert("topic_assignments", {
          target_type: "post",
          target_id: post.id,
          topic_id: topicUuid,
          probability: 0.95,
        });
      }

      // Comments
      for (let cIdx = 0; cIdx < tpl.comments.length; cIdx++) {
        const c = tpl.comments[cIdx];
        const commentExtId = `seed_comm_${postExtId}_${cIdx}`;
        const commentTime = new Date(new Date(postedAt).getTime() + (cIdx + 1) * 3600000).toISOString();

        const [comment] = await dbInsert("raw_comments", {
          org_id: DENPASAR_ORG_ID,
          parent_post_id: post.id,
          platform: tpl.platform,
          comment_external_id: commentExtId,
          author: c.author,
          content: c.content,
          thumbnail_url:
            tpl.platform === "instagram"
              ? "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
          likes_count: Math.floor(Math.random() * 30),
          posted_at: commentTime,
          request_id: `req_seed_${repeat}`,
          raw_json: { seeded: true },
        });

        if (!comment?.id) continue;
        seededComments++;

        // Comment sentiment score
        await dbInsert("sentiment_scores", {
          org_id: DENPASAR_ORG_ID,
          target_type: "comment",
          target_id: comment.id,
          label: c.sentiment,
          score: c.score,
          model_used: c.score > 0.9 ? "deepseek-v3" : "indobert-lexicon",
          profile_version_id: 1,
          reasoning: c.reason,
        });

        // Comment topic assignment
        if (topicUuid) {
          await dbInsert("topic_assignments", {
            target_type: "comment",
            target_id: comment.id,
            topic_id: topicUuid,
            probability: 0.92,
          });
        }
      }
    }
  }

  console.log(`✅ Posts (${seededPosts}) & Komentar (${seededComments}) berhasil diisi.`);
  console.log("🎉 Seeding database Insforge selesai dengan sukses!");
}

// Execute when invoked directly
runDatabaseSeed()
  .then(() => {
    console.log("Seeding process completed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding error:", err);
    process.exit(1);
  });
