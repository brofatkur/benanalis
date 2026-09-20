import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jobs = await dbSelect("crawl_jobs", {
      order: "executed_at.desc",
      limit: 1,
    });

    const lastJob = jobs?.[0] || null;
    const now = new Date();
    let lastRun = lastJob ? new Date(lastJob.executed_at) : null;
    
    // Estimate next run (every 3 hours)
    let nextRun = null;
    if (lastRun) {
      nextRun = new Date(lastRun.getTime() + 3 * 60 * 60 * 1000);
    }

    return NextResponse.json({
      success: true,
      data: {
        schedule: "Setiap 3 Jam (0 */3 * * *)",
        lastJob: lastJob ? {
          id: lastJob.id,
          executedAt: lastJob.executed_at,
          postsIngested: lastJob.posts_ingested,
          commentsIngested: lastJob.comments_ingested,
          status: lastJob.status,
        } : null,
        nextRun: nextRun?.toISOString() || null,
        currentTime: now.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Crawl status API error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
