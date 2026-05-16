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
});
