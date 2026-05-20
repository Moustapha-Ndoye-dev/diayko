import { db } from "@workspace/db";
import { supportTicketsTable } from "@workspace/db/schema";

export async function createTicket(data: {
  userId: string;
  subject: string;
  message: string;
}) {
  const [row] = await db.insert(supportTicketsTable).values(data).returning();
  return row ?? null;
}
