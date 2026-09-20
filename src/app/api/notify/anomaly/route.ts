import { NextResponse } from "next/server";
import { detectSentimentAnomaly } from "@/lib/services/anomaly";
import { dbSelect } from "@/lib/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id") || "11111111-1111-1111-1111-111111111111";

    const logs = await dbSelect("anomaly_logs", {
      filters: { org_id: `eq.${orgId}` },
      order: "check_date.desc",
      limit: 10,
    });

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch anomaly logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const orgId = body.org_id || "11111111-1111-1111-1111-111111111111";
    const date = body.date || new Date().toISOString().split("T")[0];

    const result = await detectSentimentAnomaly(orgId, date);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run anomaly check" },
      { status: 500 }
    );
  }
}
