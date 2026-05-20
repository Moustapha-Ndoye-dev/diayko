import { Router, type IRouter, type Request, type Response } from "express";
import { GetCurrentAuthUserResponse, LogoutMobileSessionResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { asyncHandler } from "../lib/asyncHandler";
import { requireAuth } from "../middlewares/authMiddleware";
import { authRateLimit } from "../middlewares/rateLimiter";
import * as usersRepo from "../repos/users";
import * as localAuthService from "../services/localAuth";

const router: IRouter = Router();

const registerBody = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
});

const loginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(72),
});

const refreshBody = z.object({
  refreshToken: z.string().min(1),
});

const forgotBody = z.object({ email: z.string().email() });
const resetBody = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(72),
});
const changePasswordBody = z.object({
  currentPassword: z.string().min(1).max(72),
  newPassword: z.string().min(8).max(72),
});
const verifyEmailBody = z.object({ token: z.string().min(1) });

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

router.post(
  "/auth/register",
  authRateLimit,
  asyncHandler(async (req, res) => {
    const body = registerBody.parse(req.body);
    const { user, accessToken, refreshToken } = await localAuthService.registerUser(body);
    res.status(201).json({
      accessToken,
      refreshToken,
      user: localAuthService.toAuthUser(user),
    });
  }),
);

router.post(
  "/auth/login",
  authRateLimit,
  asyncHandler(async (req, res) => {
    const body = loginBody.parse(req.body);
    const { user, accessToken, refreshToken } = await localAuthService.loginUser(
      body.email,
      body.password,
    );
    res.json({
      accessToken,
      refreshToken,
      user: localAuthService.toAuthUser(user),
    });
  }),
);

router.post(
  "/auth/refresh",
  asyncHandler(async (req, res) => {
    const body = refreshBody.parse(req.body);
    const tokens = await localAuthService.refreshTokens(body.refreshToken);
    res.json(tokens);
  }),
);

router.post(
  "/auth/password/forgot",
  authRateLimit,
  asyncHandler(async (req, res) => {
    const body = forgotBody.parse(req.body);
    const result = await localAuthService.requestPasswordReset(body.email);
    res.status(202).json(result);
  }),
);

router.post(
  "/auth/password/reset",
  authRateLimit,
  asyncHandler(async (req, res) => {
    const body = resetBody.parse(req.body);
    await localAuthService.resetPassword(body.token, body.password);
    res.json({ success: true });
  }),
);

router.post(
  "/auth/password/change",
  requireAuth,
  asyncHandler(async (req, res) => {
    const body = changePasswordBody.parse(req.body);
    await localAuthService.changePassword(
      req.user!.id,
      body.currentPassword,
      body.newPassword,
    );
    res.json({ success: true });
  }),
);

router.post(
  "/auth/email/verify",
  asyncHandler(async (req, res) => {
    const body = verifyEmailBody.parse(req.body);
    await localAuthService.verifyEmail(body.token);
    res.json({ success: true });
  }),
);

router.post("/auth/logout", requireAuth, async (req: Request, res: Response) => {
  await usersRepo.incrementTokenVersion(req.user!.id);
  res.json(LogoutMobileSessionResponse.parse({ success: true }));
});

router.post("/users/me/seller-access", requireAuth, async (req: Request, res: Response) => {
  await db
    .update(usersTable)
    .set({ sellerStatus: "pending", updatedAt: new Date() })
    .where(eq(usersTable.id, req.user!.id));

  res.json({ sellerStatus: "pending" });
});

router.post("/users/me/seller-access/reset", requireAuth, async (req: Request, res: Response) => {
  await db
    .update(usersTable)
    .set({ sellerStatus: "none", updatedAt: new Date() })
    .where(eq(usersTable.id, req.user!.id));

  res.json({ sellerStatus: "none" });
});

export default router;
