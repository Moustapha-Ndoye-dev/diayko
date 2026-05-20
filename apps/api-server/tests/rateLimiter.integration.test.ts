/**
 * Integration tests for rate limiting on real protected routes.
 * These tests use a lightweight express app that mounts real middleware
 * (pino-http, authMiddleware, requireAuth) with a low-limit rate limiter
 * to verify that 429 responses are properly formed and that the limiter
 * correctly interacts with session-based authentication.
 */
import { describe, it, expect, beforeEach } from "vitest";
import express from "express";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import request from "supertest";
import { logger } from "../src/lib/logger";
import { authMiddleware, requireAuth } from "../src/middlewares/authMiddleware";
import { makeRateLimit } from "../src/middlewares/rateLimiter";
import { resetDb, makeUser, makeItem, makeSession, bearer } from "./helpers/db";

function buildProtectedApp(limit: number) {
  const app = express();
  app.set("trust proxy", 1);
  app.use(pinoHttp({ logger }));
  app.use(cookieParser());
  app.use(express.json());
  app.use(authMiddleware);

  const limiter = makeRateLimit("test", {
    windowMs: 60 * 1000,
    authenticatedLimit: limit,
    anonymousLimit: limit,
    message: "Rate limit exceeded",
  });

  app.get(
    "/protected",
    limiter,
    requireAuth,
    async (req, res) => {
      res.json({ userId: (req as Express.Request & { user: { id: string } }).user.id });
    },
  );

  return app;
}

describe("Rate limiter — integration with auth middleware", () => {
  beforeEach(resetDb);

  it("allows authenticated requests below the limit", async () => {
    const user = await makeUser("Tester");
    const sid = await makeSession(user.id);
    const app = buildProtectedApp(3);

    for (let i = 0; i < 3; i++) {
      const res = await request(app)
        .get("/protected")
        .set("Authorization", bearer(sid));
      expect(res.status).toBe(200);
      expect(res.body.userId).toBe(user.id);
    }
  });

  it("returns 429 with a JSON error after the limit is exceeded", async () => {
    const user = await makeUser("Tester");
    const sid = await makeSession(user.id);
    const app = buildProtectedApp(2);

    await request(app).get("/protected").set("Authorization", bearer(sid));
    await request(app).get("/protected").set("Authorization", bearer(sid));

    const res = await request(app)
      .get("/protected")
      .set("Authorization", bearer(sid));
    expect(res.status).toBe(429);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
  });

  it("counts by user ID, not IP, for authenticated requests", async () => {
    const userA = await makeUser("User A");
    const userB = await makeUser("User B");
    const sidA = await makeSession(userA.id);
    const sidB = await makeSession(userB.id);
    const app = buildProtectedApp(1);

    const a1 = await request(app)
      .get("/protected")
      .set("Authorization", bearer(sidA));
    expect(a1.status).toBe(200);

    const a2 = await request(app)
      .get("/protected")
      .set("Authorization", bearer(sidA));
    expect(a2.status).toBe(429);

    const b1 = await request(app)
      .get("/protected")
      .set("Authorization", bearer(sidB));
    expect(b1.status).toBe(200);
  });
});

describe("Rate limiter — wiring on real /api/items/:id/like route", () => {
  beforeEach(resetDb);

  it("responds with 200 on a first like request (rate limit not yet exhausted)", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const sid = await makeSession(buyer.id);

    const { default: app } = await import("../src/app");
    const res = await request(app)
      .post(`/api/items/${item.id}/like`)
      .set("Authorization", bearer(sid));

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("liked");
    expect(res.body).toHaveProperty("likesCount");
    // draft-8 standard headers prove the rate limiter is wired to this route
    expect(res.headers).toHaveProperty("ratelimit");
    expect(res.headers).toHaveProperty("ratelimit-policy");
  });
});

describe("Rate limiter — wiring on real /api/conversations route", () => {
  beforeEach(resetDb);

  it("responds with 201 on first conversation create and emits RateLimit headers", async () => {
    const buyer = await makeUser("Buyer");
    const seller = await makeUser("Seller");
    const sidBuyer = await makeSession(buyer.id);

    const { default: app } = await import("../src/app");
    const res = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(sidBuyer))
      .send({ sellerId: seller.id, initialMessage: "Bonjour !" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    // RateLimit headers confirm conversationCreateRateLimit is applied
    expect(res.headers).toHaveProperty("ratelimit");
    expect(res.headers).toHaveProperty("ratelimit-policy");
  });

  it("returns 429 on conversations after limit exceeded (low-limit wrapper)", async () => {
    const buyer = await makeUser("Buyer");
    const seller = await makeUser("Seller");
    const sidBuyer = await makeSession(buyer.id);

    const app = express();
    app.set("trust proxy", 1);
    app.use(pinoHttp({ logger }));
    app.use(cookieParser());
    app.use(express.json());
    app.use(authMiddleware);

    const lowLimiter = makeRateLimit("test_conv", { windowMs: 60_000, authenticatedLimit: 2, anonymousLimit: 2, message: "Trop de conversations" });

    app.post("/api/conversations", lowLimiter, requireAuth, async (_req, res) => {
      res.status(201).json({ id: "fake-id" });
    });

    for (let i = 0; i < 2; i++) {
      const r = await request(app)
        .post("/api/conversations")
        .set("Authorization", bearer(sidBuyer))
        .send({ sellerId: seller.id });
      expect(r.status).toBe(201);
    }

    const blocked = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(sidBuyer))
      .send({ sellerId: seller.id });
    expect(blocked.status).toBe(429);
    expect(blocked.body).toHaveProperty("error");
  });
});

describe("Rate limiter — wiring on real /api/orders route", () => {
  beforeEach(resetDb);

  it("responds correctly on first order and emits RateLimit headers", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const sidBuyer = await makeSession(buyer.id);

    const { default: app } = await import("../src/app");
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(sidBuyer))
      .send({ itemId: item.id, paymentMethod: "wave", carrier: "Wave Express" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    // RateLimit headers confirm orderCreateRateLimit is applied
    expect(res.headers).toHaveProperty("ratelimit");
    expect(res.headers).toHaveProperty("ratelimit-policy");
  });

  it("returns 429 on orders after limit exceeded (low-limit wrapper)", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const sidBuyer = await makeSession(buyer.id);

    const app = express();
    app.set("trust proxy", 1);
    app.use(pinoHttp({ logger }));
    app.use(cookieParser());
    app.use(express.json());
    app.use(authMiddleware);

    const lowLimiter = makeRateLimit("test_order", { windowMs: 60_000, authenticatedLimit: 2, anonymousLimit: 2, message: "Trop de commandes" });

    app.post("/api/orders", lowLimiter, requireAuth, async (_req, res) => {
      res.status(201).json({ id: "fake-order-id" });
    });

    for (let i = 0; i < 2; i++) {
      const r = await request(app)
        .post("/api/orders")
        .set("Authorization", bearer(sidBuyer))
        .send({ itemId: item.id, paymentMethod: "card" });
      expect(r.status).toBe(201);
    }

    const blocked = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(sidBuyer))
      .send({ itemId: item.id, paymentMethod: "card" });
    expect(blocked.status).toBe(429);
    expect(blocked.body).toHaveProperty("error");
  });
});
