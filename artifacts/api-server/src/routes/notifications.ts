import { Router, type IRouter } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import * as notificationsService from "../services/notifications";

const router: IRouter = Router();

router.get(
  "/notifications",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await notificationsService.listNotifications(req.user!.id));
  }),
);

router.patch(
  "/notifications/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = z.string().uuid().parse(req.params.id);
    const row = await notificationsService.markNotificationRead(id, req.user!.id);
    res.json(row);
  }),
);

router.post(
  "/notifications/mark-all-read",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await notificationsService.markAllNotificationsRead(req.user!.id));
  }),
);

export default router;
