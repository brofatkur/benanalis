import { NextResponse } from "next/server";
import { runIncrementalCrawl } from "@/lib/services/crawler";

export const maxDuration = 300; // 5 minutes max duration for Next.js

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orgId = body.org_id || "11111111-1111-1111-1111-111111111111";

    const result = await runIncrementalCrawl(orgId);

    return NextResponse.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    console.error("Crawl API route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gagal menjalankan sinkronisasi data" },
      { status: 500 }
    );
  }
}
