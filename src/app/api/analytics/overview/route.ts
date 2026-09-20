import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id") || "11111111-1111-1111-1111-111111111111";
    const days = parseInt(searchParams.get("days") || "30", 10);

    // 1. Fetch daily_rollup for requested period
    const rollups = await dbSelect("daily_rollup", {
      filters: { org_id: `eq.${orgId}` },
      order: "rollup_date.asc",
      limit: days,
    });

    // 2. Fetch raw_posts for platform distribution
    const posts = await dbSelect("raw_posts", {
      filters: { org_id: `eq.${orgId}` },
      limit: 1000,
    });

    // 3. Fetch sentiment_scores summary
    const scores = await dbSelect("sentiment_scores", {
      filters: { org_id: `eq.${orgId}` },
      limit: 2000,
    });

    // Calculate totals & aggregates
    let totalPosts = 0;
    let totalComments = 0;
    let totalPos = 0;
    let totalNeg = 0;
    let totalNeu = 0;

    let postPos = 0, postNeg = 0, postNeu = 0;
    let commentPos = 0, commentNeg = 0, commentNeu = 0;

    for (const s of scores) {
      if (s.target_type === "post") {
        totalPosts++;
        if (s.label === "positif") { totalPos++; postPos++; }
        else if (s.label === "negatif") { totalNeg++; postNeg++; }
        else { totalNeu++; postNeu++; }
      } else {
        totalComments++;
        if (s.label === "positif") { totalPos++; commentPos++; }
        else if (s.label === "negatif") { totalNeg++; commentNeg++; }
        else { totalNeu++; commentNeu++; }
      }
    }

    const totalInteractions = totalPosts + totalComments;
    const netSentiment =
      totalInteractions > 0
        ? Number((((totalPos - totalNeg) / totalInteractions) * 100).toFixed(1))
        : 0;

    // Platform breakdown
    const platformCounts: Record<string, number> = {
      instagram: 0,
      tiktok: 0,
      twitter: 0,
      facebook: 0,
    };
    for (const p of posts) {
      if (platformCounts[p.platform] !== undefined) {
        platformCounts[p.platform]++;
      }
    }

    // Anomaly status from anomaly_logs
    const anomalyLogs = await dbSelect("anomaly_logs", {
      filters: { org_id: `eq.${orgId}` },
      order: "check_date.desc",
      limit: 1,
    });

    const latestAnomaly = anomalyLogs && anomalyLogs.length > 0 ? anomalyLogs[0] : null;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalInteractions,
          totalPosts,
          totalComments,
          netSentiment,
          totalPos,
          totalNeg,
          totalNeu,
          posPercentage: totalInteractions > 0 ? Number(((totalPos / totalInteractions) * 100).toFixed(1)) : 0,
          negPercentage: totalInteractions > 0 ? Number(((totalNeg / totalInteractions) * 100).toFixed(1)) : 0,
          neuPercentage: totalInteractions > 0 ? Number(((totalNeu / totalInteractions) * 100).toFixed(1)) : 0,
          postsBreakdown: { pos: postPos, neg: postNeg, neu: postNeu },
          commentsBreakdown: { pos: commentPos, neg: commentNeg, neu: commentNeu },
        },
        trend: rollups.map((r) => {
          const tTotal = (r.total_posts || 0) + (r.total_comments || 0);
          const tPos = (r.post_pos_count || 0) + (r.comment_pos_count || 0);
          const tNeg = (r.post_neg_count || 0) + (r.comment_neg_count || 0);
          const tNeu = (r.post_neu_count || 0) + (r.comment_neu_count || 0);
          return {
            date: r.rollup_date,
            total: tTotal,
            positif: tPos,
            negatif: tNeg,
            netral: tNeu,
            netScore: Number(r.net_sentiment_score) || 0,
            postNeg: r.post_neg_count || 0,
            commentNeg: r.comment_neg_count || 0,
          };
        }),
        platforms: platformCounts,
        anomaly: latestAnomaly,
      },
    });
  } catch (error: any) {
    console.error("Overview API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch overview" },
      { status: 500 }
    );
  }
}
