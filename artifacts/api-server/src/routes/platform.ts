import { Router, type IRouter } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import { paymentMethods } from "@workspace/db/schema";
import * as ordersService from "../services/orders";
import * as platformService from "../services/platform";
import * as itemsRepo from "../repos/items";
import * as supportRepo from "../repos/supportTickets";
import { HttpError } from "../middlewares/errorHandler";

const router: IRouter = Router();

router.get("/promotions", (_req, res) => {
  res.json(platformService.listPromotions());
});

router.get(
  "/promotions/:id",
  asyncHandler(async (req, res) => {
    const promo = platformService.getPromotion(String(req.params.id));
    if (!promo) {
      res.status(404).json({ error: "Promotion not found" });
      return;
    }
    res.json(promo);
  }),
);

router.get("/help/articles", (_req, res) => {
  res.json(platformService.listHelpArticles());
});

router.post(
  "/checkout/quote",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        itemId: z.string().uuid(),
        paymentMethod: z.enum(paymentMethods),
      })
      .parse(req.body);
    const item = await itemsRepo.findByIdWithSeller(body.itemId);
    if (!item) throw new HttpError(404, "Item not found");
    res.json(ordersService.quoteCheckout(item.items.price, body.paymentMethod));
  }),
);

router.post(
  "/support/tickets",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        subject: z.string().min(1).max(200),
        message: z.string().min(1).max(5000),
      })
      .parse(req.body);
    const ticket = await supportRepo.createTicket({
      userId: req.user!.id,
      subject: body.subject,
      message: body.message,
    });
    if (!ticket) throw new HttpError(500, "Failed to create ticket");
    res.status(201).json(ticket);
  }),
);

export default router;
