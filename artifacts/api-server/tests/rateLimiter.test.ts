import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import pinoHttp from "pino-http";
import { logger } from "../src/lib/logger";
import { makeRateLimit } from "../src/middlewares/rateLimiter";

function makeTestApp(limit: number) {
  const app = express();
  app.set("trust proxy", 1);
  app.use(pinoHttp({ logger }));
  const limiter = makeRateLimit({
    windowMs: 60 * 1000,
    limit,
    message: "Rate limit exceeded",
  });
  app.get("/test", limiter, (_req, res) => {
    res.json({ ok: true });
  });
  return app;
}

describe("Rate limiter middleware", () => {
  it("allows requests below the limit", async () => {
    const app = makeTestApp(3);
    for (let i = 0; i < 3; i++) {
      const res = await request(app).get("/test");
      expect(res.status).toBe(200);
    }
  });

  it("returns 429 after the limit is exceeded", async () => {
    const app = makeTestApp(3);
    for (let i = 0; i < 3; i++) {
      await request(app).get("/test");
    }
    const res = await request(app).get("/test");
    expect(res.status).toBe(429);
    expect(res.body.error).toBe("Rate limit exceeded");
  });

  it("returns a JSON error body on 429", async () => {
    const app = makeTestApp(1);
    await request(app).get("/test");
    const res = await request(app).get("/test");
    expect(res.status).toBe(429);
    expect(res.body).toHaveProperty("error");
    expect(typeof res.body.error).toBe("string");
  });

  it("uses separate counters for different IPs", async () => {
    const app = makeTestApp(2);
    for (let i = 0; i < 2; i++) {
      await request(app).get("/test").set("X-Forwarded-For", "1.2.3.4");
    }
    const blockedRes = await request(app)
      .get("/test")
      .set("X-Forwarded-For", "1.2.3.4");
    expect(blockedRes.status).toBe(429);

    const differentIpRes = await request(app)
      .get("/test")
      .set("X-Forwarded-For", "5.6.7.8");
    expect(differentIpRes.status).toBe(200);
  });
});
