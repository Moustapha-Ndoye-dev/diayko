import { db } from "@workspace/db";
import {
  itemsTable,
  itemImagesTable,
  usersTable,
  likesTable,
  ordersTable,
} from "@workspace/db/schema";
import {
  eq,
  ilike,
  and,
  sql,
  desc,
  asc,
  or,
  inArray,
  count,
  notExists,
} from "drizzle-orm";

export type Item = typeof itemsTable.$inferSelect;
export type ItemWithImages = Item & { images: string[] };

/** Recherche insensible a la casse via Postgres ILIKE. */
function itemTextSearchPredicate(qRaw: string) {
  const q = qRaw.trim();
  if (!q) return undefined;

  const pattern = `%${q}%`;
  return or(
    ilike(itemsTable.title, pattern),
    ilike(itemsTable.brand, pattern),
    ilike(itemsTable.description, pattern),
  );
}

function pricePredicate(operator: ">=" | "<=", value: number) {
  const price = sql<number>`CAST(${itemsTable.price} AS NUMERIC)`;
  return operator === ">="
    ? sql`${price} >= ${value}`
    : sql`${price} <= ${value}`;
}

export interface ListItemsFilters {
  category?: string;
  q?: string;
  size?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "newest";
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
    const urls = byItem[img.itemId] ?? [];
    urls.push(img.url);
    byItem[img.itemId] = urls;
  }
  return items.map((i) => ({ ...i, images: byItem[i.id] ?? [] }));
}

export async function list(f: ListItemsFilters) {
  const filters = [];
  if (f.category) filters.push(eq(itemsTable.category, f.category));
  if (f.size) filters.push(eq(itemsTable.size, f.size));
  if (f.condition) filters.push(eq(itemsTable.condition, f.condition));
  if (f.minPrice !== undefined) filters.push(pricePredicate(">=", f.minPrice));
  if (f.maxPrice !== undefined) filters.push(pricePredicate("<=", f.maxPrice));
  if (f.q) {
    const s = itemTextSearchPredicate(f.q);
    if (s) filters.push(s);
  }

  filters.push(
    eq(itemsTable.status, "available"),
    notExists(
      db
        .select({ id: ordersTable.id })
        .from(ordersTable)
        .where(
          and(
            eq(ordersTable.itemId, itemsTable.id),
            inArray(ordersTable.status, ["processing", "in_transit"]),
          ),
        ),
    ),
  );

  const where = and(...filters);
  const orderBy =
    f.sort === "price_asc"
      ? asc(sql`CAST(${itemsTable.price} AS NUMERIC)`)
      : desc(itemsTable.createdAt);

  const [countResult, rows] = await Promise.all([
    db.select({ count: count() }).from(itemsTable).where(where),
    db
      .select()
      .from(itemsTable)
      .where(where)
      .orderBy(orderBy)
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
  return rows[0] ?? null;
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
      originalPrice:
        data.originalPrice === null || data.originalPrice === undefined
          ? null
          : String(data.originalPrice),
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
      .set({
        likesCount: sql`CASE WHEN (${itemsTable.likesCount}) < 1 THEN 0 ELSE (${itemsTable.likesCount}) - 1 END`,
      })
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
      .select({ count: count() })
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

export async function updateItemForSeller(
  itemId: string,
  sellerId: string,
  patch: {
    title?: string;
    brand?: string;
    price?: number;
    originalPrice?: number | null;
    size?: string;
    condition?: string;
    category?: string;
    description?: string;
    color?: string | null;
    images?: string[];
  },
): Promise<ItemWithImages | null> {
  const sid = await findSellerId(itemId);
  if (!sid || sid !== sellerId) return null;

  await db.transaction(async (tx) => {
    const setObj: Record<string, unknown> = {};
    if (patch.title !== undefined) setObj.title = patch.title;
    if (patch.brand !== undefined) setObj.brand = patch.brand;
    if (patch.price !== undefined) setObj.price = String(patch.price);
    if (patch.originalPrice !== undefined) {
      setObj.originalPrice =
        patch.originalPrice == null ? null : String(patch.originalPrice);
    }
    if (patch.size !== undefined) setObj.size = patch.size;
    if (patch.condition !== undefined) setObj.condition = patch.condition;
    if (patch.category !== undefined) setObj.category = patch.category;
    if (patch.description !== undefined) setObj.description = patch.description;
    if (patch.color !== undefined) setObj.color = patch.color;

    if (Object.keys(setObj).length > 0) {
      await tx.update(itemsTable).set(setObj).where(eq(itemsTable.id, itemId));
    }

    if (patch.images !== undefined) {
      await tx.delete(itemImagesTable).where(eq(itemImagesTable.itemId, itemId));
      if (patch.images.length > 0) {
        await tx.insert(itemImagesTable).values(
          patch.images.map((url, position) => ({ itemId, url, position })),
        );
      }
    }
  });

  const [row] = await db.select().from(itemsTable).where(eq(itemsTable.id, itemId)).limit(1);
  if (!row) return null;
  const [withImages] = await attachImages([row]);
  return withImages ?? null;
}

export async function updateStatus(itemId: string, sellerId: string, status: string) {
  const [row] = await db
    .update(itemsTable)
    .set({ status })
    .where(and(eq(itemsTable.id, itemId), eq(itemsTable.sellerId, sellerId)))
    .returning();
  if (!row) return null;
  const [withImages] = await attachImages([row]);
  return withImages ?? null;
}

export async function sumSellerMetrics(sellerId: string) {
  const [row] = await db
    .select({
      views: sql<number>`COALESCE(SUM(${itemsTable.viewsCount}), 0)`,
      likes: sql<number>`COALESCE(SUM(${itemsTable.likesCount}), 0)`,
    })
    .from(itemsTable)
    .where(eq(itemsTable.sellerId, sellerId));
  return { views: Number(row?.views ?? 0), likes: Number(row?.likes ?? 0) };
}
