import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("Health & maintenance", () => {
  afterEach(() => {
    delete process.env.MAINTENANCE_TOKEN;
  });

  it("GET /api/healthz returns ok", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("POST /api/maintenance/cleanup returns 403 when token env is unset", async () => {
    delete process.env.MAINTENANCE_TOKEN;
    const res = await request(app).post("/api/maintenance/cleanup");
    expect(res.status).toBe(403);
    expect(res.body.error).toContain("disabled");
  });

  it("POST /api/maintenance/cleanup rejects wrong token", async () => {
    process.env.MAINTENANCE_TOKEN = "secret-maintenance-token";
    const res = await request(app)
      .post("/api/maintenance/cleanup")
      .set("X-Maintenance-Token", "wrong");
    expect(res.status).toBe(401);
  });

  it("POST /api/maintenance/cleanup rejects token with different length", async () => {
    process.env.MAINTENANCE_TOKEN = "secret-maintenance-token";
    const res = await request(app)
      .post("/api/maintenance/cleanup")
      .set("X-Maintenance-Token", "secret-maintenance-token-extra");
    expect(res.status).toBe(401);
  });

  it("POST /api/maintenance/cleanup succeeds with valid token", async () => {
    process.env.MAINTENANCE_TOKEN = "secret-maintenance-token";
    const res = await request(app)
      .post("/api/maintenance/cleanup")
      .set("X-Maintenance-Token", "secret-maintenance-token");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.deleted).toBe("number");
  });
});
