import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id") || "11111111-1111-1111-1111-111111111111";

    const topics = await dbSelect("topics", {
      filters: { org_id: `eq.${orgId}` },
      limit: 50,
    });

    const topicAssignments = await dbSelect("topic_assignments", {
      limit: 2000,
    });

    const sentimentScores = await dbSelect("sentiment_scores", {
      filters: { org_id: `eq.${orgId}` },
      limit: 2000,
    });

    const scoreMap = new Map<string, string>();
    for (const s of sentimentScores) {
      scoreMap.set(s.target_id, s.label);
    }

    const topicStats = topics.map((topic) => {
      const assigned = topicAssignments.filter((a) => a.topic_id === topic.id);
      let pos = 0, neg = 0, neu = 0;

      for (const a of assigned) {
        const label = scoreMap.get(a.target_id);
        if (label === "positif") pos++;
        else if (label === "negatif") neg++;
        else if (label === "netral") neu++;
      }

      const total = pos + neg + neu;
      const negPercentage = total > 0 ? Number(((neg / total) * 100).toFixed(1)) : 0;
      const posPercentage = total > 0 ? Number(((pos / total) * 100).toFixed(1)) : 0;
      const neuPercentage = total > 0 ? Number(((neu / total) * 100).toFixed(1)) : 0;

      return {
        id: topic.id,
        topic_id: topic.topic_id,
        label: topic.label,
        keywords: topic.keywords,
        totalVolume: total,
        positif: pos,
        negatif: neg,
        netral: neu,
        negPercentage,
        posPercentage,
        neuPercentage,
        velocity: "+14%",
      };
    });

    // Sort by volume descending
    topicStats.sort((a, b) => b.totalVolume - a.totalVolume);

    return NextResponse.json({
      success: true,
      data: topicStats,
    });
  } catch (error: any) {
    console.error("Topics API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch topics" },
      { status: 500 }
    );
  }
}
