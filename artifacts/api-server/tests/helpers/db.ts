import { db } from "@workspace/db";
import {
  usersTable,
  itemsTable,
  itemImagesTable,
  conversationsTable,
  messagesTable,
  likesTable,
  ordersTable,
  orderEventsTable,
} from "@workspace/db/schema";

/**
 * Wipes all rows in dependency-safe order. Run before every test to
 * guarantee deterministic state — the integration suite shares one DB.
 */
export async function resetDb() {
  await db.delete(orderEventsTable);
  await db.delete(ordersTable);
  await db.delete(likesTable);
  await db.delete(messagesTable);
  await db.delete(conversationsTable);
  await db.delete(itemImagesTable);
  await db.delete(itemsTable);
  await db.delete(usersTable);
}

export async function makeUser(name = "Test User", overrides: Partial<typeof usersTable.$inferInsert> = {}) {
  const [u] = await db
    .insert(usersTable)
    .values({ name, ...overrides })
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
