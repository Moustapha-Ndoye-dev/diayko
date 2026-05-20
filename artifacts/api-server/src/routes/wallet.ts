import { Router, type IRouter } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import * as walletService from "../services/wallet";

const router: IRouter = Router();

router.get(
  "/wallet",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await walletService.getWallet(req.user!.id));
  }),
);

router.get(
  "/wallet/transactions",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await walletService.listTransactions(req.user!.id));
  }),
);

router.post(
  "/wallet/withdrawals",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        amount: z.number().positive(),
        method: z.string().min(1),
        phone: z.string().min(1),
      })
      .parse(req.body);
    const withdrawal = await walletService.requestWithdrawal(req.user!.id, body);
    res.status(201).json(withdrawal);
  }),
);

export default router;
