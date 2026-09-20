import crypto from "crypto";
import { dbSelect, dbInsert } from "@/lib/db/client";

export function computeContentHash(content: string): string {
  // Normalize whitespace and lowercase to detect near-identical spam/duplicates
  const normalized = content
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return crypto.createHash("sha256").update(normalized).digest("hex");
}

export async function checkAndRegisterDedup(
  content: string,
  targetType: "post" | "comment",
  targetId: string
): Promise<{ isDuplicate: boolean; hash: string }> {
  const hash = computeContentHash(content);

  try {
    const existing = await dbSelect("dedup_log", {
      filters: { content_hash: `eq.${hash}` },
      limit: 1,
    });

    if (existing && existing.length > 0) {
      return { isDuplicate: true, hash };
    }

    // Register into dedup_log
    await dbInsert("dedup_log", {
      content_hash: hash,
      target_type: targetType,
      target_id: targetId,
    });

    return { isDuplicate: false, hash };
  } catch (error) {
    console.error("Dedup check error:", error);
    // On dedup log error, allow processing to continue
    return { isDuplicate: false, hash };
  }
}
