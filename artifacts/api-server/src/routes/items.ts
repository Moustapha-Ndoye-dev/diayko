import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  itemsTable,
  itemImagesTable,
  usersTable,
  likesTable,
} from "@workspace/db/schema";
import { eq, ilike, and, gte, lte, sql, desc, or } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

const listQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  size: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

async function attachImages(items: (typeof itemsTable.$inferSelect)[]) {
  if (items.length === 0) return items.map((i) => ({ ...i, images: [] as string[] }));
  const ids = items.map((i) => i.id);
  const imgs = await db
    .select()
    .from(itemImagesTable)
    .where(sql`${itemImagesTable.itemId} = ANY(${sql.raw(`ARRAY[${ids.map((id) => `'${id}'`).join(",")}]::uuid[]`)})`)
    .orderBy(itemImagesTable.position);
  const byItem: Record<string, string[]> = {};
  for (const img of imgs) {
    if (!byItem[img.itemId]) byItem[img.itemId] = [];
    byItem[img.itemId].push(img.url);
  }
  return items.map((i) => ({ ...i, images: byItem[i.id] ?? [] }));
}

router.get("/items", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { category, q, size, condition, minPrice, maxPrice, page, limit } = parsed.data;

  const filters = [];
  if (category) filters.push(eq(itemsTable.category, category));
  if (size) filters.push(eq(itemsTable.size, size));
  if (condition) filters.push(eq(itemsTable.condition, condition));
  if (minPrice !== undefined) filters.push(gte(itemsTable.price, String(minPrice)));
  if (maxPrice !== undefined) filters.push(lte(itemsTable.price, String(maxPrice)));
  if (q) {
    filters.push(
      or(
        ilike(itemsTable.title, `%${q}%`),
        ilike(itemsTable.brand, `%${q}%`),
        ilike(itemsTable.description, `%${q}%`)
      )
    );
  }

  const where = filters.length > 0 ? and(...filters) : undefined;

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(itemsTable)
      .where(where),
    db
      .select()
      .from(itemsTable)
      .where(where)
      .orderBy(desc(itemsTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
  ]);

  const total = countResult[0]?.count ?? 0;
  const items = await attachImages(rows);

  res.json({ items, total, page, limit, hasMore: page * limit < total });
});

router.get("/items/:id", async (req, res) => {
  const rows = await db
    .select()
    .from(itemsTable)
    .leftJoin(usersTable, eq(itemsTable.sellerId, usersTable.id))
    .where(eq(itemsTable.id, req.params.id))
    .limit(1);

  if (rows.length === 0) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  const { items, users } = rows[0];
  const withImages = await attachImages([items]);
  res.json({ ...withImages[0], seller: users });
});

router.post("/items", async (req, res) => {
  const bodySchema = z.object({
    title: z.string().min(2),
    brand: z.string().min(1),
    price: z.number().positive(),
    originalPrice: z.number().positive().optional().nullable(),
    size: z.string().min(1),
    condition: z.enum(["New with tags", "Like new", "Good", "Fair"]),
    category: z.string().min(1),
    description: z.string(),
    color: z.string().optional().nullable(),
    sellerId: z.string().uuid(),
    images: z.array(z.string()).min(1),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { images, ...data } = parsed.data;

  const [item] = await db
    .insert(itemsTable)
    .values({
      ...data,
      price: String(data.price),
      originalPrice: data.originalPrice != null ? String(data.originalPrice) : null,
    })
    .returning();

  await db.insert(itemImagesTable).values(
    images.map((url, position) => ({ itemId: item.id, url, position }))
  );

  res.status(201).json({ ...item, images });
});

router.delete("/items/:id", async (req, res) => {
  const result = await db
    .delete(itemsTable)
    .where(eq(itemsTable.id, req.params.id))
    .returning({ id: itemsTable.id });

  if (result.length === 0) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.status(204).send();
});

router.post("/items/:id/view", async (req, res) => {
  const [updated] = await db
    .update(itemsTable)
    .set({ viewsCount: sql`${itemsTable.viewsCount} + 1` })
    .where(eq(itemsTable.id, req.params.id))
    .returning({ viewsCount: itemsTable.viewsCount });

  if (!updated) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  res.json({ viewsCount: updated.viewsCount });
});

router.post("/items/:id/like", async (req, res) => {
  const bodySchema = z.object({ userId: z.string().uuid() });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { userId } = parsed.data;
  const itemId = req.params.id;

  const existing = await db
    .select()
    .from(likesTable)
    .where(and(eq(likesTable.userId, userId), eq(likesTable.itemId, itemId)))
    .limit(1);

  let liked: boolean;

  if (existing.length > 0) {
    await db
      .delete(likesTable)
      .where(and(eq(likesTable.userId, userId), eq(likesTable.itemId, itemId)));
    await db
      .update(itemsTable)
      .set({ likesCount: sql`GREATEST(0, ${itemsTable.likesCount} - 1)` })
      .where(eq(itemsTable.id, itemId));
    liked = false;
  } else {
    await db.insert(likesTable).values({ userId, itemId });
    await db
      .update(itemsTable)
      .set({ likesCount: sql`${itemsTable.likesCount} + 1` })
      .where(eq(itemsTable.id, itemId));
    liked = true;
  }

  const [item] = await db
    .select({ likesCount: itemsTable.likesCount })
    .from(itemsTable)
    .where(eq(itemsTable.id, itemId))
    .limit(1);

  res.json({ liked, likesCount: item?.likesCount ?? 0 });
});

export default router;
