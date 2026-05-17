import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  ordersTable,
  orderEventsTable,
  itemsTable,
  itemImagesTable,
  usersTable,
  orderStatus,
  paymentMethods,
  carriers,
} from "@workspace/db/schema";
import { eq, and, or, desc, sql, inArray } from "drizzle-orm";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { HttpError } from "../middlewares/errorHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import { orderCreateRateLimit } from "../middlewares/rateLimiter.js";

const router: IRouter = Router();
const idParams = z.object({ id: z.string().uuid() });

const DEFAULT_STEPS = [
  "Commande confirmée",
  "Prise en charge par le vendeur",
  "En transit",
  "En cours de livraison",
  "Livré",
];

const listQuery = z.object({
  status: z.enum(orderStatus).optional(),
  role: z.enum(["buyer", "seller", "any"]).default("any"),
});

router.get(
  "/orders",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { status, role } = listQuery.parse(req.query);

    const roleFilter =
      role === "buyer"
        ? eq(ordersTable.buyerId, userId)
        : role === "seller"
          ? eq(ordersTable.sellerId, userId)
          : or(eq(ordersTable.buyerId, userId), eq(ordersTable.sellerId, userId));

    const where = status ? and(roleFilter, eq(ordersTable.status, status)) : roleFilter;

    const rows = await db
      .select({
        order: ordersTable,
        item: itemsTable,
      })
      .from(ordersTable)
      .innerJoin(itemsTable, eq(ordersTable.itemId, itemsTable.id))
      .where(where)
      .orderBy(desc(ordersTable.createdAt));

    if (rows.length === 0) {
      res.json({ orders: [] });
      return;
    }

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

    const orders = rows.map((r) => ({
      ...r.order,
      item: { ...r.item, images: imgByItem[r.item.id] ?? [] },
    }));

    res.json({ orders });
  }),
);

router.get(
  "/orders/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { id } = idParams.parse(req.params);
    const rows = await db
      .select({
        order: ordersTable,
        item: itemsTable,
        seller: usersTable,
      })
      .from(ordersTable)
      .innerJoin(itemsTable, eq(ordersTable.itemId, itemsTable.id))
      .innerJoin(usersTable, eq(ordersTable.sellerId, usersTable.id))
      .where(eq(ordersTable.id, id))
      .limit(1);

    if (rows.length === 0) throw new HttpError(404, "Order not found");
    const row = rows[0]!;
    if (row.order.buyerId !== userId && row.order.sellerId !== userId) {
      throw new HttpError(404, "Order not found");
    }

    const [images, events] = await Promise.all([
      db
        .select()
        .from(itemImagesTable)
        .where(eq(itemImagesTable.itemId, row.item.id))
        .orderBy(itemImagesTable.position),
      db
        .select()
        .from(orderEventsTable)
        .where(eq(orderEventsTable.orderId, id))
        .orderBy(orderEventsTable.position),
    ]);

    res.json({
      ...row.order,
      item: { ...row.item, images: images.map((i) => i.url) },
      seller: row.seller,
      events,
    });
  }),
);

const createBody = z.object({
  itemId: z.string().uuid(),
  paymentMethod: z.enum(paymentMethods),
  carrier: z.enum(carriers).optional(),
});

router.post(
  "/orders",
  orderCreateRateLimit,
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = createBody.parse(req.body);
    const buyerId = req.user!.id;

    const itemRows = await db
      .select()
      .from(itemsTable)
      .where(eq(itemsTable.id, data.itemId))
      .limit(1);
    const item = itemRows[0];
    if (!item) throw new HttpError(404, "Item not found");
    if (item.sellerId === buyerId) {
      throw new HttpError(400, "Cannot buy your own item");
    }

    const trackingId = `DK-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000 + 10000)}`;

    // Atomic: order + initial timeline must succeed together.
    const order = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(ordersTable)
        .values({
          buyerId,
          sellerId: item.sellerId,
          itemId: item.id,
          totalPrice: item.price,
          status: "processing",
          paymentMethod: data.paymentMethod,
          carrier: data.carrier ?? "Wave Express",
          trackingId,
          eta: "2-4 jours ouvrés",
        })
        .returning();

      if (!created) throw new HttpError(500, "Failed to create order");

      await tx.insert(orderEventsTable).values(
        DEFAULT_STEPS.map((label, position) => ({
          orderId: created.id,
          label,
          position,
          done: position === 0,
          occurredAt: position === 0 ? new Date() : null,
        })),
      );
      return created;
    });

    res.status(201).json(order);
  }),
);

const updateStatusBody = z.object({ status: z.enum(orderStatus) });

router.patch(
  "/orders/:id/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { id } = idParams.parse(req.params);
    const { status } = updateStatusBody.parse(req.body);

    const [existing] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id))
      .limit(1);
    if (!existing) throw new HttpError(404, "Order not found");
    if (existing.buyerId !== userId && existing.sellerId !== userId) {
      throw new HttpError(404, "Order not found");
    }

    // Atomic: status change + timeline updates must succeed together.
    const updated = await db.transaction(async (tx) => {
      const [row] = await tx
        .update(ordersTable)
        .set({ status })
        .where(eq(ordersTable.id, id))
        .returning();
      if (!row) throw new HttpError(404, "Order not found");

      // Mark events up to the status step as done. `occurredAt` is only set
      // for events that were not already done, so we preserve history.
      const stepIndexByStatus: Record<string, number> = {
        processing: 0,
        in_transit: 2,
        delivered: 4,
        cancelled: -1,
      };
      const stepIndex = stepIndexByStatus[status];
      if (stepIndex !== undefined && stepIndex >= 0) {
        await tx
          .update(orderEventsTable)
          .set({ done: true, occurredAt: new Date() })
          .where(
            and(
              eq(orderEventsTable.orderId, id),
              sql`${orderEventsTable.position} <= ${stepIndex}`,
              eq(orderEventsTable.done, false),
            ),
          );
      }
      return row;
    });

    res.json(updated);
  }),
);

export default router;
