import { pgTable, varchar, integer, timestamp, index } from "drizzle-orm/pg-core";

export const rateLimitsTable = pgTable(
  "rate_limits",
  {
    key: varchar("key").primaryKey(),
    hits: integer("hits").notNull().default(0),
    resetTime: timestamp("reset_time").notNull(),
  },
  (table) => [index("IDX_rate_limits_reset_time").on(table.resetTime)],
);
