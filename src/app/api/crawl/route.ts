import { NextResponse } from "next/server";
import { runIngestionAndAnalysisPipeline } from "@/lib/services/etl";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orgId = body.org_id || "11111111-1111-1111-1111-111111111111";

    const result = await runIngestionAndAnalysisPipeline(orgId);

    return NextResponse.json({
      success: true,
      message: `Crawl dan ETL pipeline selesai. ${result.postsIngested} post baru dan ${result.commentsIngested} komentar dianalisis.`,
      data: result,
    });
  } catch (error: any) {
    console.error("Crawl API route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to trigger crawl" },
      { status: 500 }
    );
  }
}
