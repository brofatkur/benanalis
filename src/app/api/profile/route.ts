import { NextResponse } from "next/server";
import { dbSelect, dbUpdate } from "@/lib/db/client";
import { getActiveProfile } from "@/lib/services/sentiment";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("org_id");
    const profile = await getActiveProfile(orgId || undefined);

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, org_type, focus_areas, related_entities, context_rules } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Org ID is required" }, { status: 400 });
    }

    // Fetch current profile to bump version
    const existing = await dbSelect("org_profile", {
      filters: { id: `eq.${id}` },
      limit: 1,
    });

    const currentVersion = existing && existing[0]?.profile_version ? existing[0].profile_version : 1;
    const newVersion = currentVersion + 1;

    const updated = await dbUpdate("org_profile", "id", id, {
      name,
      org_type,
      focus_areas,
      related_entities,
      context_rules,
      profile_version: newVersion,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Profil berhasil diperbarui ke Versi ${newVersion}. Evaluasi sentimen selanjutnya akan menggunakan acuan versi baru ini.`,
      data: updated && updated.length > 0 ? updated[0] : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update profile" },
      { status: 500 }
    );
  }
}
