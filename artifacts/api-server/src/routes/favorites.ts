import { Router, type IRouter } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import * as favoritesRepo from "../repos/favorites";

const router: IRouter = Router();

router.get(
  "/me/favorites",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(await favoritesRepo.listForUser(req.user!.id));
  }),
);

export default router;
