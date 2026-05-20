import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, makeItem, makeSession, bearer } from "./helpers/db";

describe("Users API", () => {
  beforeEach(resetDb);

  it("POST /api/users updates the authenticated user's bio", async () => {
    const u = await makeUser("Aïssa Sow");
    const sid = await makeSession(u.id);
    const res = await request(app)
      .post("/api/users")
      .set("Authorization", bearer(sid))
      .send({ bio: "Bonjour" });
    expect(res.status).toBe(200);
    expect(res.body.bio).toBe("Bonjour");
  });

  it("PATCH /api/users/:id updates own public profile fields", async () => {
    const u = await makeUser("Old Name", { bio: "Ancienne bio", passwordHash: "secret" });
    const sid = await makeSession(u.id);

    const res = await request(app)
      .patch(`/api/users/${u.id}`)
      .set("Authorization", bearer(sid))
      .send({ name: "Nouveau Nom", bio: "Nouvelle bio" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Nouveau Nom");
    expect(res.body.bio).toBe("Nouvelle bio");
    expect(res.body.passwordHash).toBeUndefined();
  });

  it("PATCH /api/users/:id forbids editing another user", async () => {
    const owner = await makeUser("Owner");
    const other = await makeUser("Other");
    const sid = await makeSession(other.id);

    const res = await request(app)
      .patch(`/api/users/${owner.id}`)
      .set("Authorization", bearer(sid))
      .send({ name: "Hacked" });

    expect(res.status).toBe(403);
  });

  it("POST /api/users rejects unauthenticated requests", async () => {
    const res = await request(app).post("/api/users").send({ bio: "Salut" });
    expect(res.status).toBe(401);
  });

  it("GET /api/users/:id returns the user", async () => {
    const u = await makeUser("Mariama");
    const res = await request(app).get(`/api/users/${u.id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Mariama");
  });

  it("GET /api/users/:id returns 404 for unknown id", async () => {
    const res = await request(app).get("/api/users/11111111-1111-1111-1111-111111111111");
    expect(res.status).toBe(404);
  });

  it("GET /api/users/:id/items lists the user's items with pagination meta", async () => {
    const u = await makeUser("Vendeur");
    await makeItem(u.id, { title: "A" });
    await makeItem(u.id, { title: "B" });
    const res = await request(app).get(`/api/users/${u.id}/items`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.items).toHaveLength(2);
  });

  it("DELETE /api/users/me removes account and invalidates the bearer user", async () => {
    const u = await makeUser("Compte a supprimer");
    const sid = await makeSession(u.id);

    const deleted = await request(app)
      .delete("/api/users/me")
      .set("Authorization", bearer(sid));
    expect(deleted.status).toBe(204);

    const profile = await request(app).get(`/api/users/${u.id}`);
    expect(profile.status).toBe(404);

    const me = await request(app)
      .get("/api/auth/user")
      .set("Authorization", bearer(sid));
    expect(me.status).toBe(200);
    expect(me.body.user).toBeNull();
  });
});
