import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, itemsTable, itemImagesTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

router.post("/users", async (req, res) => {
  const bodySchema = z.object({
    name: z.string().min(2),
    bio: z.string().optional().nullable(),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.insert(usersTable).values(parsed.data).returning();
  res.status(201).json(user);
});

router.get("/users/:id", async (req, res) => {
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.params.id))
    .limit(1);

  if (rows.length === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(rows[0]);
});

router.get("/users/:id/items", async (req, res) => {
  const pageSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  });
  const { page, limit } = pageSchema.parse(req.query);

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(itemsTable)
      .where(eq(itemsTable.sellerId, req.params.id)),
    db
      .select()
      .from(itemsTable)
      .where(eq(itemsTable.sellerId, req.params.id))
      .orderBy(desc(itemsTable.createdAt))
      .limit(limit)
      .offset((page - 1) * limit),
  ]);

  const total = countResult[0]?.count ?? 0;

  if (rows.length === 0) {
    res.json({ items: [], total, page, limit, hasMore: false });
    return;
  }

  const ids = rows.map((i) => i.id);
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

  const items = rows.map((i) => ({ ...i, images: byItem[i.id] ?? [] }));
  res.json({ items, total, page, limit, hasMore: page * limit < total });
});

export default router;
