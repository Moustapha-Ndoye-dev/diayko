import rateLimit, { ipKeyGenerator, type Options } from "express-rate-limit";
import type { Request, Response } from "express";

function keyByUserOrIp(req: Request): string {
  if (req.isAuthenticated?.() && req.user?.id) {
    return `user:${req.user.id}`;
  }
  const ip = req.ip ?? req.socket.remoteAddress ?? "unknown";
  return `ip:${ipKeyGenerator(ip)}`;
}

function handler429(
  req: Request,
  res: Response,
  _next: unknown,
  options: { message: string },
) {
  req.log.warn(
    {
      rateLimitKey: keyByUserOrIp(req),
      path: req.path,
      method: req.method,
    },
    "Rate limit exceeded — 429 returned",
  );
  res.status(429).json({ error: options.message });
}

export function makeRateLimit(overrides: Partial<Options> & { message: string }) {
  return rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    keyGenerator: keyByUserOrIp,
    handler: handler429,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ...overrides,
  });
}

export const authRateLimit = makeRateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: "Trop de tentatives d'authentification. Réessayez dans 15 minutes.",
});

export const conversationCreateRateLimit = makeRateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: "Trop de nouvelles conversations créées. Réessayez dans 1 heure.",
});

export const messageSendRateLimit = makeRateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  message: "Trop de messages envoyés. Réessayez dans 1 minute.",
});

export const likeRateLimit = makeRateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  message: "Trop de likes. Réessayez dans 1 minute.",
});

export const orderCreateRateLimit = makeRateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  message: "Trop de commandes créées. Réessayez dans 1 heure.",
});

export const itemCreateRateLimit = makeRateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 50,
  message: "Trop d'annonces créées. Réessayez dans 1 heure.",
});
