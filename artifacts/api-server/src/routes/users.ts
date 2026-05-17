import { Router, type IRouter } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import { HttpError } from "../middlewares/errorHandler";
import * as usersService from "../services/users";
import * as itemsService from "../services/items";

const router: IRouter = Router();

const idParam = z.string().min(1);

const postProfileBody = z.object({
  bio: z.string().max(500).nullable(),
});

const patchProfileBody = z
  .object({
    name: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional().nullable(),
  })
  .refine((d) => d.name !== undefined || d.bio !== undefined, {
    message: "At least one of name or bio must be provided",
  });

const pageQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

router.post(
  "/users",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { bio } = postProfileBody.parse(req.body);
    const user = await usersService.updateProfile(req.user!.id, { bio });
    res.json(user);
  }),
);

router.get(
  "/users/:id",
  asyncHandler(async (req, res) => {
    if (!idParam.safeParse(req.params.id).success) {
      throw new HttpError(404, "User not found");
    }
    res.json(await usersService.getProfile(req.params.id));
  }),
);

router.patch(
  "/users/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    if (!idParam.safeParse(req.params.id).success) {
      throw new HttpError(404, "User not found");
    }
    if (req.params.id !== req.user!.id) {
      throw new HttpError(403, "Forbidden");
    }
    const fields = patchProfileBody.parse(req.body);
    res.json(await usersService.updateProfile(req.user!.id, fields));
  }),
);

router.get(
  "/users/:id/items",
  asyncHandler(async (req, res) => {
    if (!idParam.safeParse(req.params.id).success) {
      res.json({ items: [], total: 0, page: 1, limit: 20, hasMore: false });
      return;
    }
    const { page, limit } = pageQuery.parse(req.query);
    res.json(await itemsService.listForSeller(req.params.id, page, limit));
  }),
);

router.delete(
  "/users/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    await usersService.deleteAccount(req.user!.id);
    res.status(204).send();
  }),
);

export default router;
