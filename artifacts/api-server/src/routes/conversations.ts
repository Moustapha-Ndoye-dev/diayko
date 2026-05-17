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
import { asyncHandler } from "../lib/asyncHandler";
import { HttpError } from "../middlewares/errorHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import { conversationCreateRateLimit, messageSendRateLimit } from "../middlewares/rateLimiter.js";

const router: IRouter = Router();

/**
 * GET /conversations
 *
 * Returns the conversation inbox for the authenticated user. Identity is
 * derived exclusively from the verified session — no caller-supplied userId.
 */
router.get(
  "/conversations",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;

    const rows = await db
      .select()
      .from(conversationsTable)
      .where(
        or(
          eq(conversationsTable.buyerId, userId),
          eq(conversationsTable.sellerId, userId),
        ),
      )
      .orderBy(desc(conversationsTable.lastMessageAt));

    if (rows.length === 0) {
      res.json([]);
      return;
    }

    const otherUserIds = rows.map((r) =>
      r.buyerId === userId ? r.sellerId : r.buyerId,
    );
    const itemIds = rows.map((r) => r.itemId).filter(Boolean) as string[];

    const [otherUsers, items, itemImgs] = await Promise.all([
      otherUserIds.length > 0
        ? db
            .select()
            .from(usersTable)
            .where(
              sql`${usersTable.id} = ANY(${sql.raw(`ARRAY[${otherUserIds.map((id) => `'${id}'`).join(",")}]::uuid[]`)})`,
            )
        : Promise.resolve([]),
      itemIds.length > 0
        ? db
            .select()
            .from(itemsTable)
            .where(
              sql`${itemsTable.id} = ANY(${sql.raw(`ARRAY[${itemIds.map((id) => `'${id}'`).join(",")}]::uuid[]`)})`,
            )
        : Promise.resolve([]),
      itemIds.length > 0
        ? db
            .select()
            .from(itemImagesTable)
            .where(
              sql`${itemImagesTable.itemId} = ANY(${sql.raw(`ARRAY[${itemIds.map((id) => `'${id}'`).join(",")}]::uuid[]`)})`,
            )
            .orderBy(itemImagesTable.position)
        : Promise.resolve([]),
    ]);

    const usersById: Record<string, typeof usersTable.$inferSelect> = {};
    for (const u of otherUsers) usersById[u.id] = u;

    const itemsById: Record<
      string,
      typeof itemsTable.$inferSelect & { images: string[] }
    > = {};
    for (const item of items) itemsById[item.id] = { ...item, images: [] };
    for (const img of itemImgs) {
      if (itemsById[img.itemId]) itemsById[img.itemId]!.images.push(img.url);
    }

    const result = rows.map((conv) => {
      const otherUserId =
        conv.buyerId === userId ? conv.sellerId : conv.buyerId;
      return {
        ...conv,
        otherUser: usersById[otherUserId] ?? null,
        item: conv.itemId ? itemsById[conv.itemId] ?? null : null,
      };
    });

    res.json(result);
  }),
);

/**
 * POST /conversations
 *
 * Creates a conversation. The authenticated user becomes the buyer — buyerId
 * is never read from the request body. If itemId is supplied, sellerId is
 * verified against the item's actual seller.
 */
const createConversationBody = z.object({
  sellerId: z.string(),
  itemId: z.string().uuid().optional().nullable(),
  initialMessage: z.string().max(2000, "Message cannot exceed 2000 characters").optional(),
});

router.post(
  "/conversations",
  conversationCreateRateLimit,
  requireAuth,
  asyncHandler(async (req, res) => {
    const { sellerId, itemId, initialMessage } = createConversationBody.parse(req.body);
    const buyerId = req.user!.id;

    if (buyerId === sellerId) {
      throw new HttpError(400, "Cannot start a conversation with yourself");
    }

    if (itemId) {
      const [item] = await db
        .select({ sellerId: itemsTable.sellerId })
        .from(itemsTable)
        .where(eq(itemsTable.id, itemId))
        .limit(1);

      if (!item) throw new HttpError(404, "Item not found");
      if (item.sellerId !== sellerId) {
        throw new HttpError(403, "sellerId does not match the item's seller");
      }
    }

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

    if (!conv) throw new HttpError(500, "Failed to create conversation");

    if (initialMessage) {
      await db.insert(messagesTable).values({
        conversationId: conv.id,
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
  }),
);

/**
 * GET /conversations/:id/messages
 *
 * Returns message history. The caller must be an authenticated participant —
 * identity is derived from the session, never a query param.
 */
router.get(
  "/conversations/:id/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const conversationId = String(req.params.id);

    const [conv] = await db
      .select({
        buyerId: conversationsTable.buyerId,
        sellerId: conversationsTable.sellerId,
      })
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId))
      .limit(1);

    if (!conv) throw new HttpError(404, "Conversation not found");
    if (conv.buyerId !== userId && conv.sellerId !== userId) {
      throw new HttpError(403, "Access denied");
    }

    const rows = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, conversationId))
      .orderBy(messagesTable.createdAt);

    res.json(rows);
  }),
);

/**
 * POST /conversations/:id/messages
 *
 * Sends a message. The sender is derived from the authenticated session —
 * any senderId in the body is ignored. The caller must be a participant.
 */
const sendMessageBody = z.object({
  text: z.string().min(1).max(2000, "Message cannot exceed 2000 characters"),
});

router.post(
  "/conversations/:id/messages",
  messageSendRateLimit,
  requireAuth,
  asyncHandler(async (req, res) => {
    const { text } = sendMessageBody.parse(req.body);
    const senderId = req.user!.id;
    const conversationId = String(req.params.id);

    const [conv] = await db
      .select({
        buyerId: conversationsTable.buyerId,
        sellerId: conversationsTable.sellerId,
      })
      .from(conversationsTable)
      .where(eq(conversationsTable.id, conversationId))
      .limit(1);

    if (!conv) throw new HttpError(404, "Conversation not found");
    if (conv.buyerId !== senderId && conv.sellerId !== senderId) {
      throw new HttpError(403, "You are not a participant of this conversation");
    }

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
  }),
);

export default router;
