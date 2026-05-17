import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, itemsTable, itemImagesTable, sessionsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";

const router: IRouter = Router();

const userIdSchema = z.string().min(1);

const postProfileBody = z.object({
  bio: z.string().max(500).nullable(),
});

const patchProfileBody = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional().nullable(),
}).refine((d) => d.name !== undefined || d.bio !== undefined, {
  message: "At least one of name or bio must be provided",
});

router.post(
  "/users",
  requireAuth,
  asyncHandler(async (req, res) => {
    const parsed = postProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [user] = await db
      .update(usersTable)
      .set({ bio: parsed.data.bio ?? null, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.id))
      .returning();

    res.json(user ?? null);
  }),
);

router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    if (!userIdSchema.safeParse(req.params.id).success) {
      res.status(404).json({ error: "User not found" });
      return;
    }

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
  }),
);

router.patch(
  "/users/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!userIdSchema.safeParse(req.params.id).success) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (req.params.id !== req.user!.id) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const parsed = patchProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const setFields: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.name !== undefined) setFields.name = parsed.data.name;
    if (parsed.data.bio !== undefined) setFields.bio = parsed.data.bio ?? null;

    const [user] = await db
      .update(usersTable)
      .set(setFields)
      .where(eq(usersTable.id, req.user!.id))
      .returning();

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  }),
);

router.get(
  "/users/:id/items",
  asyncHandler(async (req, res) => {
    if (!userIdSchema.safeParse(req.params.id).success) {
      res.json({ items: [], total: 0, page: 1, limit: 20, hasMore: false });
      return;
    }

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
      .where(
        sql`${itemImagesTable.itemId} = ANY(${sql.raw(`ARRAY[${ids.map((id) => `'${id}'`).join(",")}]::uuid[]`)})`,
      )
      .orderBy(itemImagesTable.position);

    const byItem: Record<string, string[]> = {};
    for (const img of imgs) {
      if (!byItem[img.itemId]) byItem[img.itemId] = [];
      byItem[img.itemId]!.push(img.url);
    }

    const items = rows.map((i) => ({ ...i, images: byItem[i.id] ?? [] }));
    res.json({ items, total, page, limit, hasMore: page * limit < total });
  }),
);

router.delete(
  "/users/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    await db
      .delete(sessionsTable)
      .where(sql`${sessionsTable.sess}->>'user' IS NOT NULL AND ${sessionsTable.sess}->'user'->>'id' = ${userId}`);

    await db.delete(usersTable).where(eq(usersTable.id, userId));

    res.status(204).send();
  }),
);

export default router;
