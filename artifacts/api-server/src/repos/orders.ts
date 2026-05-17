import { db } from "@workspace/db";
import {
  ordersTable,
  orderEventsTable,
  itemsTable,
  itemImagesTable,
  usersTable,
} from "@workspace/db/schema";
import { eq, and, or, desc, sql, inArray } from "drizzle-orm";

export type Order = typeof ordersTable.$inferSelect;
export type OrderStatus = Order["status"];
export type PaymentMethod = Order["paymentMethod"];
export type Carrier = NonNullable<Order["carrier"]>;

export async function listForUser(
  userId: string,
  opts: { status?: OrderStatus; role: "buyer" | "seller" | "any" },
) {
  const roleFilter =
    opts.role === "buyer"
      ? eq(ordersTable.buyerId, userId)
      : opts.role === "seller"
        ? eq(ordersTable.sellerId, userId)
        : or(eq(ordersTable.buyerId, userId), eq(ordersTable.sellerId, userId));

  const where = opts.status ? and(roleFilter, eq(ordersTable.status, opts.status)) : roleFilter;

  const rows = await db
    .select({ order: ordersTable, item: itemsTable })
    .from(ordersTable)
    .innerJoin(itemsTable, eq(ordersTable.itemId, itemsTable.id))
    .where(where)
    .orderBy(desc(ordersTable.createdAt));

  if (rows.length === 0) return [];

  const itemIds = rows.map((r) => r.item.id);
  const imgs = await db
    .select()
    .from(itemImagesTable)
    .where(inArray(itemImagesTable.itemId, itemIds))
    .orderBy(itemImagesTable.position);

  const imgByItem: Record<string, string[]> = {};
  for (const img of imgs) {
    if (!imgByItem[img.itemId]) imgByItem[img.itemId] = [];
    imgByItem[img.itemId]!.push(img.url);
  }

  return rows.map((r) => ({
    ...r.order,
    item: { ...r.item, images: imgByItem[r.item.id] ?? [] },
  }));
}

export async function findDetail(orderId: string) {
  const rows = await db
    .select({ order: ordersTable, item: itemsTable, seller: usersTable })
    .from(ordersTable)
    .innerJoin(itemsTable, eq(ordersTable.itemId, itemsTable.id))
    .innerJoin(usersTable, eq(ordersTable.sellerId, usersTable.id))
    .where(eq(ordersTable.id, orderId))
    .limit(1);
  if (rows.length === 0) return null;
  const row = rows[0]!;

  const [images, events] = await Promise.all([
    db
      .select()
      .from(itemImagesTable)
      .where(eq(itemImagesTable.itemId, row.item.id))
      .orderBy(itemImagesTable.position),
    db
      .select()
      .from(orderEventsTable)
      .where(eq(orderEventsTable.orderId, orderId))
      .orderBy(orderEventsTable.position),
  ]);

  return {
    ...row.order,
    item: { ...row.item, images: images.map((i) => i.url) },
    seller: row.seller,
    events,
  };
}

export async function findItemForPurchase(itemId: string) {
  const [item] = await db
    .select()
    .from(itemsTable)
    .where(eq(itemsTable.id, itemId))
    .limit(1);
  return item ?? null;
}

export async function findById(orderId: string): Promise<Order | null> {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);
  return order ?? null;
}

export async function createOrderWithTimeline(data: {
  buyerId: string;
  sellerId: string;
  itemId: string;
  totalPrice: string;
  paymentMethod: PaymentMethod;
  carrier: Carrier;
  trackingId: string;
  eta: string;
  steps: string[];
}): Promise<Order> {
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(ordersTable)
      .values({
        buyerId: data.buyerId,
        sellerId: data.sellerId,
        itemId: data.itemId,
        totalPrice: data.totalPrice,
        status: "processing",
        paymentMethod: data.paymentMethod,
        carrier: data.carrier,
        trackingId: data.trackingId,
        eta: data.eta,
      })
      .returning();

    if (!created) throw new Error("Failed to create order");

    await tx.insert(orderEventsTable).values(
      data.steps.map((label, position) => ({
        orderId: created.id,
        label,
        position,
        done: position === 0,
        occurredAt: position === 0 ? new Date() : null,
      })),
    );
    return created;
  });
}

export async function updateStatusWithTimeline(
  orderId: string,
  status: OrderStatus,
  stepIndex: number | undefined,
): Promise<Order | null> {
  return db.transaction(async (tx) => {
    const [row] = await tx
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, orderId))
      .returning();
    if (!row) return null;

    if (stepIndex !== undefined && stepIndex >= 0) {
      await tx
        .update(orderEventsTable)
        .set({ done: true, occurredAt: new Date() })
        .where(
          and(
            eq(orderEventsTable.orderId, orderId),
            sql`${orderEventsTable.position} <= ${stepIndex}`,
            eq(orderEventsTable.done, false),
          ),
        );
    }
    return row;
  });
}
