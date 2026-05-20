import { db } from "@workspace/db";
import {
  conversationsTable,
  messagesTable,
  usersTable,
  itemsTable,
  itemImagesTable,
} from "@workspace/db/schema";
import { eq, or, desc, sql, and, lt, inArray } from "drizzle-orm";

export type Conversation = typeof conversationsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;

export async function listForUser(userId: string): Promise<Conversation[]> {
  return db
    .select()
    .from(conversationsTable)
    .where(
      or(
        eq(conversationsTable.buyerId, userId),
        eq(conversationsTable.sellerId, userId),
      ),
    )
    .orderBy(desc(conversationsTable.lastMessageAt));
}

export async function hydrateInbox(userId: string, convs: Conversation[]) {
  const otherUserIds = convs.map((c) => (c.buyerId === userId ? c.sellerId : c.buyerId));
  const itemIds = convs.map((c) => c.itemId).filter((x): x is string => Boolean(x));

  const [otherUsers, items, itemImgs] = await Promise.all([
    otherUserIds.length > 0
      ? db.select().from(usersTable).where(inArray(usersTable.id, otherUserIds))
      : Promise.resolve([]),
    itemIds.length > 0
      ? db.select().from(itemsTable).where(inArray(itemsTable.id, itemIds))
      : Promise.resolve([]),
    itemIds.length > 0
      ? db
          .select()
          .from(itemImagesTable)
          .where(inArray(itemImagesTable.itemId, itemIds))
          .orderBy(itemImagesTable.position)
      : Promise.resolve([]),
  ]);

  const usersById: Record<string, typeof usersTable.$inferSelect> = {};
  for (const u of otherUsers) usersById[u.id] = u;

  const itemsById: Record<string, typeof itemsTable.$inferSelect & { images: string[] }> = {};
  for (const item of items) itemsById[item.id] = { ...item, images: [] };
  for (const img of itemImgs) {
    const itemEntry = itemsById[img.itemId];
    if (itemEntry) itemEntry.images.push(img.url);
  }

  return convs.map((conv) => {
    const otherUserId = conv.buyerId === userId ? conv.sellerId : conv.buyerId;
    const unread =
      conv.buyerId === userId ? conv.buyerUnreadCount : conv.sellerUnreadCount;
    return {
      id: conv.id,
      buyerId: conv.buyerId,
      sellerId: conv.sellerId,
      itemId: conv.itemId,
      unreadCount: unread,
      lastMessage: conv.lastMessage,
      lastMessageAt: conv.lastMessageAt,
      createdAt: conv.createdAt,
      otherUser: usersById[otherUserId] ?? null,
      item: conv.itemId ? itemsById[conv.itemId] ?? null : null,
    };
  });
}

export async function findParticipants(conversationId: string) {
  const [row] = await db
    .select({
      buyerId: conversationsTable.buyerId,
      sellerId: conversationsTable.sellerId,
    })
    .from(conversationsTable)
    .where(eq(conversationsTable.id, conversationId))
    .limit(1);
  return row ?? null;
}

export async function insertConversation(data: {
  buyerId: string;
  sellerId: string;
  itemId: string | null;
  initialMessage: string | null;
}) {
  const [conv] = await db
    .insert(conversationsTable)
    .values({
      buyerId: data.buyerId,
      sellerId: data.sellerId,
      itemId: data.itemId,
      lastMessage: data.initialMessage,
      lastMessageAt: data.initialMessage ? new Date() : null,
    })
    .returning();
  return conv ?? null;
}

export async function getOtherUser(userId: string) {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return user ?? null;
}

export async function listMessagesAscending(
  conversationId: string,
  opts: { limit: number; beforeMessageId?: string },
): Promise<Message[]> {
  const limit = Math.min(Math.max(opts.limit, 1), 100);

  if (opts.beforeMessageId) {
    const [cursor] = await db
      .select()
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.conversationId, conversationId),
          eq(messagesTable.id, opts.beforeMessageId),
        ),
      )
      .limit(1);
    if (!cursor) return [];

    const older = await db
      .select()
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.conversationId, conversationId),
          lt(messagesTable.createdAt, cursor.createdAt),
        ),
      )
      .orderBy(desc(messagesTable.createdAt))
      .limit(limit);
    return older.reverse();
  }

  const rows = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(desc(messagesTable.createdAt))
    .limit(limit);
  return rows.reverse();
}

export async function insertMessage(data: {
  conversationId: string;
  senderId: string;
  text: string;
}): Promise<Message | null> {
  const [msg] = await db.insert(messagesTable).values(data).returning();
  return msg ?? null;
}

export async function bumpAfterNewMessage(
  conversationId: string,
  senderId: string,
  preview: string,
) {
  const p = await findParticipants(conversationId);
  if (!p) return;

  const incBuyerUnread = senderId === p.sellerId ? 1 : 0;
  const incSellerUnread = senderId === p.buyerId ? 1 : 0;

  await db
    .update(conversationsTable)
    .set({
      lastMessage: preview,
      lastMessageAt: new Date(),
      buyerUnreadCount: sql`${conversationsTable.buyerUnreadCount} + ${incBuyerUnread}`,
      sellerUnreadCount: sql`${conversationsTable.sellerUnreadCount} + ${incSellerUnread}`,
      unreadCount: sql`${conversationsTable.buyerUnreadCount} + ${incBuyerUnread} + ${conversationsTable.sellerUnreadCount} + ${incSellerUnread}`,
    })
    .where(eq(conversationsTable.id, conversationId));
}

export async function clearUnreadForReader(conversationId: string, readerId: string) {
  const p = await findParticipants(conversationId);
  if (!p) return;

  if (readerId === p.buyerId) {
    await db
      .update(conversationsTable)
      .set({
        buyerUnreadCount: 0,
        unreadCount: sql`${conversationsTable.sellerUnreadCount}`,
      })
      .where(eq(conversationsTable.id, conversationId));
  } else if (readerId === p.sellerId) {
    await db
      .update(conversationsTable)
      .set({
        sellerUnreadCount: 0,
        unreadCount: sql`${conversationsTable.buyerUnreadCount}`,
      })
      .where(eq(conversationsTable.id, conversationId));
  }
}

export async function getUnreadCountForUser(conversationId: string, userId: string) {
  const [conv] = await db
    .select({
      buyerId: conversationsTable.buyerId,
      sellerId: conversationsTable.sellerId,
      buyerUnreadCount: conversationsTable.buyerUnreadCount,
      sellerUnreadCount: conversationsTable.sellerUnreadCount,
    })
    .from(conversationsTable)
    .where(eq(conversationsTable.id, conversationId))
    .limit(1);
  if (!conv) return null;
  if (conv.buyerId === userId) return conv.buyerUnreadCount;
  if (conv.sellerId === userId) return conv.sellerUnreadCount;
  return null;
}
