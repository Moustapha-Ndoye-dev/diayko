import { Router, type IRouter } from "express";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth, requireRole } from "../middlewares/authMiddleware";
import * as usersRepo from "../repos/users";

const router: IRouter = Router();

const sellerStatusSchema = z.enum(["none", "pending", "approved"]);

const patchSellerBody = z.object({
  sellerStatus: sellerStatusSchema,
});

router.post(
  "/admin/users/:id/seller-status",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const id = z.string().min(1).parse(req.params.id);
    const { sellerStatus } = patchSellerBody.parse(req.body);
    const user = await usersRepo.updateSellerStatus(id, sellerStatus);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ sellerStatus: user.sellerStatus });
  }),
);

router.get(
  "/admin/sellers",
  requireAuth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const status = z.enum(["none", "pending", "approved"]).parse(req.query.status ?? "pending");
    const sellers = await usersRepo.listBySellerStatus(status);
    res.json({ sellers });
  }),
);

export default router;
