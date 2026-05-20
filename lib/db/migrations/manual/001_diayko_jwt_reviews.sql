-- Run once against Postgres (adapt if columns already exist).
-- Drizzle schema source of truth is packages/db/src/schema/*

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "password_hash" varchar,
  ADD COLUMN IF NOT EXISTS "role" varchar NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS "token_version" integer NOT NULL DEFAULT 0;

UPDATE "users" SET "role" = 'user' WHERE "role" IS NULL;

ALTER TABLE "conversations"
  ADD COLUMN IF NOT EXISTS "buyer_unread_count" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "seller_unread_count" integer NOT NULL DEFAULT 0;

UPDATE "conversations"
SET "buyer_unread_count" = GREATEST("unread_count", 0),
    "seller_unread_count" = 0
WHERE "buyer_unread_count" = 0 AND "seller_unread_count" = 0 AND "unread_count" <> 0;

CREATE TABLE IF NOT EXISTS "reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
  "reviewer_id" varchar NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "rating" integer NOT NULL,
  "comment" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "reviews_order_reviewer_uidx" UNIQUE ("order_id", "reviewer_id")
);
