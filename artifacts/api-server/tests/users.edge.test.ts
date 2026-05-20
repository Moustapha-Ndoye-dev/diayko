import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, makeSession, bearer } from "./helpers/db";

describe("Users API — edge cases", () => {
  beforeEach(resetDb);

  it("PATCH /api/users/:id rejects empty patch body", async () => {
    const u = await makeUser("User");
    const token = await makeSession(u.id);

    const res = await request(app)
      .patch(`/api/users/${u.id}`)
      .set("Authorization", bearer(token))
      .send({});

    expect(res.status).toBe(400);
  });

  it("GET /api/users/:id/reviews returns empty page for unknown seller id", async () => {
    const res = await request(app).get(
      "/api/users/00000000-0000-0000-0000-000000000000/reviews",
    );
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.reviews).toEqual([]);
  });

  it("GET /api/users/:id/items paginates with hasMore", async () => {
    const u = await makeUser("Seller");
    const { makeItem } = await import("./helpers/db");
    await makeItem(u.id, { title: "1" });
    await makeItem(u.id, { title: "2" });

    const res = await request(app).get(`/api/users/${u.id}/items?limit=1`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.hasMore).toBe(true);
  });
});
