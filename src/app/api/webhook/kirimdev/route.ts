import { NextResponse } from "next/server";
import { handleWhatsAppBotQuery, sendWhatsAppMessage } from "@/lib/services/kirimdev";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Kirimdev webhook payload format
    const sender = body.sender || body.from || body.phone;
    const message = body.message || body.text || body.body || "";
    const orgId = body.org_id || "11111111-1111-1111-1111-111111111111";

    if (!sender) {
      return NextResponse.json({ success: false, error: "Sender is required" }, { status: 400 });
    }

    const reply = await handleWhatsAppBotQuery(sender, message, orgId);

    // Send reply via Kirimdev WhatsApp gateway if live, or return in JSON
    await sendWhatsAppMessage(sender, reply);

    return NextResponse.json({
      success: true,
      sender,
      reply,
    });
  } catch (error: any) {
    console.error("Kirimdev webhook error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Webhook processing failed" },
      { status: 500 }
    );
  }
}
