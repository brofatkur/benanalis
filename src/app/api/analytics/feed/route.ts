import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id") || "11111111-1111-1111-1111-111111111111";
    const type = searchParams.get("type") || "all"; // 'all', 'post', 'comment'
    const platform = searchParams.get("platform");
    const sentiment = searchParams.get("sentiment");
    const search = searchParams.get("q")?.toLowerCase();
    const limit = parseInt(searchParams.get("limit") || "40", 10);

    // Prepare filters
    const postFilters: Record<string, string> = { org_id: `eq.${orgId}` };
    if (platform && platform !== "all") postFilters.platform = `eq.${platform}`;

    const commentFilters: Record<string, string> = { org_id: `eq.${orgId}` };
    if (platform && platform !== "all") commentFilters.platform = `eq.${platform}`;

    // Execute in parallel
    const [rawPosts, rawComments, scores] = await Promise.all([
      dbSelect("raw_posts", {
        filters: postFilters,
        order: "posted_at.desc",
        limit: 60,
      }),
      dbSelect("raw_comments", {
        filters: commentFilters,
        order: "posted_at.desc",
        limit: 100,
      }),
      dbSelect("sentiment_scores", {
        filters: { org_id: `eq.${orgId}` },
        limit: 500,
      }),
    ]);

    const scoreMap = new Map<string, any>();
    for (const s of scores) {
      scoreMap.set(s.target_id, s);
    }

    // Transform posts
    const mappedPosts = rawPosts.map((p) => {
      const s = scoreMap.get(p.id);
      return {
        id: p.id,
        itemType: "post" as const,
        platform: p.platform,
        author: p.author,
        content: p.content,
        url: p.url,
        thumbnailUrl: p.thumbnail_url || "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80",
        likesCount: p.likes_count,
        commentsCount: p.comments_count,
        postedAt: p.posted_at,
        sentiment: s?.label || "netral",
        sentimentScore: s?.score ? Number(s.score) : 0.75,
        modelUsed: s?.model_used || "indobert-lexicon",
        reasoning: s?.reasoning || "Dianalisis sistem.",
      };
    });

    // Transform comments
    const mappedComments = rawComments.map((c) => {
      const s = scoreMap.get(c.id);
      return {
        id: c.id,
        itemType: "comment" as const,
        parentPostId: c.parent_post_id,
        platform: c.platform,
        author: c.author,
        content: c.content,
        thumbnailUrl: c.thumbnail_url || "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80",
        likesCount: c.likes_count,
        postedAt: c.posted_at,
        sentiment: s?.label || "netral",
        sentimentScore: s?.score ? Number(s.score) : 0.75,
        modelUsed: s?.model_used || "indobert-lexicon",
        reasoning: s?.reasoning || "Dianalisis sistem.",
      };
    });

    let combined: any[] = [];
    if (type === "post") combined = mappedPosts;
    else if (type === "comment") combined = mappedComments;
    else combined = [...mappedPosts, ...mappedComments];

    // Filter by sentiment if requested
    if (sentiment && sentiment !== "all") {
      combined = combined.filter((item) => item.sentiment === sentiment);
    }

    // Filter by search query
    if (search) {
      combined = combined.filter(
        (item) =>
          item.content.toLowerCase().includes(search) ||
          item.author.toLowerCase().includes(search)
      );
    }

    // Sort newest first
    combined.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

    return NextResponse.json({
      success: true,
      data: combined.slice(0, limit),
      total: combined.length,
    });
  } catch (error: any) {
    console.error("Feed API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch feed" },
      { status: 500 }
    );
  }
}
