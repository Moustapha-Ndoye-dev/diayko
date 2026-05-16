import { pgTable, uuid, varchar, text, integer, timestamp, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { itemsTable } from "./items";

export const orderStatus = ["processing", "in_transit", "delivered", "cancelled"] as const;
export const paymentMethods = ["wave", "orange_money", "free_money"] as const;
export const carriers = ["Wave Express", "DHL Sénégal", "Sahel Logistique"] as const;

export const ordersTable = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  buyerId: varchar("buyer_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  sellerId: varchar("seller_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  itemId: uuid("item_id")
    .notNull()
    .references(() => itemsTable.id, { onDelete: "restrict" }),
  totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("processing"),
  paymentMethod: text("payment_method").notNull(),
  carrier: text("carrier"),
  trackingId: text("tracking_id"),
  eta: text("eta"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const orderEventsTable = pgTable("order_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => ordersTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  position: integer("position").notNull(),
  done: boolean("done").notNull().default(false),
  occurredAt: timestamp("occurred_at"),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export const insertOrderEventSchema = createInsertSchema(orderEventsTable).omit({ id: true });

export type Order = typeof ordersTable.$inferSelect;
export type OrderEvent = typeof orderEventsTable.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
