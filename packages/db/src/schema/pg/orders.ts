import { pgTable, uuid, varchar, text, integer, timestamp, numeric, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

import { itemsTable } from "./items";
import { usersTable } from "./users";

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
  deliveryAddress: jsonb("delivery_address").$type<{
    name: string;
    city: string;
    phone: string;
    line1: string;
  } | null>(),
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
