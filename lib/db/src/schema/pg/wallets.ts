import { pgTable, uuid, varchar, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const walletsTable = pgTable("wallets", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  available: numeric("available", { precision: 12, scale: 2 }).notNull().default("0"),
  pending: numeric("pending", { precision: 12, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("XOF"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const walletWithdrawalsTable = pgTable("wallet_withdrawals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  method: text("method").notNull(),
  phone: text("phone").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
