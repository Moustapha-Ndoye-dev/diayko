import rateLimit, { ipKeyGenerator, type Options } from "express-rate-limit";
import type { Request, Response } from "express";
import { PgRateLimitStore } from "../lib/pgRateLimitStore";

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

/**
 * Returns a PostgreSQL-backed store in production/development so that
 * counters survive server restarts and work across multiple instances.
 * Each limiter gets its own namespace so counters never bleed across routes
 * (e.g. hitting /login does not consume the like quota for the same IP).
 * Falls back to the default in-memory store during tests to keep them fast
 * and side-effect-free.
 */
function makeStore(namespace: string) {
  if (process.env.NODE_ENV === "test") {
    return undefined;
  }
  return new PgRateLimitStore(namespace);
}

export function makeRateLimit(
  namespace: string,
  overrides: Partial<Options> & { message: string },
) {
  return rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    keyGenerator: keyByUserOrIp,
    handler: handler429,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: makeStore(namespace),
    ...overrides,
  });
}

export const authRateLimit = makeRateLimit("auth", {
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: "Trop de tentatives d'authentification. Réessayez dans 15 minutes.",
});

export const conversationCreateRateLimit = makeRateLimit("conversation_create", {
  windowMs: 60 * 60 * 1000,
  limit: 30,
  message: "Trop de nouvelles conversations créées. Réessayez dans 1 heure.",
});

export const messageSendRateLimit = makeRateLimit("message_send", {
  windowMs: 60 * 1000,
  limit: 30,
  message: "Trop de messages envoyés. Réessayez dans 1 minute.",
});

export const likeRateLimit = makeRateLimit("like", {
  windowMs: 60 * 1000,
  limit: 60,
  message: "Trop de likes. Réessayez dans 1 minute.",
});

export const orderCreateRateLimit = makeRateLimit("order_create", {
  windowMs: 60 * 60 * 1000,
  limit: 20,
  message: "Trop de commandes créées. Réessayez dans 1 heure.",
});

export const itemCreateRateLimit = makeRateLimit("item_create", {
  windowMs: 60 * 60 * 1000,
  limit: 50,
  message: "Trop d'annonces créées. Réessayez dans 1 heure.",
});
