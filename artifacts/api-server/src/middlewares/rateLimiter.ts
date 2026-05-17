import rateLimit, { ipKeyGenerator, type Options } from "express-rate-limit";
import type { Request, Response } from "express";
import { PgRateLimitStore } from "../lib/pgRateLimitStore";

function isAuthed(req: Request): boolean {
  return Boolean(req.isAuthenticated?.() && req.user?.id);
}

/**
 * Keys requests by the authenticated user ID when available, and falls back
 * to the request IP for anonymous traffic. Binding the counter to the user
 * ID prevents an authenticated attacker from bypassing the limit by rotating
 * IP addresses (mobile networks, proxies, VPNs, etc.).
 */
function keyByUserOrIp(req: Request): string {
  if (isAuthed(req)) {
    return `user:${req.user!.id}`;
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
      authenticated: isAuthed(req),
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

type TieredLimitOverrides = Omit<Partial<Options>, "limit" | "keyGenerator" | "handler" | "store"> & {
  message: string;
  /** Max requests per window for authenticated users (keyed by user ID). */
  authenticatedLimit: number;
  /**
   * Max requests per window for anonymous traffic (keyed by IP).
   * Typically lower than `authenticatedLimit` because anonymous traffic on
   * sensitive endpoints is almost always abusive.
   */
  anonymousLimit: number;
};

export function makeRateLimit(namespace: string, overrides: TieredLimitOverrides) {
  const { authenticatedLimit, anonymousLimit, message, ...rest } = overrides;
  return rateLimit({
    windowMs: 60 * 1000,
    keyGenerator: keyByUserOrIp,
    handler: (req, res, next) => handler429(req, res, next, { message }),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: makeStore(namespace),
    ...rest,
    limit: (req) => (isAuthed(req) ? authenticatedLimit : anonymousLimit),
  });
}

export const authRateLimit = makeRateLimit("auth", {
  windowMs: 15 * 60 * 1000,
  authenticatedLimit: 30,
  anonymousLimit: 20,
  message: "Trop de tentatives d'authentification. Réessayez dans 15 minutes.",
});

export const conversationCreateRateLimit = makeRateLimit("conversation_create", {
  windowMs: 60 * 60 * 1000,
  authenticatedLimit: 30,
  anonymousLimit: 5,
  message: "Trop de nouvelles conversations créées. Réessayez dans 1 heure.",
});

export const messageSendRateLimit = makeRateLimit("message_send", {
  windowMs: 60 * 1000,
  authenticatedLimit: 30,
  anonymousLimit: 5,
  message: "Trop de messages envoyés. Réessayez dans 1 minute.",
});

export const likeRateLimit = makeRateLimit("like", {
  windowMs: 60 * 1000,
  authenticatedLimit: 60,
  anonymousLimit: 10,
  message: "Trop de likes. Réessayez dans 1 minute.",
});

export const orderCreateRateLimit = makeRateLimit("order_create", {
  windowMs: 60 * 60 * 1000,
  authenticatedLimit: 20,
  anonymousLimit: 3,
  message: "Trop de commandes créées. Réessayez dans 1 heure.",
});

export const itemCreateRateLimit = makeRateLimit("item_create", {
  windowMs: 60 * 60 * 1000,
  authenticatedLimit: 50,
  anonymousLimit: 5,
  message: "Trop d'annonces créées. Réessayez dans 1 heure.",
});
