import { dbSelect, dbInsert } from "@/lib/db/client";

export interface TopicCluster {
  topic_id: number;
  label: string;
  keywords: string[];
}

export const PREDEFINED_PEMDA_TOPICS: TopicCluster[] = [
  {
    topic_id: 1,
    label: "Infrastruktur Jalan & Drainase PUPR",
    keywords: ["jalan", "rusak", "berlubang", "aspal", "banjir", "drainase", "got", "jembatan", "trotoar", "pupr"],
  },
  {
    topic_id: 2,
    label: "Pengelolaan Sampah & Kebersihan DLHK",
    keywords: ["sampah", "dlhk", "tps", "tpa", "suwung", "bau", "truk sampah", "bersih", "kebersihan", "plastik"],
  },
  {
    topic_id: 3,
    label: "Layanan Kesehatan & RSUD Wangaya",
    keywords: ["rsud", "wangaya", "antrean", "antri", "obat", "dokter", "perawat", "puskesmas", "bpjs", "rawat"],
  },
  {
    topic_id: 4,
    label: "Ketertiban Parkir & Lalu Lintas Dishub",
    keywords: ["parkir", "liar", "macet", "dishub", "tilang", "lampu merah", "lalin", "trotoar", "rambu", "satpol pp"],
  },
  {
    topic_id: 5,
    label: "Pariwisata, Event & Kebudayaan Denpasar",
    keywords: ["pariwisata", "sanur", "pantai", "ogoh-ogoh", "nyepi", "piodalan", "upacara", "festival", "denfest", "budaya"],
  },
  {
    topic_id: 6,
    label: "Pelayanan Publik & Aplikasi Pro Denpasar",
    keywords: ["pro denpasar", "aplikasi", "ktp", "dukcapil", "izin", "dpmptsp", "pengaduan", "pelayanan", "damakesmas", "surat"],
  },
];

/**
 * Assign content to best matching topic cluster using keyword semantic weighting
 */
export function assignTopicToContent(content: string): { topic_id: number; label: string; keywords: string[]; score: number } {
  const normalized = content.toLowerCase();
  let bestTopic = PREDEFINED_PEMDA_TOPICS[5]; // Default Pelayanan Umum
  let maxMatches = 0;

  for (const topic of PREDEFINED_PEMDA_TOPICS) {
    let matches = 0;
    for (const kw of topic.keywords) {
      if (normalized.includes(kw)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      bestTopic = topic;
    }
  }

  return {
    topic_id: bestTopic.topic_id,
    label: bestTopic.label,
    keywords: bestTopic.keywords,
    score: maxMatches > 0 ? Math.min(1.0, 0.5 + maxMatches * 0.15) : 0.4,
  };
}

/**
 * Run Topic Batch Job for an Organization
 */
export async function runTopicBatchJob(orgId: string, runDate = new Date().toISOString().split("T")[0]) {
  try {
    // Check if topics already exist for today
    const existingTopics = await dbSelect("topics", {
      filters: { org_id: `eq.${orgId}`, run_date: `eq.${runDate}` },
    });

    const topicMap = new Map<number, string>();

    if (!existingTopics || existingTopics.length === 0) {
      // Create topics for the run
      for (const t of PREDEFINED_PEMDA_TOPICS) {
        const [inserted] = await dbInsert("topics", {
          org_id: orgId,
          topic_id: t.topic_id,
          label: t.label,
          keywords: t.keywords,
          run_date: runDate,
        });
        if (inserted?.id) topicMap.set(t.topic_id, inserted.id);
      }
    } else {
      for (const t of existingTopics) {
        topicMap.set(t.topic_id, t.id);
      }
    }

    return {
      success: true,
      topicsCount: PREDEFINED_PEMDA_TOPICS.length,
      runDate,
    };
  } catch (error) {
    console.error("Topic batch job failed:", error);
    return { success: false, error: String(error) };
  }
}
