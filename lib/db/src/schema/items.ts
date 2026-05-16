import { pgTable, uuid, varchar, text, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const itemCondition = ["New with tags", "Like new", "Good", "Fair"] as const;

export const itemsTable = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  brand: text("brand").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  size: text("size").notNull(),
  condition: text("condition").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  color: text("color"),
  sellerId: varchar("seller_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  likesCount: integer("likes_count").notNull().default(0),
  viewsCount: integer("views_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const itemImagesTable = pgTable("item_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  itemId: uuid("item_id")
    .notNull()
    .references(() => itemsTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  position: integer("position").notNull().default(0),
});

export const insertItemSchema = createInsertSchema(itemsTable).omit({ id: true, createdAt: true, likesCount: true, viewsCount: true });
export const selectItemSchema = createSelectSchema(itemsTable);

export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof itemsTable.$inferSelect;
export type ItemImage = typeof itemImagesTable.$inferSelect;
