import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, bearer, makeItem, makeSession, makeRefreshToken } from "./helpers/db";
import { registerBody, loginBody } from "./helpers/authBodies";

describe("JWT auth endpoints", () => {
  beforeEach(resetDb);

  it("register → GET /auth/user includes role", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ ...registerBody("User@Example.com"), firstName: "M", lastName: "N" });
    expect(reg.status).toBe(201);
    expect(reg.body.user.role).toBe("user");

    const me = await request(app)
      .get("/api/auth/user")
      .set("Authorization", bearer(reg.body.accessToken));
    expect(me.status).toBe(200);
    expect(me.body.user?.email).toBe("user@example.com");
  });

  it("login returns fresh tokens for a registered user", async () => {
    const credentials = loginBody("login@example.com");
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ ...credentials, firstName: "Login", lastName: "User" });
    expect(reg.status).toBe(201);

    const login = await request(app).post("/api/auth/login").send(credentials);
    expect(login.status).toBe(200);
    expect(login.body.user.email).toBe(credentials.email);
    expect(typeof login.body.accessToken).toBe("string");
    expect(typeof login.body.refreshToken).toBe("string");

    const me = await request(app)
      .get("/api/auth/user")
      .set("Authorization", bearer(login.body.accessToken));
    expect(me.body.user?.id).toBe(reg.body.user.id);
  });

  it("refresh returns usable tokens while token version is valid", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send(registerBody("refresh@example.com"));
    expect(reg.status).toBe(201);

    const refreshed = await request(app)
      .post("/api/auth/refresh")
      .send({ refreshToken: reg.body.refreshToken });
    expect(refreshed.status).toBe(200);
    expect(typeof refreshed.body.accessToken).toBe("string");
    expect(typeof refreshed.body.refreshToken).toBe("string");

    const me = await request(app)
      .get("/api/auth/user")
      .set("Authorization", bearer(refreshed.body.accessToken));
    expect(me.body.user?.id).toBe(reg.body.user.id);
  });

  it("register rejects duplicate email addresses", async () => {
    const body = registerBody("dupe@example.com");
    const first = await request(app).post("/api/auth/register").send(body);
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/api/auth/register")
      .send({ ...body, email: "DUPE@example.com" });
    expect(second.status).toBe(409);
  });

  it("login rejects unknown email", async () => {
    const r = await request(app).post("/api/auth/login").send(loginBody("nope@example.com"));
    expect(r.status).toBe(401);
  });

  it("logout invalidates tokens (refresh rejected)", async () => {
    const reg = await request(app).post("/api/auth/register").send(registerBody("x@y.co"));
    expect(reg.status).toBe(201);
    const { accessToken } = reg.body;
    const rt = await makeRefreshToken(reg.body.user.id);

    const out = await request(app).post("/api/auth/logout").set("Authorization", bearer(accessToken));
    expect(out.status).toBe(200);

    const refreshAgain = await request(app).post("/api/auth/refresh").send({ refreshToken: rt });
    expect(refreshAgain.status).toBe(401);
  });

  it("non-admin cannot call admin seller-status", async () => {
    const u = await makeUser("Normie");
    const seller = await makeUser("Seller", { sellerStatus: "pending" });
    const tok = await makeSession(u.id);

    const res = await request(app)
      .post(`/api/admin/users/${seller.id}/seller-status`)
      .set("Authorization", bearer(tok))
      .send({ sellerStatus: "approved" });
    expect(res.status).toBe(403);
  });

  it("admin can approve seller status", async () => {
    const admin = await makeUser("Admin", { role: "admin" });
    const seller = await makeUser("Seller", { sellerStatus: "pending" });
    const adminTok = await makeSession(admin.id);

    const res = await request(app)
      .post(`/api/admin/users/${seller.id}/seller-status`)
      .set("Authorization", bearer(adminTok))
      .send({ sellerStatus: "approved" });
    expect(res.status).toBe(200);
    expect(res.body.sellerStatus).toBe("approved");
  });

  it("user can request then reset seller access", async () => {
    const user = await makeUser("Future seller");
    const tok = await makeSession(user.id);

    const requestAccess = await request(app)
      .post("/api/users/me/seller-access")
      .set("Authorization", bearer(tok));
    expect(requestAccess.status).toBe(200);
    expect(requestAccess.body.sellerStatus).toBe("pending");

    const pendingMe = await request(app)
      .get("/api/auth/user")
      .set("Authorization", bearer(tok));
    expect(pendingMe.body.user.sellerStatus).toBe("pending");

    const reset = await request(app)
      .post("/api/users/me/seller-access/reset")
      .set("Authorization", bearer(tok));
    expect(reset.status).toBe(200);
    expect(reset.body.sellerStatus).toBe("none");
  });

  it("PATCH /items/:id owner vs stranger", async () => {
    const owner = await makeUser("Owner");
    const other = await makeUser("Other");
    const item = await makeItem(owner.id, { title: "Before", brand: "B" });

    const own = await request(app)
      .patch(`/api/items/${item.id}`)
      .set("Authorization", bearer(await makeSession(owner.id)))
      .send({ title: "After" });
    expect(own.status).toBe(200);
    expect(own.body.title).toBe("After");

    const bad = await request(app)
      .patch(`/api/items/${item.id}`)
      .set("Authorization", bearer(await makeSession(other.id)))
      .send({ brand: "Hacked" });
    expect(bad.status).toBe(403);
  });
});
