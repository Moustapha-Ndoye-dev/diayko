import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, bearer, makeItem, makeSession } from "./helpers/db";

describe("POST /api/orders/:id/reviews", () => {
  beforeEach(resetDb);

  it("allows one review from buyer on delivered order", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const buyerTok = await makeSession(buyer.id);
    const sellerTok = await makeSession(seller.id);

    const order = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerTok))
      .send({ itemId: item.id, paymentMethod: "wave" });
    expect(order.status).toBe(201);

    await request(app)
      .patch(`/api/orders/${order.body.id}/status`)
      .set("Authorization", bearer(sellerTok))
      .send({ status: "delivered" });

    const rev = await request(app)
      .post(`/api/orders/${order.body.id}/reviews`)
      .set("Authorization", bearer(buyerTok))
      .send({ rating: 5, comment: "Top" });
    expect(rev.status).toBe(201);
    expect(rev.body.rating).toBe(5);

    const dup = await request(app)
      .post(`/api/orders/${order.body.id}/reviews`)
      .set("Authorization", bearer(buyerTok))
      .send({ rating: 4 });
    expect(dup.status).toBe(409);
  });

  it("lists reviews on the seller profile", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const buyerTok = await makeSession(buyer.id);
    const sellerTok = await makeSession(seller.id);

    const order = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerTok))
      .send({ itemId: item.id, paymentMethod: "wave" });
    await request(app)
      .patch(`/api/orders/${order.body.id}/status`)
      .set("Authorization", bearer(sellerTok))
      .send({ status: "delivered" });
    await request(app)
      .post(`/api/orders/${order.body.id}/reviews`)
      .set("Authorization", bearer(buyerTok))
      .send({ rating: 5, comment: "Service rapide" });

    const list = await request(app).get(`/api/users/${seller.id}/reviews`);
    expect(list.status).toBe(200);
    expect(list.body.total).toBe(1);
    expect(list.body.reviews[0].comment).toBe("Service rapide");
  });

  it("rejects reviews before delivery and from non-buyers", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const stranger = await makeUser("Stranger");
    const item = await makeItem(seller.id);
    const buyerTok = await makeSession(buyer.id);
    const strangerTok = await makeSession(stranger.id);

    const order = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerTok))
      .send({ itemId: item.id, paymentMethod: "wave" });

    const tooSoon = await request(app)
      .post(`/api/orders/${order.body.id}/reviews`)
      .set("Authorization", bearer(buyerTok))
      .send({ rating: 5 });
    expect(tooSoon.status).toBe(400);

    const wrongUser = await request(app)
      .post(`/api/orders/${order.body.id}/reviews`)
      .set("Authorization", bearer(strangerTok))
      .send({ rating: 5 });
    expect(wrongUser.status).toBe(403);
  });
});
