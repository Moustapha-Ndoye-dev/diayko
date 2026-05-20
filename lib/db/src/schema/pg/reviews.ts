import { pgTable, uuid, varchar, integer, text, timestamp, unique } from "drizzle-orm/pg-core";

import { ordersTable } from "./orders";
import { usersTable } from "./users";

export const reviewsTable = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => ordersTable.id, { onDelete: "cascade" }),
    reviewerId: varchar("reviewer_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [unique().on(t.orderId, t.reviewerId)],
);

export type Review = typeof reviewsTable.$inferSelect;
