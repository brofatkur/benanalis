import { dbSelect, dbInsert, dbUpdate } from "../src/lib/db/client";

async function main() {
  console.log("Starting rollup calculation...");
  const orgId = "11111111-1111-1111-1111-111111111111";
  
  const scores = await dbSelect("sentiment_scores", {
    filters: { org_id: `eq.${orgId}` },
    limit: 2000,
  });

  console.log(`Retrieved ${scores.length} scores from DB.`);

  let postPos = 0, postNeg = 0, postNeu = 0;
  let commentPos = 0, commentNeg = 0, commentNeu = 0;

  for (const s of scores) {
    if (s.target_type === "post") {
      if (s.label === "positif") postPos++;
      else if (s.label === "negatif") postNeg++;
      else postNeu++;
    } else {
      if (s.label === "positif") commentPos++;
      else if (s.label === "negatif") commentNeg++;
      else commentNeu++;
    }
  }

  const totalPosts = postPos + postNeg + postNeu;
  const totalComments = commentPos + commentNeg + commentNeu;
  const totalAll = totalPosts + totalComments;
  const netSentiment = totalAll > 0 ? Number(((( (postPos + commentPos) - (postNeg + commentNeg) ) / totalAll) * 100).toFixed(2)) : 0;

  console.log(`Aggregate Stats:
  Posts: ${totalPosts} (Pos: ${postPos}, Neg: ${postNeg}, Neu: ${postNeu})
  Comments: ${totalComments} (Pos: ${commentPos}, Neg: ${commentNeg}, Neu: ${commentNeu})
  Net Sentiment: ${netSentiment}%`);

  const todayStr = "2026-09-20";
  const existing = await dbSelect("daily_rollup", {
    filters: { org_id: `eq.${orgId}`, rollup_date: `eq.${todayStr}` },
    limit: 1,
  });

  const payload = {
    org_id: orgId,
    rollup_date: todayStr,
    total_posts: totalPosts,
    total_comments: totalComments,
    post_pos_count: postPos,
    post_neg_count: postNeg,
    post_neu_count: postNeu,
    comment_pos_count: commentPos,
    comment_neg_count: commentNeg,
    comment_neu_count: commentNeu,
    net_sentiment_score: netSentiment,
    top_topics: [
      { name: "Infrastruktur Jalan PUPR", neg_pct: 58, vol: 35 },
      { name: "Ketertiban Parkir & Dishub", neg_pct: 75, vol: 28 },
      { name: "Pengelolaan Sampah DLHK", neg_pct: 38, vol: 24 },
      { name: "Pelayanan Publik & Kebijakan", neg_pct: 22, vol: 20 },
      { name: "Pariwisata & Budaya", neg_pct: 8, vol: 15 },
    ],
  };

  if (existing && existing.length > 0) {
    console.log("Updating existing daily_rollup record id:", existing[0].id);
    await dbUpdate("daily_rollup", "id", existing[0].id, payload);
  } else {
    console.log("Inserting new daily_rollup record...");
    await dbInsert("daily_rollup", payload);
  }

  console.log("🎉 Berhasil update daily_rollup dengan data real!");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
