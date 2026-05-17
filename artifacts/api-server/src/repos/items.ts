import { db } from "@workspace/db";
import {
  itemsTable,
  itemImagesTable,
  usersTable,
  likesTable,
} from "@workspace/db/schema";
import { eq, ilike, and, gte, lte, sql, desc, or, inArray } from "drizzle-orm";

export type Item = typeof itemsTable.$inferSelect;
export type ItemWithImages = Item & { images: string[] };

export interface ListItemsFilters {
  category?: string;
  q?: string;
  size?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}

export async function attachImages(items: Item[]): Promise<ItemWithImages[]> {
  if (items.length === 0) return [];
  const ids = items.map((i) => i.id);
  const imgs = await db
    .select()
    .from(itemImagesTable)
    .where(inArray(itemImagesTable.itemId, ids))
    .orderBy(itemImagesTable.position);
  const byItem: Record<string, string[]> = {};
  for (const img of imgs) {
    if (!byItem[img.itemId]) byItem[img.itemId] = [];
    byItem[img.itemId]!.push(img.url);
  }
  return items.map((i) => ({ ...i, images: byItem[i.id] ?? [] }));
}

export async function list(f: ListItemsFilters) {
  const filters = [];
  if (f.category) filters.push(eq(itemsTable.category, f.category));
  if (f.size) filters.push(eq(itemsTable.size, f.size));
  if (f.condition) filters.push(eq(itemsTable.condition, f.condition));
  if (f.minPrice !== undefined) filters.push(gte(itemsTable.price, String(f.minPrice)));
  if (f.maxPrice !== undefined) filters.push(lte(itemsTable.price, String(f.maxPrice)));
  if (f.q) {
    filters.push(
      or(
        ilike(itemsTable.title, `%${f.q}%`),
        ilike(itemsTable.brand, `%${f.q}%`),
        ilike(itemsTable.description, `%${f.q}%`),
      ),
    );
  }
  const where = filters.length > 0 ? and(...filters) : undefined;

  const [countResult, rows] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(itemsTable).where(where),
    db
      .select()
      .from(itemsTable)
      .where(where)
      .orderBy(desc(itemsTable.createdAt))
      .limit(f.limit)
      .offset((f.page - 1) * f.limit),
  ]);

  const total = countResult[0]?.count ?? 0;
  const items = await attachImages(rows);
  return { items, total };
}

export async function findByIdWithSeller(id: string) {
  const rows = await db
    .select()
    .from(itemsTable)
    .leftJoin(usersTable, eq(itemsTable.sellerId, usersTable.id))
    .where(eq(itemsTable.id, id))
    .limit(1);
  if (rows.length === 0) return null;
  return rows[0]!;
}

export async function findSellerId(id: string): Promise<string | null> {
  const [row] = await db
    .select({ sellerId: itemsTable.sellerId })
    .from(itemsTable)
    .where(eq(itemsTable.id, id))
    .limit(1);
  return row?.sellerId ?? null;
}

export async function insertItem(data: {
  sellerId: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number | null;
  size: string;
  condition: string;
  category: string;
  description: string;
  color?: string | null;
}) {
  const [item] = await db
    .insert(itemsTable)
    .values({
      ...data,
      price: String(data.price),
      originalPrice: data.originalPrice != null ? String(data.originalPrice) : null,
    })
    .returning();
  return item ?? null;
}

export async function insertImages(itemId: string, urls: string[]) {
  if (urls.length === 0) return;
  await db
    .insert(itemImagesTable)
    .values(urls.map((url, position) => ({ itemId, url, position })));
}

export async function deleteItem(id: string) {
  await db.delete(itemsTable).where(eq(itemsTable.id, id));
}

export async function incrementViews(id: string): Promise<number | null> {
  const [updated] = await db
    .update(itemsTable)
    .set({ viewsCount: sql`${itemsTable.viewsCount} + 1` })
    .where(eq(itemsTable.id, id))
    .returning({ viewsCount: itemsTable.viewsCount });
  return updated?.viewsCount ?? null;
}

export async function findLike(userId: string, itemId: string) {
  const rows = await db
    .select()
    .from(likesTable)
    .where(and(eq(likesTable.userId, userId), eq(likesTable.itemId, itemId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function addLike(userId: string, itemId: string) {
  await db.insert(likesTable).values({ userId, itemId });
  await db
    .update(itemsTable)
    .set({ likesCount: sql`${itemsTable.likesCount} + 1` })
    .where(eq(itemsTable.id, itemId));
}

export async function removeLike(userId: string, itemId: string) {
  await db
    .delete(likesTable)
    .where(and(eq(likesTable.userId, userId), eq(likesTable.itemId, itemId)));
  await db
    .update(itemsTable)
    .set({ likesCount: sql`GREATEST(0, ${itemsTable.likesCount} - 1)` })
    .where(eq(itemsTable.id, itemId));
}

export async function getLikesCount(itemId: string): Promise<number> {
  const [item] = await db
    .select({ likesCount: itemsTable.likesCount })
    .from(itemsTable)
    .where(eq(itemsTable.id, itemId))
    .limit(1);
  return item?.likesCount ?? 0;
}

export async function listBySeller(sellerId: string, page: number, limit: number) {
  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(itemsTable)
      .where(eq(itemsTable.sellerId, sellerId)),
    db
      .select()
      .from(itemsTable)
      .where(eq(itemsTable.sellerId, sellerId))
      .orderBy(desc(itemsTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
  ]);
  const total = countResult[0]?.count ?? 0;
  const items = await attachImages(rows);
  return { items, total };
}
