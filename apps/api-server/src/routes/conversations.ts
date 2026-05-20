import { Router, type IRouter } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import { conversationCreateRateLimit, messageSendRateLimit } from "../middlewares/rateLimiter";
import * as service from "../services/conversations";

const router: IRouter = Router();

const createBody = z.object({
  sellerId: z.string(),
  itemId: z.string().uuid().optional().nullable(),
  initialMessage: z
    .string()
    .max(2000, "Message cannot exceed 2000 characters")
    .optional(),
});

const sendMessageBody = z.object({
  text: z.string().min(1).max(2000, "Message cannot exceed 2000 characters"),
});

const messagesQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  before: z.string().uuid().optional(),
});

router.get(
  "/conversations",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await service.getInbox(req.user!.id));
  }),
);

router.post(
  "/conversations",
  conversationCreateRateLimit,
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = createBody.parse(req.body);
    const conv = await service.createConversation(req.user!.id, {
      sellerId: data.sellerId,
      itemId: data.itemId ?? null,
      initialMessage: data.initialMessage,
    });
    res.status(201).json(conv);
  }),
);

router.get(
  "/conversations/:id/messages",
  requireAuth,
  asyncHandler(async (req, res) => {
    const q = messagesQuery.parse(req.query);
    res.json(
      await service.getMessages(String(req.params.id), req.user!.id, {
        limit: q.limit,
        before: q.before,
      }),
    );
  }),
);

router.post(
  "/conversations/:id/messages",
  messageSendRateLimit,
  requireAuth,
  asyncHandler(async (req, res) => {
    const { text } = sendMessageBody.parse(req.body);
    const msg = await service.sendMessage(String(req.params.id), req.user!.id, text);
    res.status(201).json(msg);
  }),
);

router.patch(
  "/conversations/:id/read",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await service.markConversationRead(String(req.params.id), req.user!.id);
    res.json(result);
  }),
);

router.post(
  "/conversations/:id/report",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        reason: z.string().min(1),
        details: z.string().max(2000).optional().nullable(),
      })
      .parse(req.body);
    const report = await service.reportConversation(
      String(req.params.id),
      req.user!.id,
      body.reason,
      body.details ?? null,
    );
    res.status(201).json(report);
  }),
);

export default router;
