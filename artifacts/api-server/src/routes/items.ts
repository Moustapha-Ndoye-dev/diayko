import { Router, type IRouter } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import { itemCreateRateLimit, likeRateLimit } from "../middlewares/rateLimiter.js";
import * as itemsService from "../services/items";

const router: IRouter = Router();

const idParams = z.object({ id: z.string().uuid() });

const listQuery = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  size: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

const createBody = z.object({
  title: z.string().min(2).max(200, "Title cannot exceed 200 characters"),
  brand: z.string().min(1),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional().nullable(),
  size: z.string().min(1),
  condition: z.enum(["New with tags", "Like new", "Good", "Fair"]),
  category: z.string().min(1),
  description: z.string().max(2000, "Description cannot exceed 2000 characters"),
  color: z.string().optional().nullable(),
  images: z.array(z.string()).min(1).max(10, "Cannot upload more than 10 images"),
});

router.get(
  "/items",
  asyncHandler(async (req, res) => {
    const filters = listQuery.parse(req.query);
    res.json(await itemsService.listItems(filters));
  }),
);

router.get(
  "/items/:id",
  asyncHandler(async (req, res) => {
    const { id } = idParams.parse(req.params);
    res.json(await itemsService.getItemDetail(id));
  }),
);

router.post(
  "/items",
  itemCreateRateLimit,
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = createBody.parse(req.body);
    const item = await itemsService.createItem(req.user!.id, data);
    res.status(201).json(item);
  }),
);

router.delete(
  "/items/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = idParams.parse(req.params);
    await itemsService.deleteItemAsOwner(id, req.user!.id);
    res.status(204).send();
  }),
);

router.post(
  "/items/:id/view",
  asyncHandler(async (req, res) => {
    const { id } = idParams.parse(req.params);
    res.json(await itemsService.recordView(id));
  }),
);

router.post(
  "/items/:id/like",
  likeRateLimit,
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = idParams.parse(req.params);
    res.json(await itemsService.toggleLike(req.user!.id, id));
  }),
);

export default router;
