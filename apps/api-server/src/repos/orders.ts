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
  let roleFilter;
  if (opts.role === "buyer") {
    roleFilter = eq(ordersTable.buyerId, userId);
  } else if (opts.role === "seller") {
    roleFilter = eq(ordersTable.sellerId, userId);
  } else {
    roleFilter = or(eq(ordersTable.buyerId, userId), eq(ordersTable.sellerId, userId));
  }

  let where = roleFilter;
  if (opts.status) {
    where = and(roleFilter, eq(ordersTable.status, opts.status));
  }

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
    const urls = imgByItem[img.itemId] ?? [];
    urls.push(img.url);
    imgByItem[img.itemId] = urls;
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
  const row = rows[0];
  if (!row) return null;

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

export async function hasActiveOrderForItem(itemId: string) {
  const [row] = await db
    .select({ id: ordersTable.id })
    .from(ordersTable)
    .where(
      and(
        eq(ordersTable.itemId, itemId),
        inArray(ordersTable.status, ["processing", "in_transit"]),
      ),
    )
    .limit(1);
  return Boolean(row);
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
  deliveryAddress?: Order["deliveryAddress"];
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
        deliveryAddress: data.deliveryAddress ?? null,
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
