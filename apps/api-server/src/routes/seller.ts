import { Router, type IRouter } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import * as itemsService from "../services/items";
import * as ordersService from "../services/orders";

const router: IRouter = Router();

router.get(
  "/seller/stats",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await itemsService.getSellerStats(req.user!.id));
  }),
);

router.get(
  "/me/sales",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await ordersService.listOrders(req.user!.id, { role: "seller" }));
  }),
);

export default router;
