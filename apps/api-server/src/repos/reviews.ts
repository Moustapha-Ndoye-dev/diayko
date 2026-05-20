import { db } from "@workspace/db";
import { reviewsTable, ordersTable } from "@workspace/db/schema";
import { eq, desc, and, count } from "drizzle-orm";

export type ReviewRow = typeof reviewsTable.$inferSelect;

export async function findByOrderAndReviewer(orderId: string, reviewerId: string) {
  const [row] = await db
    .select()
    .from(reviewsTable)
    .where(
      and(
        eq(reviewsTable.orderId, orderId),
        eq(reviewsTable.reviewerId, reviewerId),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function insertReview(data: {
  orderId: string;
  reviewerId: string;
  rating: number;
  comment: string | null;
}): Promise<ReviewRow | null> {
  const [row] = await db.insert(reviewsTable).values(data).returning();
  return row ?? null;
}

export async function listForSeller(sellerUserId: string, page: number, limit: number) {
  const offset = (page - 1) * limit;

  const [countResult, rows] = await Promise.all([
    db
      .select({ count: count() })
      .from(reviewsTable)
      .innerJoin(ordersTable, eq(reviewsTable.orderId, ordersTable.id))
      .where(eq(ordersTable.sellerId, sellerUserId)),
    db
      .select({
        review: reviewsTable,
        orderId: ordersTable.id,
      })
      .from(reviewsTable)
      .innerJoin(ordersTable, eq(reviewsTable.orderId, ordersTable.id))
      .where(eq(ordersTable.sellerId, sellerUserId))
      .orderBy(desc(reviewsTable.createdAt))
      .limit(limit)
      .offset(offset),
  ]);

  return {
    reviews: rows.map((r) => r.review),
    total: countResult[0]?.count ?? 0,
  };
}
