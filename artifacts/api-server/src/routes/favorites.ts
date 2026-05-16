import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { likesTable, itemsTable, itemImagesTable } from "@workspace/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";

const router: IRouter = Router();

const userIdParams = z.object({ id: z.string().uuid() });

router.get(
  "/users/:id/favorites",
  asyncHandler(async (req, res) => {
    const { id } = userIdParams.parse(req.params);

    const rows = await db
      .select({ item: itemsTable })
      .from(likesTable)
      .innerJoin(itemsTable, eq(likesTable.itemId, itemsTable.id))
      .where(eq(likesTable.userId, id))
      .orderBy(desc(likesTable.createdAt));

    if (rows.length === 0) {
      res.json({ items: [], ids: [] });
      return;
    }

    const ids = rows.map((r) => r.item.id);
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

    const items = rows.map((r) => ({ ...r.item, images: byItem[r.item.id] ?? [] }));
    res.json({ items, ids });
  }),
);

export default router;
