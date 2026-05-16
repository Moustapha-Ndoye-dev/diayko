import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, makeItem } from "./helpers/db";

describe("GET /api/items", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("returns an empty page when there are no items", async () => {
    const res = await request(app).get("/api/items");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: [], total: 0, page: 1, limit: 20, hasMore: false });
  });

  it("lists items with images and applies category filter", async () => {
    const seller = await makeUser("Seller");
    await makeItem(seller.id, { category: "women", title: "Dress A" });
    await makeItem(seller.id, { category: "men", title: "Pants B" });

    const all = await request(app).get("/api/items");
    expect(all.status).toBe(200);
    expect(all.body.total).toBe(2);
    expect(all.body.items.every((i: { images: string[] }) => i.images.length > 0)).toBe(true);

    const women = await request(app).get("/api/items?category=women");
    expect(women.body.total).toBe(1);
    expect(women.body.items[0].title).toBe("Dress A");
  });

  it("supports full-text search across title/brand/description", async () => {
    const seller = await makeUser("Seller");
    await makeItem(seller.id, { title: "Boubou brodé" });
    await makeItem(seller.id, { title: "Sneakers blanches" });

    const res = await request(app).get("/api/items?q=boubou");
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].title).toContain("Boubou");
  });

  it("filters by price range", async () => {
    const seller = await makeUser("Seller");
    await makeItem(seller.id, { price: "5000" });
    await makeItem(seller.id, { price: "20000" });
    await makeItem(seller.id, { price: "100000" });

    const res = await request(app).get("/api/items?minPrice=10000&maxPrice=50000");
    expect(res.body.total).toBe(1);
    expect(Number(res.body.items[0].price)).toBe(20000);
  });

  it("rejects an invalid limit", async () => {
    const res = await request(app).get("/api/items?limit=999");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Validation failed");
  });
});

describe("GET /api/items/:id", () => {
  beforeEach(resetDb);

  it("returns 404 for unknown id", async () => {
    const res = await request(app).get("/api/items/11111111-1111-1111-1111-111111111111");
    expect(res.status).toBe(404);
  });

  it("returns 400 for malformed id", async () => {
    const res = await request(app).get("/api/items/not-a-uuid");
    expect(res.status).toBe(400);
  });

  it("returns the item with its seller", async () => {
    const seller = await makeUser("Aminata");
    const item = await makeItem(seller.id, { title: "Robe wax" });
    const res = await request(app).get(`/api/items/${item.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Robe wax");
    expect(res.body.seller.name).toBe("Aminata");
    expect(res.body.images.length).toBe(1);
  });
});

describe("POST /api/items", () => {
  beforeEach(resetDb);

  it("creates an item with images", async () => {
    const seller = await makeUser("Seller");
    const res = await request(app)
      .post("/api/items")
      .send({
        title: "New listing",
        brand: "Diayko",
        price: 12500,
        size: "S",
        condition: "Good",
        category: "women",
        description: "A new item.",
        sellerId: seller.id,
        images: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
      });
    expect(res.status).toBe(201);
    expect(res.body.images).toHaveLength(2);
    expect(Number(res.body.price)).toBe(12500);
  });

  it("rejects invalid condition", async () => {
    const seller = await makeUser("Seller");
    const res = await request(app)
      .post("/api/items")
      .send({
        title: "Bad listing",
        brand: "X",
        price: 100,
        size: "S",
        condition: "Trashed",
        category: "women",
        description: "",
        sellerId: seller.id,
        images: ["https://example.com/a.jpg"],
      });
    expect(res.status).toBe(400);
  });

  it("rejects missing images", async () => {
    const seller = await makeUser("Seller");
    const res = await request(app)
      .post("/api/items")
      .send({
        title: "Bad listing",
        brand: "X",
        price: 100,
        size: "S",
        condition: "Good",
        category: "women",
        description: "",
        sellerId: seller.id,
        images: [],
      });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/items/:id/like", () => {
  beforeEach(resetDb);

  it("toggles like on then off and updates counter", async () => {
    const seller = await makeUser("Seller");
    const liker = await makeUser("Liker");
    const item = await makeItem(seller.id);

    const r1 = await request(app)
      .post(`/api/items/${item.id}/like`)
      .send({ userId: liker.id });
    expect(r1.status).toBe(200);
    expect(r1.body).toEqual({ liked: true, likesCount: 1 });

    const r2 = await request(app)
      .post(`/api/items/${item.id}/like`)
      .send({ userId: liker.id });
    expect(r2.body).toEqual({ liked: false, likesCount: 0 });
  });
});

describe("POST /api/items/:id/view", () => {
  beforeEach(resetDb);

  it("increments view count", async () => {
    const seller = await makeUser("Seller");
    const item = await makeItem(seller.id);
    const r = await request(app).post(`/api/items/${item.id}/view`);
    expect(r.status).toBe(200);
    expect(r.body.viewsCount).toBe(1);
    const r2 = await request(app).post(`/api/items/${item.id}/view`);
    expect(r2.body.viewsCount).toBe(2);
  });
});

describe("DELETE /api/items/:id", () => {
  beforeEach(resetDb);

  it("deletes an item and returns 204", async () => {
    const seller = await makeUser("Seller");
    const item = await makeItem(seller.id);
    const del = await request(app).delete(`/api/items/${item.id}`);
    expect(del.status).toBe(204);
    const get = await request(app).get(`/api/items/${item.id}`);
    expect(get.status).toBe(404);
  });
});
