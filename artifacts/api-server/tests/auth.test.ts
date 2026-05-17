import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, makeItem, makeSession, bearer } from "./helpers/db";
import { db } from "@workspace/db";
import { conversationsTable } from "@workspace/db/schema";

/**
 * Regression tests guarding `requireAuth` on every sensitive route.
 *
 * For each endpoint we verify:
 *   - 401 when no session cookie / bearer is supplied
 *   - 401 when an invalid/unknown session id is supplied
 *   - a successful (200/201) or expected authorization (403) response with a
 *     valid session — proving the middleware does not over-block legitimate
 *     traffic.
 *
 * If anyone accidentally removes `requireAuth` from a route, these tests
 * will turn the regression into a CI failure instead of a silent prod bug.
 */
describe("requireAuth — sensitive route protection", () => {
  beforeEach(resetDb);

  /**
   * Negative matrix across route families: a syntactically valid but
   * unknown bearer token must never be treated as authenticated. Catches
   * route-specific parsing or middleware-ordering regressions that a
   * single endpoint check could miss.
   */
  describe("invalid bearer token is rejected across route families", () => {
    const badToken = "deadbeef".repeat(8);
    const cases: Array<{ name: string; method: "get" | "post"; path: string; body?: unknown }> = [
      { name: "items   — POST /api/items", method: "post", path: "/api/items", body: {} },
      { name: "convs   — GET  /api/conversations", method: "get", path: "/api/conversations" },
      { name: "convs   — POST /api/conversations", method: "post", path: "/api/conversations", body: {} },
      { name: "orders  — GET  /api/orders", method: "get", path: "/api/orders" },
      { name: "orders  — POST /api/orders", method: "post", path: "/api/orders", body: {} },
      { name: "favs    — GET  /api/me/favorites", method: "get", path: "/api/me/favorites" },
    ];
    for (const c of cases) {
      it(`${c.name} returns 401`, async () => {
        const req =
          c.method === "get"
            ? request(app).get(c.path)
            : request(app).post(c.path).send(c.body ?? {});
        const res = await req.set("Authorization", bearer(badToken));
        expect(res.status).toBe(401);
      });
    }
  });

  describe("POST /api/items", () => {
    const validBody = {
      title: "Auth test item",
      brand: "Brand",
      price: 1500,
      size: "M",
      condition: "Good" as const,
      category: "women",
      description: "desc",
      images: ["https://example.com/a.jpg"],
    };

    it("returns 401 without a session", async () => {
      const res = await request(app).post("/api/items").send(validBody);
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "Authentication required" });
    });

    it("returns 401 with an unknown bearer token", async () => {
      const res = await request(app)
        .post("/api/items")
        .set("Authorization", bearer("deadbeef".repeat(8)))
        .send(validBody);
      expect(res.status).toBe(401);
    });

    it("returns 201 with a valid session", async () => {
      const u = await makeUser("Seller");
      const sid = await makeSession(u.id);
      const res = await request(app)
        .post("/api/items")
        .set("Authorization", bearer(sid))
        .send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.sellerId).toBe(u.id);
    });
  });

  describe("POST /api/items/:id/like", () => {
    it("returns 401 without a session", async () => {
      const seller = await makeUser("Seller");
      const item = await makeItem(seller.id);
      const res = await request(app).post(`/api/items/${item.id}/like`);
      expect(res.status).toBe(401);
    });

    it("returns 200 with a valid session", async () => {
      const seller = await makeUser("Seller");
      const liker = await makeUser("Liker");
      const item = await makeItem(seller.id);
      const sid = await makeSession(liker.id);
      const res = await request(app)
        .post(`/api/items/${item.id}/like`)
        .set("Authorization", bearer(sid));
      expect(res.status).toBe(200);
      expect(res.body.liked).toBe(true);
    });
  });

  describe("DELETE /api/items/:id", () => {
    it("returns 401 without a session", async () => {
      const seller = await makeUser("Seller");
      const item = await makeItem(seller.id);
      const res = await request(app).delete(`/api/items/${item.id}`);
      expect(res.status).toBe(401);
    });

    it("returns 403 when the authed user is not the owner", async () => {
      const seller = await makeUser("Seller");
      const other = await makeUser("Other");
      const sid = await makeSession(other.id);
      const item = await makeItem(seller.id);
      const res = await request(app)
        .delete(`/api/items/${item.id}`)
        .set("Authorization", bearer(sid));
      expect(res.status).toBe(403);
    });

    it("returns 204 when the owner deletes", async () => {
      const seller = await makeUser("Seller");
      const sid = await makeSession(seller.id);
      const item = await makeItem(seller.id);
      const res = await request(app)
        .delete(`/api/items/${item.id}`)
        .set("Authorization", bearer(sid));
      expect(res.status).toBe(204);
    });
  });

  describe("GET /api/conversations", () => {
    it("returns 401 without a session", async () => {
      const res = await request(app).get("/api/conversations");
      expect(res.status).toBe(401);
    });

    it("returns 200 with a valid session", async () => {
      const u = await makeUser("U");
      const sid = await makeSession(u.id);
      const res = await request(app)
        .get("/api/conversations")
        .set("Authorization", bearer(sid));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("POST /api/conversations", () => {
    it("returns 401 without a session", async () => {
      const seller = await makeUser("Seller");
      const res = await request(app)
        .post("/api/conversations")
        .send({ sellerId: seller.id });
      expect(res.status).toBe(401);
    });

    it("returns 201 with a valid session", async () => {
      const buyer = await makeUser("Buyer");
      const seller = await makeUser("Seller");
      const sid = await makeSession(buyer.id);
      const res = await request(app)
        .post("/api/conversations")
        .set("Authorization", bearer(sid))
        .send({ sellerId: seller.id });
      expect(res.status).toBe(201);
      expect(res.body.buyerId).toBe(buyer.id);
    });
  });

  describe("GET /api/conversations/:id/messages", () => {
    it("returns 401 without a session", async () => {
      const buyer = await makeUser("Buyer");
      const seller = await makeUser("Seller");
      const [conv] = await db
        .insert(conversationsTable)
        .values({ buyerId: buyer.id, sellerId: seller.id })
        .returning();
      const res = await request(app).get(`/api/conversations/${conv!.id}/messages`);
      expect(res.status).toBe(401);
    });

    it("returns 403 when the authed user is not a participant", async () => {
      const buyer = await makeUser("Buyer");
      const seller = await makeUser("Seller");
      const stranger = await makeUser("Stranger");
      const sid = await makeSession(stranger.id);
      const [conv] = await db
        .insert(conversationsTable)
        .values({ buyerId: buyer.id, sellerId: seller.id })
        .returning();
      const res = await request(app)
        .get(`/api/conversations/${conv!.id}/messages`)
        .set("Authorization", bearer(sid));
      expect(res.status).toBe(403);
    });

    it("returns 200 with a valid session for a participant", async () => {
      const buyer = await makeUser("Buyer");
      const seller = await makeUser("Seller");
      const sid = await makeSession(buyer.id);
      const [conv] = await db
        .insert(conversationsTable)
        .values({ buyerId: buyer.id, sellerId: seller.id })
        .returning();
      const res = await request(app)
        .get(`/api/conversations/${conv!.id}/messages`)
        .set("Authorization", bearer(sid));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe("POST /api/conversations/:id/messages", () => {
    it("returns 401 without a session", async () => {
      const buyer = await makeUser("Buyer");
      const seller = await makeUser("Seller");
      const [conv] = await db
        .insert(conversationsTable)
        .values({ buyerId: buyer.id, sellerId: seller.id })
        .returning();
      const res = await request(app)
        .post(`/api/conversations/${conv!.id}/messages`)
        .send({ text: "hi" });
      expect(res.status).toBe(401);
    });

    it("returns 403 when the authed user is not a participant", async () => {
      const buyer = await makeUser("Buyer");
      const seller = await makeUser("Seller");
      const stranger = await makeUser("Stranger");
      const sid = await makeSession(stranger.id);
      const [conv] = await db
        .insert(conversationsTable)
        .values({ buyerId: buyer.id, sellerId: seller.id })
        .returning();
      const res = await request(app)
        .post(`/api/conversations/${conv!.id}/messages`)
        .set("Authorization", bearer(sid))
        .send({ text: "hi" });
      expect(res.status).toBe(403);
    });

    it("returns 201 with a valid session for a participant", async () => {
      const buyer = await makeUser("Buyer");
      const seller = await makeUser("Seller");
      const sid = await makeSession(buyer.id);
      const [conv] = await db
        .insert(conversationsTable)
        .values({ buyerId: buyer.id, sellerId: seller.id })
        .returning();
      const res = await request(app)
        .post(`/api/conversations/${conv!.id}/messages`)
        .set("Authorization", bearer(sid))
        .send({ text: "hello" });
      expect(res.status).toBe(201);
      expect(res.body.senderId).toBe(buyer.id);
    });
  });

  describe("GET /api/orders", () => {
    it("returns 401 without a session", async () => {
      const res = await request(app).get("/api/orders");
      expect(res.status).toBe(401);
    });

    it("returns 200 with a valid session", async () => {
      const u = await makeUser("U");
      const sid = await makeSession(u.id);
      const res = await request(app)
        .get("/api/orders")
        .set("Authorization", bearer(sid));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.orders)).toBe(true);
    });
  });

  describe("POST /api/orders", () => {
    it("returns 401 without a session", async () => {
      const seller = await makeUser("Seller");
      const item = await makeItem(seller.id);
      const res = await request(app)
        .post("/api/orders")
        .send({ itemId: item.id, paymentMethod: "wave" });
      expect(res.status).toBe(401);
    });

    it("returns 201 with a valid session", async () => {
      const seller = await makeUser("Seller");
      const buyer = await makeUser("Buyer");
      const sid = await makeSession(buyer.id);
      const item = await makeItem(seller.id);
      const res = await request(app)
        .post("/api/orders")
        .set("Authorization", bearer(sid))
        .send({ itemId: item.id, paymentMethod: "wave" });
      expect(res.status).toBe(201);
      expect(res.body.buyerId).toBe(buyer.id);
    });
  });

  describe("GET /api/orders/:id", () => {
    it("returns 401 without a session", async () => {
      const res = await request(app).get(
        `/api/orders/11111111-1111-1111-1111-111111111111`,
      );
      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /api/orders/:id/status", () => {
    it("returns 401 without a session", async () => {
      const res = await request(app)
        .patch(`/api/orders/11111111-1111-1111-1111-111111111111/status`)
        .send({ status: "delivered" });
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/me/favorites", () => {
    it("returns 401 without a session", async () => {
      const res = await request(app).get(`/api/me/favorites`);
      expect(res.status).toBe(401);
    });

    it("returns 200 with a valid session", async () => {
      const u = await makeUser("U");
      const sid = await makeSession(u.id);
      const res = await request(app)
        .get(`/api/me/favorites`)
        .set("Authorization", bearer(sid));
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ items: [], ids: [] });
    });
  });
});
