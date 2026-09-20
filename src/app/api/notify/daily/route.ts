import { NextResponse } from "next/server";
import { formatDailyWhatsAppReport, sendWhatsAppAlert } from "@/lib/services/kirimdev";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const reportText = formatDailyWhatsAppReport();

    return NextResponse.json({
      success: true,
      message: reportText,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate daily report" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const reportText = formatDailyWhatsAppReport(body.customData);

    let sent = false;
    if (body.sendDirect === true) {
      sent = await sendWhatsAppAlert(reportText);
    }

    return NextResponse.json({
      success: true,
      sent,
      message: reportText,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to broadcast daily report" },
      { status: 500 }
    );
  }
}
