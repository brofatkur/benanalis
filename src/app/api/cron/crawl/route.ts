import { NextResponse } from "next/server";
import { runIncrementalCrawl } from "@/lib/services/crawler";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const CRON_SECRET = process.env.CRON_SECRET || "benanalis-cron-secret-2026";

function isAuthorized(request: Request): boolean {
  const url = new URL(request.url);
  const tokenFromQuery = url.searchParams.get("token");
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.replace(/^Bearer\s+/i, "");

  // If running from localhost/internal or secret matches
  if (tokenFromQuery === CRON_SECRET || bearerToken === CRON_SECRET) {
    return true;
  }

  // Also allow internal host header
  const host = request.headers.get("host") || "";
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return true;
  }

  return false;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
  }

  try {
    const result = await runIncrementalCrawl();
    return NextResponse.json({
      success: true,
      trigger: "cron_every_3_hours",
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
  }

  try {
    const result = await runIncrementalCrawl();
    return NextResponse.json({
      success: true,
      trigger: "cron_every_3_hours",
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
