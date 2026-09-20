import { NextResponse } from "next/server";
import { dbSelect } from "@/lib/db/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id") || "11111111-1111-1111-1111-111111111111";

    const rollups = await dbSelect("daily_rollup", {
      filters: { org_id: `eq.${orgId}` },
      order: "rollup_date.desc",
      limit: 7,
    });

    const topics = await dbSelect("topics", {
      filters: { org_id: `eq.${orgId}` },
      limit: 6,
    });

    return NextResponse.json({
      success: true,
      reportMetadata: {
        organization: "Pemerintah Kota Denpasar",
        generatedAt: new Date().toISOString(),
        reportingPeriod: "7 Hari Terakhir (Mingguan)",
        systemVersion: "Media Analitik ASA Group v1.0",
      },
      rollups,
      topics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate report data" },
      { status: 500 }
    );
  }
}
