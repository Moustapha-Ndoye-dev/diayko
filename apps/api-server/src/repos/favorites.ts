import { db } from "@workspace/db";
import { likesTable, itemsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { attachImages, type ItemWithImages } from "./items";

export async function listForUser(
  userId: string,
): Promise<{ items: ItemWithImages[]; ids: string[] }> {
  const rows = await db
    .select({ item: itemsTable })
    .from(likesTable)
    .innerJoin(itemsTable, eq(likesTable.itemId, itemsTable.id))
    .where(eq(likesTable.userId, userId))
    .orderBy(desc(likesTable.createdAt));

  if (rows.length === 0) return { items: [], ids: [] };

  const items = await attachImages(rows.map((r) => r.item));
  return { items, ids: items.map((i) => i.id) };
}
