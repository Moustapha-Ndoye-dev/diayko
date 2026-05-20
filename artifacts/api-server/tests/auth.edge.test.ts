import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, bearer } from "./helpers/db";
import {
  registerBody,
  loginBody,
  SHORT_TEST_CREDENTIAL,
  WRONG_TEST_CREDENTIAL,
} from "./helpers/authBodies";

describe("Auth edge cases (integration)", () => {
  beforeEach(resetDb);

  it("register rejects password shorter than 8 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send(registerBody("short@example.com", SHORT_TEST_CREDENTIAL));
    expect(res.status).toBe(400);
  });

  it("login rejects wrong password for existing user", async () => {
    await request(app).post("/api/auth/register").send(registerBody("pw@example.com"));

    const res = await request(app)
      .post("/api/auth/login")
      .send(loginBody("pw@example.com", WRONG_TEST_CREDENTIAL));
    expect(res.status).toBe(401);
  });

  it("refresh rejects garbage token", async () => {
    const res = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: "not-a-valid-jwt" });
    expect(res.status).toBe(401);
  });

  it("logout requires authentication", async () => {
    const res = await request(app).post("/api/auth/logout");
    expect(res.status).toBe(401);
  });

  it("GET /api/auth/user without token returns null user", async () => {
    const res = await request(app).get("/api/auth/user");
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });

  it("seller-access endpoints require auth", async () => {
    const req = await request(app).post("/api/users/me/seller-access");
    expect(req.status).toBe(401);

    const reset = await request(app).post("/api/users/me/seller-access/reset");
    expect(reset.status).toBe(401);
  });

  it("refresh rejects token after manual version bump simulation", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send(registerBody("revoke@example.com"));
    const oldRefresh = reg.body.refreshToken;

    await request(app)
      .post("/api/auth/logout")
      .set("Authorization", bearer(reg.body.accessToken));

    const again = await request(app).post("/api/auth/refresh").send({ refreshToken: oldRefresh });
    expect(again.status).toBe(401);
  });
});
