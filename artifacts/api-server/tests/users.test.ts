import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, makeItem } from "./helpers/db";

describe("Users API", () => {
  beforeEach(resetDb);

  it("POST /api/users creates a user", async () => {
    const res = await request(app)
      .post("/api/users")
      .send({ name: "Aïssa Sow", bio: "Bonjour" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Aïssa Sow");
    expect(res.body.bio).toBe("Bonjour");
  });

  it("POST /api/users rejects too-short name", async () => {
    const res = await request(app).post("/api/users").send({ name: "A" });
    expect(res.status).toBe(400);
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
