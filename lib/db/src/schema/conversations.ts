import { pgTable, uuid, varchar, text, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { usersTable } from "./users";
import { itemsTable } from "./items";

export const conversationsTable = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: varchar("buyer_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  sellerId: varchar("seller_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  itemId: uuid("item_id").references(() => itemsTable.id, { onDelete: "set null" }),
  unreadCount: integer("unread_count").notNull().default(0),
  lastMessage: text("last_message"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messagesTable = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => conversationsTable.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const likesTable = pgTable(
  "likes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: varchar("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => itemsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.userId, t.itemId)]
);

export const insertConversationSchema = createInsertSchema(conversationsTable).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });

export type Conversation = typeof conversationsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
export type Like = typeof likesTable.$inferSelect;
