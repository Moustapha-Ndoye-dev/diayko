import { db } from "@workspace/db";
import {
  conversationsTable,
  messagesTable,
  usersTable,
  itemsTable,
  itemImagesTable,
} from "@workspace/db/schema";
import { eq, or, desc, sql, inArray } from "drizzle-orm";

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
    if (itemsById[img.itemId]) itemsById[img.itemId]!.images.push(img.url);
  }

  return convs.map((conv) => {
    const otherUserId = conv.buyerId === userId ? conv.sellerId : conv.buyerId;
    return {
      ...conv,
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

export async function listMessages(conversationId: string): Promise<Message[]> {
  return db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, conversationId))
    .orderBy(messagesTable.createdAt);
}

export async function insertMessage(data: {
  conversationId: string;
  senderId: string;
  text: string;
}): Promise<Message | null> {
  const [msg] = await db.insert(messagesTable).values(data).returning();
  return msg ?? null;
}

export async function touchLastMessage(conversationId: string, text: string) {
  await db
    .update(conversationsTable)
    .set({
      lastMessage: text,
      lastMessageAt: new Date(),
      unreadCount: sql`${conversationsTable.unreadCount} + 1`,
    })
    .where(eq(conversationsTable.id, conversationId));
}
