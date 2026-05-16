import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { likesTable, itemsTable, itemImagesTable } from "@workspace/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { asyncHandler } from "../lib/asyncHandler";
import { HttpError } from "../middlewares/errorHandler";

const router: IRouter = Router();

router.get(
  "/me/favorites",
  asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
      throw new HttpError(401, "Authentication required");
    }
    const id = req.user.id;

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
