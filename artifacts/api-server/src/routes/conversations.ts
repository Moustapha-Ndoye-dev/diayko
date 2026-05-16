import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  conversationsTable,
  messagesTable,
  usersTable,
  itemsTable,
  itemImagesTable,
} from "@workspace/db/schema";
import { eq, or, desc, sql } from "drizzle-orm";
import { z } from "zod";

const router: IRouter = Router();

router.get("/conversations", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const userId = req.user.id;

  const rows = await db
    .select()
    .from(conversationsTable)
    .where(
      or(
        eq(conversationsTable.buyerId, userId),
        eq(conversationsTable.sellerId, userId)
      )
    )
    .orderBy(desc(conversationsTable.lastMessageAt));

  if (rows.length === 0) {
    res.json([]);
    return;
  }

  const otherUserIds = rows.map((r) =>
    r.buyerId === userId ? r.sellerId : r.buyerId
  );
  const itemIds = rows.map((r) => r.itemId).filter(Boolean) as string[];

  const [otherUsers, items, itemImgs] = await Promise.all([
    otherUserIds.length > 0
      ? db
          .select()
          .from(usersTable)
          .where(sql`${usersTable.id} = ANY(${sql.raw(`ARRAY[${otherUserIds.map((id) => `'${id}'`).join(",")}]::uuid[]`)})`)
      : Promise.resolve([]),
    itemIds.length > 0
      ? db
          .select()
          .from(itemsTable)
          .where(sql`${itemsTable.id} = ANY(${sql.raw(`ARRAY[${itemIds.map((id) => `'${id}'`).join(",")}]::uuid[]`)})`)
      : Promise.resolve([]),
    itemIds.length > 0
      ? db
          .select()
          .from(itemImagesTable)
          .where(sql`${itemImagesTable.itemId} = ANY(${sql.raw(`ARRAY[${itemIds.map((id) => `'${id}'`).join(",")}]::uuid[]`)})`)
          .orderBy(itemImagesTable.position)
      : Promise.resolve([]),
  ]);

  const usersById: Record<string, typeof usersTable.$inferSelect> = {};
  for (const u of otherUsers) usersById[u.id] = u;

  const itemsById: Record<string, typeof itemsTable.$inferSelect & { images: string[] }> = {};
  for (const item of items) itemsById[item.id] = { ...item, images: [] };
  for (const img of itemImgs) {
    if (itemsById[img.itemId]) itemsById[img.itemId].images.push(img.url);
  }

  const result = rows.map((conv) => {
    const otherUserId = conv.buyerId === userId ? conv.sellerId : conv.buyerId;
    return {
      ...conv,
      otherUser: usersById[otherUserId] ?? null,
      item: conv.itemId ? itemsById[conv.itemId] ?? null : null,
    };
  });

  res.json(result);
});

router.post("/conversations", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const bodySchema = z.object({
    sellerId: z.string().uuid(),
    itemId: z.string().uuid().optional().nullable(),
    initialMessage: z.string().optional(),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { sellerId, itemId, initialMessage } = parsed.data;
  const buyerId = req.user.id;

  const [conv] = await db
    .insert(conversationsTable)
    .values({
      buyerId,
      sellerId,
      itemId: itemId ?? null,
      lastMessage: initialMessage ?? null,
      lastMessageAt: initialMessage ? new Date() : null,
    })
    .returning();

  if (initialMessage) {
    await db.insert(messagesTable).values({
      conversationId: conv!.id,
      senderId: buyerId,
      text: initialMessage,
    });
  }

  const [otherUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, sellerId))
    .limit(1);

  res.status(201).json({ ...conv, otherUser: otherUser ?? null, item: null });
});

router.get("/conversations/:id/messages", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  const rows = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, req.params.id))
    .orderBy(messagesTable.createdAt);

  res.json(rows);
});

router.post("/conversations/:id/messages", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const bodySchema = z.object({
    text: z.string().min(1),
  });

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { text } = parsed.data;
  const senderId = req.user.id;
  const conversationId = req.params.id;

  const [msg] = await db
    .insert(messagesTable)
    .values({ conversationId, senderId, text })
    .returning();

  await db
    .update(conversationsTable)
    .set({
      lastMessage: text,
      lastMessageAt: new Date(),
      unreadCount: sql`${conversationsTable.unreadCount} + 1`,
    })
    .where(eq(conversationsTable.id, conversationId));

  res.status(201).json(msg);
});

export default router;
