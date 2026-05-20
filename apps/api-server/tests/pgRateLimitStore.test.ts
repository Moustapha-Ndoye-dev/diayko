/**
 * Tests for PgRateLimitStore — verifies that anti-spam counters persist
 * across simulated server restarts and that 429 is triggered at the correct
 * threshold whether or not the process was restarted since the window opened.
 *
 * Strategy:
 *  - Unit tests call store.increment / decrement / resetKey directly against
 *    the test DB to confirm the SQL semantics.
 *  - Persistence tests create a first store instance, accumulate hits, then
 *    create a fresh instance for the same namespace (simulating a restart).
 *    The fresh instance must inherit the existing counters.
 *  - Integration tests mount a real express-rate-limit middleware backed by
 *    PgRateLimitStore to confirm end-to-end 429 behaviour and restart safety.
 */
import { describe, it, expect, beforeEach } from "vitest";
import express from "express";
import helmet from "helmet";
import request from "supertest";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { resolveDbDialect, db, pool } from "@workspace/db";
import { rateLimitsTable } from "@workspace/db/schema";
import { logger } from "../src/lib/logger";
import { PgRateLimitStore } from "../src/lib/pgRateLimitStore";

const pgDescribe = resolveDbDialect() === "postgresql" ? describe : describe.skip;

const WINDOW_MS = 60 * 1000;

async function clearRateLimits(): Promise<void> {
  await pool.query("TRUNCATE TABLE rate_limits RESTART IDENTITY CASCADE");
}

/**
 * Build a minimal Express app whose single GET /test route is protected by
 * a PgRateLimitStore with the given namespace and request limit.
 *
 * Requests are keyed by the X-Test-Key header so tests can simulate distinct
 * clients without depending on supertest's IP assignment.
 */
function buildAppWithPgStore(namespace: string, limit: number) {
  const store = new PgRateLimitStore(namespace);
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(pinoHttp({ logger }));
  const limiter = rateLimit({
    windowMs: WINDOW_MS,
    limit,
    store,
    keyGenerator: (req) =>
      (req.headers["x-test-key"] as string | undefined) ?? req.ip ?? "unknown",
    handler: (_req, res) =>
      res.status(429).json({ error: "Trop de requêtes" }),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    // The key generator always prefers the test header; the IP fallback is
    // intentional and IPv6-safe in this test context.
    validate: { keyGeneratorIpFallback: false },
  });
  app.get("/test", limiter, (_req, res) => res.json({ ok: true }));
  return app;
}

// ── Unit tests ────────────────────────────────────────────────────────────────

pgDescribe("PgRateLimitStore — unit: increment", () => {
  beforeEach(clearRateLimits);

  it("returns totalHits = 1 on the first call", async () => {
    const store = new PgRateLimitStore("u_inc");
    const r = await store.increment("k1");
    expect(r.totalHits).toBe(1);
  });

  it("increments sequentially for the same key", async () => {
    const store = new PgRateLimitStore("u_inc");
    await store.increment("k2");
    await store.increment("k2");
    const r = await store.increment("k2");
    expect(r.totalHits).toBe(3);
  });

  it("counts different keys independently", async () => {
    const store = new PgRateLimitStore("u_inc");
    await store.increment("ka");
    await store.increment("ka");
    const ra = await store.increment("ka");
    const rb = await store.increment("kb");
    expect(ra.totalHits).toBe(3);
    expect(rb.totalHits).toBe(1);
  });

  it("resets the counter to 1 when the stored window has already expired", async () => {
    await db.insert(rateLimitsTable).values({
      key: "u_inc:expired",
      hits: 99,
      resetTime: new Date(Date.now() - 5_000),
    });
    const store = new PgRateLimitStore("u_inc");
    const r = await store.increment("expired");
    expect(r.totalHits).toBe(1);
  });

  it("returns a resetTime in the future", async () => {
    const store = new PgRateLimitStore("u_inc");
    const before = new Date();
    const r = await store.increment("k_time");
    expect(r.resetTime.getTime()).toBeGreaterThan(before.getTime());
  });
});

pgDescribe("PgRateLimitStore — unit: decrement & resetKey", () => {
  beforeEach(clearRateLimits);

  it("decrements an existing counter by 1", async () => {
    const store = new PgRateLimitStore("u_dec");
    await store.increment("d1");
    await store.increment("d1");
    await store.decrement("d1");
    const r = await store.increment("d1");
    expect(r.totalHits).toBe(2);
  });

  it("never decrements below 0", async () => {
    const store = new PgRateLimitStore("u_dec");
    await store.increment("d2");
    await store.decrement("d2");
    await store.decrement("d2");
    const r = await store.increment("d2");
    expect(r.totalHits).toBe(1);
  });

  it("resetKey causes the next increment to start from 1", async () => {
    const store = new PgRateLimitStore("u_reset");
    await store.increment("r1");
    await store.increment("r1");
    await store.resetKey("r1");
    const r = await store.increment("r1");
    expect(r.totalHits).toBe(1);
  });

  it("resetAll clears only rows belonging to this namespace", async () => {
    const storeA = new PgRateLimitStore("ns_a");
    const storeB = new PgRateLimitStore("ns_b");
    await storeA.increment("shared_key");
    await storeB.increment("shared_key");
    await storeA.resetAll();
    const rA = await storeA.increment("shared_key");
    const rB = await storeB.increment("shared_key");
    expect(rA.totalHits).toBe(1);
    expect(rB.totalHits).toBe(2);
  });
});

// ── Persistence across simulated restarts ─────────────────────────────────────

pgDescribe("PgRateLimitStore — persistence across simulated restarts", () => {
  beforeEach(clearRateLimits);

  it("a new store instance inherits counters accumulated before the restart", async () => {
    const ns = "restart_1";

    const preRestart = new PgRateLimitStore(ns);
    await preRestart.increment("user:alice");
    await preRestart.increment("user:alice");

    const postRestart = new PgRateLimitStore(ns);
    const r = await postRestart.increment("user:alice");

    expect(r.totalHits).toBe(3);
  });

  it("multiple keys each survive the restart independently", async () => {
    const ns = "restart_2";

    const before = new PgRateLimitStore(ns);
    await before.increment("ip:1.1.1.1");
    await before.increment("ip:1.1.1.1");
    await before.increment("ip:2.2.2.2");

    const after = new PgRateLimitStore(ns);
    const r1 = await after.increment("ip:1.1.1.1");
    const r2 = await after.increment("ip:2.2.2.2");

    expect(r1.totalHits).toBe(3);
    expect(r2.totalHits).toBe(2);
  });

  it("expired rows are not carried over after a restart", async () => {
    const ns = "restart_exp";

    await db.insert(rateLimitsTable).values({
      key: `${ns}:ip:old`,
      hits: 50,
      resetTime: new Date(Date.now() - 1_000),
    });

    const postRestart = new PgRateLimitStore(ns);
    const r = await postRestart.increment("ip:old");

    expect(r.totalHits).toBe(1);
  });
});

// ── Express integration: 429 threshold with PgRateLimitStore ──────────────────

pgDescribe("PgRateLimitStore — Express integration: 429 at threshold", () => {
  beforeEach(clearRateLimits);

  it("allows requests up to the limit then blocks with 429", async () => {
    const app = buildAppWithPgStore("ex_limit_1", 3);
    const key = "client-A";

    for (let i = 0; i < 3; i++) {
      const res = await request(app).get("/test").set("X-Test-Key", key);
      expect(res.status).toBe(200);
    }

    const blocked = await request(app).get("/test").set("X-Test-Key", key);
    expect(blocked.status).toBe(429);
    expect(blocked.body).toHaveProperty("error");
  });

  it("different keys are counted independently", async () => {
    const app = buildAppWithPgStore("ex_limit_2", 2);

    await request(app).get("/test").set("X-Test-Key", "clientX");
    await request(app).get("/test").set("X-Test-Key", "clientX");

    const blockedX = await request(app).get("/test").set("X-Test-Key", "clientX");
    expect(blockedX.status).toBe(429);

    const okY = await request(app).get("/test").set("X-Test-Key", "clientY");
    expect(okY.status).toBe(200);
  });

  it("RateLimit-* headers are emitted by the middleware", async () => {
    const app = buildAppWithPgStore("ex_headers", 5);

    const res = await request(app).get("/test").set("X-Test-Key", "h-client");
    expect(res.status).toBe(200);
    expect(res.headers).toHaveProperty("ratelimit");
    expect(res.headers).toHaveProperty("ratelimit-policy");
  });
});

// ── Express integration: restart-safe counter persistence ─────────────────────

pgDescribe("PgRateLimitStore — Express integration: counter persistence survives restart", () => {
  beforeEach(clearRateLimits);

  it("a new app instance respects pre-existing DB counters from the previous instance", async () => {
    const ns = "ex_restart_1";
    const limit = 3;
    const key = "user:bob";

    const app1 = buildAppWithPgStore(ns, limit);
    await request(app1).get("/test").set("X-Test-Key", key);
    await request(app1).get("/test").set("X-Test-Key", key);

    const app2 = buildAppWithPgStore(ns, limit);
    const third = await request(app2).get("/test").set("X-Test-Key", key);
    expect(third.status).toBe(200);

    const fourth = await request(app2).get("/test").set("X-Test-Key", key);
    expect(fourth.status).toBe(429);
  });

  it("counters exhausted before restart trigger 429 on the first request after restart", async () => {
    const ns = "ex_restart_2";
    const limit = 2;
    const key = "ip:203.0.113.1";

    const app1 = buildAppWithPgStore(ns, limit);
    await request(app1).get("/test").set("X-Test-Key", key);
    await request(app1).get("/test").set("X-Test-Key", key);

    const app2 = buildAppWithPgStore(ns, limit);
    const blocked = await request(app2).get("/test").set("X-Test-Key", key);
    expect(blocked.status).toBe(429);
  });

  it("a client who has not yet hit the limit is not blocked after restart", async () => {
    const ns = "ex_restart_3";
    const limit = 5;
    const key = "user:carol";

    const app1 = buildAppWithPgStore(ns, limit);
    for (let i = 0; i < 3; i++) {
      await request(app1).get("/test").set("X-Test-Key", key);
    }

    const app2 = buildAppWithPgStore(ns, limit);
    const res = await request(app2).get("/test").set("X-Test-Key", key);
    expect(res.status).toBe(200);
  });
});
