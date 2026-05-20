import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, makeItem, makeSession, bearer } from "./helpers/db";

describe("Conversations API — edge cases", () => {
  beforeEach(resetDb);

  it("POST /api/conversations rejects conversation with self", async () => {
    const user = await makeUser("Solo");
    const token = await makeSession(user.id);

    const res = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(token))
      .send({ sellerId: user.id });

    expect(res.status).toBe(400);
  });

  it("POST /api/conversations rejects sellerId mismatch with item", async () => {
    const seller = await makeUser("Seller");
    const other = await makeUser("Other");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const token = await makeSession(buyer.id);

    const res = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(token))
      .send({ sellerId: other.id, itemId: item.id });

    expect(res.status).toBe(403);
  });

  it("GET /api/conversations/:id/messages returns 404 for unknown conversation", async () => {
    const user = await makeUser("User");
    const token = await makeSession(user.id);

    const res = await request(app)
      .get("/api/conversations/11111111-1111-1111-1111-111111111111/messages")
      .set("Authorization", bearer(token));

    expect(res.status).toBe(404);
  });

  it("POST /api/conversations/:id/messages rejects empty text", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const buyerToken = await makeSession(buyer.id);

    const conv = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(buyerToken))
      .send({ sellerId: seller.id });

    const res = await request(app)
      .post(`/api/conversations/${conv.body.id}/messages`)
      .set("Authorization", bearer(buyerToken))
      .send({ text: "" });

    expect(res.status).toBe(400);
  });
});
