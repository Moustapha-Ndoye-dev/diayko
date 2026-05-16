import { pgTable, varchar, text, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sellerStatusValues = ["none", "pending", "approved"] as const;
export type SellerStatus = typeof sellerStatusValues[number];

// (IMPORTANT) This table is used by Replit Auth — id is the Replit user ID (varchar, not UUID).
export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  name: text("name"),
  bio: text("bio"),
  rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("5.00"),
  reviewCount: integer("review_count").notNull().default(0),
  itemCount: integer("item_count").notNull().default(0),
  followersCount: integer("followers_count").notNull().default(0),
  followingCount: integer("following_count").notNull().default(0),
  verified: boolean("verified").notNull().default(false),
  sellerStatus: text("seller_status").notNull().default("none"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ createdAt: true, updatedAt: true });
export const selectUserSchema = createSelectSchema(usersTable);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
