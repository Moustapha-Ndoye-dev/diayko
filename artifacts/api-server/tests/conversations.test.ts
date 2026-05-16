import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, makeItem, makeSession, bearer } from "./helpers/db";

describe("Conversations API", () => {
  beforeEach(resetDb);

  it("POST /api/conversations creates a conversation with initial message", async () => {
    const buyer = await makeUser("Buyer");
    const seller = await makeUser("Seller");
    const item = await makeItem(seller.id);
    const buyerSid = await makeSession(buyer.id);

    const res = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(buyerSid))
      .send({
        sellerId: seller.id,
        itemId: item.id,
        initialMessage: "Toujours dispo ?",
      });
    expect(res.status).toBe(201);
    expect(res.body.buyerId).toBe(buyer.id);
    expect(res.body.otherUser.id).toBe(seller.id);

    const msgs = await request(app)
      .get(`/api/conversations/${res.body.id}/messages`)
      .set("Authorization", bearer(buyerSid));
    expect(msgs.body).toHaveLength(1);
    expect(msgs.body[0].text).toBe("Toujours dispo ?");
  });

  it("GET /api/conversations lists for buyer and seller", async () => {
    const buyer = await makeUser("Buyer");
    const seller = await makeUser("Seller");
    const item = await makeItem(seller.id);
    const buyerSid = await makeSession(buyer.id);
    const sellerSid = await makeSession(seller.id);

    const created = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(buyerSid))
      .send({ sellerId: seller.id, itemId: item.id, initialMessage: "Hi" });

    const buyerList = await request(app)
      .get(`/api/conversations`)
      .set("Authorization", bearer(buyerSid));
    expect(buyerList.status).toBe(200);
    expect(buyerList.body).toHaveLength(1);
    expect(buyerList.body[0].otherUser.id).toBe(seller.id);
    expect(buyerList.body[0].item.id).toBe(item.id);

    const sellerList = await request(app)
      .get(`/api/conversations`)
      .set("Authorization", bearer(sellerSid));
    expect(sellerList.body).toHaveLength(1);
    expect(sellerList.body[0].otherUser.id).toBe(buyer.id);
    expect(sellerList.body[0].id).toBe(created.body.id);
  });

  it("GET /api/conversations rejects unauthenticated requests", async () => {
    const res = await request(app).get("/api/conversations");
    expect(res.status).toBe(401);
  });

  it("POST /api/conversations/:id/messages appends a message and updates lastMessage", async () => {
    const buyer = await makeUser("Buyer");
    const seller = await makeUser("Seller");
    const buyerSid = await makeSession(buyer.id);
    const sellerSid = await makeSession(seller.id);
    const conv = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(buyerSid))
      .send({ sellerId: seller.id });

    const sent = await request(app)
      .post(`/api/conversations/${conv.body.id}/messages`)
      .set("Authorization", bearer(sellerSid))
      .send({ text: "Bonjour" });
    expect(sent.status).toBe(201);
    expect(sent.body.text).toBe("Bonjour");

    const list = await request(app)
      .get(`/api/conversations`)
      .set("Authorization", bearer(buyerSid));
    expect(list.body[0].lastMessage).toBe("Bonjour");
    expect(list.body[0].unreadCount).toBe(1);
  });

  it("POST /api/conversations/:id/messages rejects empty text", async () => {
    const buyer = await makeUser("Buyer");
    const seller = await makeUser("Seller");
    const buyerSid = await makeSession(buyer.id);
    const sellerSid = await makeSession(seller.id);
    const conv = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(buyerSid))
      .send({ sellerId: seller.id });

    const res = await request(app)
      .post(`/api/conversations/${conv.body.id}/messages`)
      .set("Authorization", bearer(sellerSid))
      .send({ text: "" });
    expect(res.status).toBe(400);
  });
});
