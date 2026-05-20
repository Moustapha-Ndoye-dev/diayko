import { db, pool } from "@workspace/db";
import { usersTable, itemsTable, itemImagesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { signAccessToken, signRefreshToken } from "../../src/lib/jwtAuth";

/**
 * Wipes all rows in dependency-safe order. Run before every test to
 * guarantee deterministic state — the integration suite shares one DB.
 */
export async function resetDb() {
  await pool.query(`
    TRUNCATE TABLE
      conversation_reports,
      wallet_withdrawals,
      wallets,
      notifications,
      auth_tokens,
      support_tickets,
      reviews,
      sessions,
      rate_limits,
      order_events,
      orders,
      likes,
      messages,
      conversations,
      item_images,
      items,
      users
    RESTART IDENTITY CASCADE
  `);
}

export async function makeUser(
  name = "Test User",
  overrides: Partial<typeof usersTable.$inferInsert> = {},
) {
  const [u] = await db
    .insert(usersTable)
    .values({
      id: randomUUID(),
      name,
      role: "user",
      tokenVersion: 0,
      ...overrides,
    })
    .returning();
  if (!u) throw new Error("Failed to create user");
  return u;
}

export async function makeItem(sellerId: string, overrides: Partial<typeof itemsTable.$inferInsert> = {}) {
  const [item] = await db
    .insert(itemsTable)
    .values({
      title: "Test item",
      brand: "TestBrand",
      price: "10000",
      size: "M",
      condition: "Good",
      category: "women",
      description: "An item for testing.",
      sellerId,
      ...overrides,
    })
    .returning();
  if (!item) throw new Error("Failed to create item");
  await db.insert(itemImagesTable).values({
    itemId: item.id,
    url: "https://example.com/img.jpg",
    position: 0,
  });
  return item;
}

/** Returns JWT access token for Authorization header integration tests. */
export async function makeSession(userId: string): Promise<string> {
  const [row] = await db
    .select({ tv: usersTable.tokenVersion })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  const tv = row?.tokenVersion ?? 0;
  return signAccessToken(userId, tv);
}

/** JWT refresh token for `/api/auth/refresh` integration tests. */
export async function makeRefreshToken(userId: string): Promise<string> {
  const [row] = await db
    .select({ tv: usersTable.tokenVersion })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  const tv = row?.tokenVersion ?? 0;
  return signRefreshToken(userId, tv);
}

export function bearer(token: string): string {
  return `Bearer ${token}`;
}
