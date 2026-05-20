import { db } from "@workspace/db";
import { conversationReportsTable } from "@workspace/db/schema";

export async function insertReport(data: {
  conversationId: string;
  reporterId: string;
  reason: string;
  details: string | null;
}) {
  const [row] = await db.insert(conversationReportsTable).values(data).returning();
  return row ?? null;
}
