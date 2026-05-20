import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, makeItem, makeSession, bearer } from "./helpers/db";

describe("Items API — supplementary integration", () => {
  beforeEach(resetDb);

  it("PATCH /api/items/:id updates price and images for owner", async () => {
    const seller = await makeUser("Seller");
    const item = await makeItem(seller.id, { price: "10000" });
    const token = await makeSession(seller.id);

    const res = await request(app)
      .patch(`/api/items/${item.id}`)
      .set("Authorization", bearer(token))
      .send({
        price: 15000,
        images: ["https://example.com/new.jpg", "https://example.com/second.jpg"],
      });

    expect(res.status).toBe(200);
    expect(Number(res.body.price)).toBe(15000);
    expect(res.body.images).toHaveLength(2);
  });

  it("PATCH /api/items/:id rejects empty body", async () => {
    const seller = await makeUser("Seller");
    const item = await makeItem(seller.id);
    const token = await makeSession(seller.id);

    const res = await request(app)
      .patch(`/api/items/${item.id}`)
      .set("Authorization", bearer(token))
      .send({});

    expect(res.status).toBe(400);
  });

  it("filters by size and condition query params", async () => {
    const seller = await makeUser("Seller");
    await makeItem(seller.id, { size: "M", condition: "Good", title: "Good M" });
    await makeItem(seller.id, { size: "L", condition: "Fair", title: "Fair L" });

    const res = await request(app).get("/api/items?size=M&condition=Good");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].title).toBe("Good M");
  });

  it("POST /api/items/:id/view returns 404 for unknown item", async () => {
    const res = await request(app).post(
      "/api/items/11111111-1111-1111-1111-111111111111/view",
    );
    expect(res.status).toBe(404);
  });

  it("POST /api/items requires authentication", async () => {
    const res = await request(app).post("/api/items").send({
      title: "X",
      brand: "B",
      price: 1,
      size: "M",
      condition: "Good",
      category: "women",
      description: "d",
      images: ["https://example.com/x.jpg"],
    });
    expect(res.status).toBe(401);
  });
});
