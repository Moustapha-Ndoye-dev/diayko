import { Router, type IRouter } from "express";
import { z } from "zod";
import { orderStatus, paymentMethods, carriers } from "@workspace/db/schema";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import { orderCreateRateLimit } from "../middlewares/rateLimiter.js";
import * as service from "../services/orders";

const router: IRouter = Router();

const idParams = z.object({ id: z.string().uuid() });

const listQuery = z.object({
  status: z.enum(orderStatus).optional(),
  role: z.enum(["buyer", "seller", "any"]).default("any"),
});

const createBody = z.object({
  itemId: z.string().uuid(),
  paymentMethod: z.enum(paymentMethods),
  carrier: z.enum(carriers).optional(),
});

const updateStatusBody = z.object({ status: z.enum(orderStatus) });

router.get(
  "/orders",
  requireAuth,
  asyncHandler(async (req, res) => {
    const opts = listQuery.parse(req.query);
    res.json(await service.listOrders(req.user!.id, opts));
  }),
);

router.get(
  "/orders/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = idParams.parse(req.params);
    res.json(await service.getOrderDetail(id, req.user!.id));
  }),
);

router.post(
  "/orders",
  orderCreateRateLimit,
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = createBody.parse(req.body);
    const order = await service.createOrder(req.user!.id, data);
    res.status(201).json(order);
  }),
);

router.patch(
  "/orders/:id/status",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = idParams.parse(req.params);
    const { status } = updateStatusBody.parse(req.body);
    const updated = await service.updateOrderStatus(id, req.user!.id, status);
    res.json(updated);
  }),
);

export default router;
