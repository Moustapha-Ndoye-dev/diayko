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
import { asyncHandler } from "../lib/asyncHandler";
import { HttpError } from "../middlewares/errorHandler";
import { requireAuth } from "../middlewares/authMiddleware";

const router: IRouter = Router();

const idParamsSchema = z.object({ id: z.string().uuid() });

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
    .where(
      sql`${itemImagesTable.itemId} = ANY(${sql.raw(
        `ARRAY[${ids.map((id) => `'${id}'`).join(",")}]::uuid[]`,
      )})`,
    )
    .orderBy(itemImagesTable.position);
  const byItem: Record<string, string[]> = {};
  for (const img of imgs) {
    if (!byItem[img.itemId]) byItem[img.itemId] = [];
    byItem[img.itemId]!.push(img.url);
  }
  return items.map((i) => ({ ...i, images: byItem[i.id] ?? [] }));
}

router.get(
  "/items",
  asyncHandler(async (req, res) => {
    const { category, q, size, condition, minPrice, maxPrice, page, limit } =
      listQuerySchema.parse(req.query);

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
          ilike(itemsTable.description, `%${q}%`),
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
        .limit(limit)
        .offset((page - 1) * limit),
    ]);

    const total = countResult[0]?.count ?? 0;
    const items = await attachImages(rows);

    res.json({ items, total, page, limit, hasMore: page * limit < total });
  }),
);

router.get(
  "/items/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParamsSchema.parse(req.params);
    const rows = await db
      .select()
      .from(itemsTable)
      .leftJoin(usersTable, eq(itemsTable.sellerId, usersTable.id))
      .where(eq(itemsTable.id, id))
      .limit(1);

    if (rows.length === 0) {
      throw new HttpError(404, "Item not found");
    }

    const { items, users } = rows[0]!;
    const [withImages] = await attachImages([items]);
    res.json({ ...withImages, seller: users });
  }),
);

const createBodySchema = z.object({
  title: z.string().min(2),
  brand: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional().nullable(),
  size: z.string().min(1),
  condition: z.enum(["New with tags", "Like new", "Good", "Fair"]),
  category: z.string().min(1),
  description: z.string(),
  color: z.string().optional().nullable(),
  images: z.array(z.string()).min(1),
});

router.post(
  "/items",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { images, ...data } = createBodySchema.parse(req.body);
    const sellerId = req.user!.id;

    const [item] = await db
      .insert(itemsTable)
      .values({
        ...data,
        sellerId,
        price: String(data.price),
        originalPrice: data.originalPrice != null ? String(data.originalPrice) : null,
      })
      .returning();

    if (!item) throw new HttpError(500, "Failed to create item");

    await db.insert(itemImagesTable).values(
      images.map((url, position) => ({ itemId: item.id, url, position })),
    );

    res.status(201).json({ ...item, images });
  }),
);

router.delete(
  "/items/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = idParamsSchema.parse(req.params);

    const [existing] = await db
      .select({ sellerId: itemsTable.sellerId })
      .from(itemsTable)
      .where(eq(itemsTable.id, id))
      .limit(1);

    if (!existing) throw new HttpError(404, "Item not found");
    if (existing.sellerId !== req.user!.id) {
      throw new HttpError(403, "Forbidden");
    }

    await db.delete(itemsTable).where(eq(itemsTable.id, id));
    res.status(204).send();
  }),
);

router.post(
  "/items/:id/view",
  asyncHandler(async (req, res) => {
    const { id } = idParamsSchema.parse(req.params);
    const [updated] = await db
      .update(itemsTable)
      .set({ viewsCount: sql`${itemsTable.viewsCount} + 1` })
      .where(eq(itemsTable.id, id))
      .returning({ viewsCount: itemsTable.viewsCount });

    if (!updated) throw new HttpError(404, "Item not found");
    res.json({ viewsCount: updated.viewsCount });
  }),
);

router.post(
  "/items/:id/like",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { id: itemId } = idParamsSchema.parse(req.params);

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
  }),
);

export default router;
