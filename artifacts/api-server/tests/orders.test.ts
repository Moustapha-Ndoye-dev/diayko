import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, makeItem, makeSession, bearer } from "./helpers/db";

describe("Orders API", () => {
  beforeEach(resetDb);

  it("POST /api/orders creates an order with 5 timeline events", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id, { price: "15000" });
    const buyerSid = await makeSession(buyer.id);

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerSid))
      .send({ itemId: item.id, paymentMethod: "wave" });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe("processing");
    expect(res.body.sellerId).toBe(seller.id);
    expect(res.body.trackingId).toMatch(/^DK-\d{4}-\d{5}$/);
    expect(Number(res.body.totalPrice)).toBe(15000);

    const detail = await request(app)
      .get(`/api/orders/${res.body.id}`)
      .set("Authorization", bearer(buyerSid));
    expect(detail.status).toBe(200);
    expect(detail.body.events).toHaveLength(5);
    expect(detail.body.events[0].done).toBe(true);
    expect(detail.body.events[4].done).toBe(false);
    expect(detail.body.seller.id).toBe(seller.id);
  });

  it("POST /api/orders rejects buying your own item", async () => {
    const seller = await makeUser("Seller");
    const item = await makeItem(seller.id);
    const sellerSid = await makeSession(seller.id);
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(sellerSid))
      .send({ itemId: item.id, paymentMethod: "wave" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Cannot buy your own item");
  });

  it("POST /api/orders rejects invalid payment method", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const buyerSid = await makeSession(buyer.id);
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerSid))
      .send({ itemId: item.id, paymentMethod: "bitcoin" });
    expect(res.status).toBe(400);
  });

  it("POST /api/orders returns 404 for missing item", async () => {
    const buyer = await makeUser("Buyer");
    const buyerSid = await makeSession(buyer.id);
    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerSid))
      .send({
        itemId: "11111111-1111-1111-1111-111111111111",
        paymentMethod: "wave",
      });
    expect(res.status).toBe(404);
  });

  it("GET /api/orders filters by role and status", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item1 = await makeItem(seller.id);
    const item2 = await makeItem(seller.id);
    const buyerSid = await makeSession(buyer.id);
    const sellerSid = await makeSession(seller.id);

    await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerSid))
      .send({ itemId: item1.id, paymentMethod: "wave" });
    const second = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerSid))
      .send({ itemId: item2.id, paymentMethod: "orange_money" });
    await request(app)
      .patch(`/api/orders/${second.body.id}/status`)
      .send({ status: "delivered" });

    const asBuyer = await request(app)
      .get(`/api/orders?role=buyer`)
      .set("Authorization", bearer(buyerSid));
    expect(asBuyer.body.orders).toHaveLength(2);

    const asSeller = await request(app)
      .get(`/api/orders?role=seller`)
      .set("Authorization", bearer(sellerSid));
    expect(asSeller.body.orders).toHaveLength(2);

    const delivered = await request(app)
      .get(`/api/orders?role=buyer&status=delivered`)
      .set("Authorization", bearer(buyerSid));
    expect(delivered.body.orders).toHaveLength(1);
    expect(delivered.body.orders[0].id).toBe(second.body.id);
  });

  it("PATCH /api/orders/:id/status updates status and marks events done", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const buyerSid = await makeSession(buyer.id);
    const create = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerSid))
      .send({ itemId: item.id, paymentMethod: "wave" });

    const patch = await request(app)
      .patch(`/api/orders/${create.body.id}/status`)
      .send({ status: "in_transit" });
    expect(patch.status).toBe(200);
    expect(patch.body.status).toBe("in_transit");

    const detail = await request(app)
      .get(`/api/orders/${create.body.id}`)
      .set("Authorization", bearer(buyerSid));
    const doneCount = detail.body.events.filter((e: { done: boolean }) => e.done).length;
    expect(doneCount).toBeGreaterThanOrEqual(3);
  });

  it("GET /api/orders requires authentication", async () => {
    const res = await request(app).get("/api/orders");
    expect(res.status).toBe(401);
  });

  it("GET /api/orders/:id returns 404 for unknown order", async () => {
    const u = await makeUser("U");
    const sid = await makeSession(u.id);
    const res = await request(app)
      .get("/api/orders/11111111-1111-1111-1111-111111111111")
      .set("Authorization", bearer(sid));
    expect(res.status).toBe(404);
  });

  it("GET /api/orders/:id returns 400 for malformed id", async () => {
    const u = await makeUser("U");
    const sid = await makeSession(u.id);
    const res = await request(app)
      .get("/api/orders/not-a-uuid")
      .set("Authorization", bearer(sid));
    expect(res.status).toBe(400);
  });

  it("PATCH /api/orders/:id/status returns 404 for unknown order", async () => {
    const res = await request(app)
      .patch("/api/orders/11111111-1111-1111-1111-111111111111/status")
      .send({ status: "delivered" });
    expect(res.status).toBe(404);
  });

  it("PATCH /api/orders/:id/status rejects invalid status value", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const buyerSid = await makeSession(buyer.id);
    const create = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerSid))
      .send({ itemId: item.id, paymentMethod: "wave" });
    const res = await request(app)
      .patch(`/api/orders/${create.body.id}/status`)
      .send({ status: "lost" });
    expect(res.status).toBe(400);
  });

  it("PATCH /api/orders/:id/status preserves occurredAt of already-done events", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const buyerSid = await makeSession(buyer.id);
    const create = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerSid))
      .send({ itemId: item.id, paymentMethod: "wave" });

    const before = await request(app)
      .get(`/api/orders/${create.body.id}`)
      .set("Authorization", bearer(buyerSid));
    const firstStepTimestamp = before.body.events[0].occurredAt;

    await new Promise((r) => setTimeout(r, 30));
    await request(app)
      .patch(`/api/orders/${create.body.id}/status`)
      .send({ status: "in_transit" });

    const after = await request(app)
      .get(`/api/orders/${create.body.id}`)
      .set("Authorization", bearer(buyerSid));
    expect(after.body.events[0].occurredAt).toBe(firstStepTimestamp);
    expect(after.body.events[2].done).toBe(true);
  });
});
