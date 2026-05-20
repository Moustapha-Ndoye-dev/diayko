import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { bearer, makeItem, makeSession, makeUser, resetDb } from "./helpers/db";
import {
  registerBody,
  loginBody,
  authResetBody,
  authChangeBody,
  OLD_TEST_CREDENTIAL,
  NEW_TEST_CREDENTIAL,
} from "./helpers/authBodies";
import {
  AUTH_FORGOT_PATH,
  AUTH_RESET_PATH,
  AUTH_CHANGE_PATH,
} from "./helpers/authRoutes";

describe("TDD backlog - account lifecycle", () => {
  beforeEach(resetDb);

  it("POST forgot-credential returns a generic 202 response", async () => {
    const res = await request(app)
      .post(AUTH_FORGOT_PATH)
      .send({ email: "unknown@example.com" });

    expect(res.status).toBe(202);
    expect(res.body).toEqual({ success: true });
  });

  it("POST reset-credential accepts a valid token", async () => {
    await request(app).post("/api/auth/register").send(registerBody("reset@example.com", OLD_TEST_CREDENTIAL));

    const reset = await request(app)
      .post(AUTH_RESET_PATH)
      .send(authResetBody("valid-reset-token"));

    expect(reset.status).toBe(200);

    const login = await request(app)
      .post("/api/auth/login")
      .send(loginBody("reset@example.com", NEW_TEST_CREDENTIAL));
    expect(login.status).toBe(200);
  });

  it("POST change-credential updates the authenticated user secret", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send(registerBody("change@example.com", OLD_TEST_CREDENTIAL));

    const changed = await request(app)
      .post(AUTH_CHANGE_PATH)
      .set("Authorization", bearer(reg.body.accessToken))
      .send(authChangeBody(OLD_TEST_CREDENTIAL, NEW_TEST_CREDENTIAL));

    expect(changed.status).toBe(200);

    const login = await request(app)
      .post("/api/auth/login")
      .send(loginBody("change@example.com", NEW_TEST_CREDENTIAL));
    expect(login.status).toBe(200);
  });

  it("POST /api/auth/email/verify marks the email as verified", async () => {
    const reg = await request(app)
      .post("/api/auth/register")
      .send(registerBody("verify@example.com"));

    const verify = await request(app)
      .post("/api/auth/email/verify")
      .send({ token: "valid-email-token" });

    expect(verify.status).toBe(200);

    const me = await request(app)
      .get("/api/auth/user")
      .set("Authorization", bearer(reg.body.accessToken));
    expect(me.body.user.emailVerified).toBe(true);
  });
});

describe("TDD backlog - marketplace operations", () => {
  beforeEach(resetDb);

  it("PATCH /api/items/:id/status marks an owned item as sold", async () => {
    const seller = await makeUser("Seller");
    const item = await makeItem(seller.id);
    const token = await makeSession(seller.id);

    const res = await request(app)
      .patch(`/api/items/${item.id}/status`)
      .set("Authorization", bearer(token))
      .send({ status: "sold" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("sold");
  });

  it("POST /api/orders stores a delivery address on the order", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const token = await makeSession(buyer.id);

    const res = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(token))
      .send({
        itemId: item.id,
        paymentMethod: "wave",
        deliveryAddress: {
          name: "Awa Diop",
          city: "Dakar",
          phone: "+221771112233",
          line1: "Liberte 6",
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.deliveryAddress.city).toBe("Dakar");
  });

  it("POST /api/orders/:id/cancel cancels an order for the buyer", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const buyerToken = await makeSession(buyer.id);

    const order = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerToken))
      .send({ itemId: item.id, paymentMethod: "wave" });

    const cancelled = await request(app)
      .post(`/api/orders/${order.body.id}/cancel`)
      .set("Authorization", bearer(buyerToken));

    expect(cancelled.status).toBe(200);
    expect(cancelled.body.status).toBe("cancelled");
  });
});

describe("TDD backlog - seller, wallet and admin", () => {
  beforeEach(resetDb);

  it("GET /api/admin/sellers lists pending seller requests", async () => {
    const admin = await makeUser("Admin", { role: "admin" });
    const pending = await makeUser("Pending seller", { sellerStatus: "pending" });
    const token = await makeSession(admin.id);

    const res = await request(app)
      .get("/api/admin/sellers?status=pending")
      .set("Authorization", bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.sellers.map((s: { id: string }) => s.id)).toContain(pending.id);
  });

  it("GET /api/seller/stats returns real seller metrics", async () => {
    const seller = await makeUser("Seller", { sellerStatus: "approved" });
    await makeItem(seller.id, { viewsCount: 12, likesCount: 3 });
    const token = await makeSession(seller.id);

    const res = await request(app)
      .get("/api/seller/stats")
      .set("Authorization", bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.views).toBe(12);
    expect(res.body.likes).toBe(3);
  });

  it("GET /api/wallet returns the authenticated seller balance", async () => {
    const seller = await makeUser("Seller", { sellerStatus: "approved" });
    const token = await makeSession(seller.id);

    const res = await request(app)
      .get("/api/wallet")
      .set("Authorization", bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.currency).toBe("XOF");
    expect(res.body).toHaveProperty("available");
    expect(res.body).toHaveProperty("pending");
  });

  it("POST /api/wallet/withdrawals creates a payout request", async () => {
    const seller = await makeUser("Seller", { sellerStatus: "approved" });
    const token = await makeSession(seller.id);

    const res = await request(app)
      .post("/api/wallet/withdrawals")
      .set("Authorization", bearer(token))
      .send({ amount: 5000, method: "wave", phone: "+221771112233" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("pending");
  });
});

describe("TDD backlog - notifications, support and moderation", () => {
  beforeEach(resetDb);

  it("GET /api/notifications returns persisted notifications", async () => {
    const user = await makeUser("User");
    const token = await makeSession(user.id);

    const res = await request(app)
      .get("/api/notifications")
      .set("Authorization", bearer(token));

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
  });

  it("PATCH /api/notifications/:id/read marks a notification as read", async () => {
    const user = await makeUser("User");
    const token = await makeSession(user.id);

    const res = await request(app)
      .patch("/api/notifications/11111111-1111-1111-1111-111111111111/read")
      .set("Authorization", bearer(token));

    expect(res.status).toBe(200);
    expect(res.body.read).toBe(true);
  });

  it("POST /api/support/tickets creates a support ticket", async () => {
    const user = await makeUser("User");
    const token = await makeSession(user.id);

    const res = await request(app)
      .post("/api/support/tickets")
      .set("Authorization", bearer(token))
      .send({ subject: "Probleme commande", message: "Je n'ai pas recu mon colis." });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("open");
  });

  it("POST /api/conversations/:id/report stores a moderation report", async () => {
    const buyer = await makeUser("Buyer");
    const seller = await makeUser("Seller");
    const buyerToken = await makeSession(buyer.id);

    const conversation = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(buyerToken))
      .send({ sellerId: seller.id, initialMessage: "Bonjour" });

    const report = await request(app)
      .post(`/api/conversations/${conversation.body.id}/report`)
      .set("Authorization", bearer(buyerToken))
      .send({ reason: "spam", details: "Message suspect" });

    expect(report.status).toBe(201);
    expect(report.body.reason).toBe("spam");
  });
});

describe("TDD backlog - catalog, search and checkout", () => {
  beforeEach(resetDb);

  it("GET /api/items?sort=price_asc orders results by ascending price", async () => {
    const seller = await makeUser("Seller");
    await makeItem(seller.id, { title: "Cheap", price: "5000" });
    await makeItem(seller.id, { title: "Premium", price: "50000" });

    const res = await request(app).get("/api/items?sort=price_asc");
    expect(res.status).toBe(200);
    expect(Number(res.body.items[0].price)).toBeLessThanOrEqual(
      Number(res.body.items[1].price),
    );
  });

  it("GET /api/items hides listings tied to an in-flight order", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const buyerToken = await makeSession(buyer.id);

    await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerToken))
      .send({ itemId: item.id, paymentMethod: "wave" });

    const list = await request(app).get("/api/items");
    expect(list.body.items.some((row: { id: string }) => row.id === item.id)).toBe(false);
  });

  it("POST /api/orders rejects a second purchase of the same item", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const buyerToken = await makeSession(buyer.id);

    const first = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerToken))
      .send({ itemId: item.id, paymentMethod: "wave" });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerToken))
      .send({ itemId: item.id, paymentMethod: "orange_money" });
    expect(second.status).toBe(409);
  });

  it("POST /api/checkout/quote returns fees before payment", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id, { price: "10000" });
    const buyerToken = await makeSession(buyer.id);

    const res = await request(app)
      .post("/api/checkout/quote")
      .set("Authorization", bearer(buyerToken))
      .send({ itemId: item.id, paymentMethod: "wave" });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      subtotal: 10000,
      serviceFee: expect.any(Number),
      total: expect.any(Number),
      currency: "XOF",
    });
  });
});

describe("TDD backlog - buyer and seller journeys", () => {
  beforeEach(resetDb);

  it("POST /api/orders/:id/confirm-receipt lets the buyer mark an order delivered", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const buyerToken = await makeSession(buyer.id);
    const sellerToken = await makeSession(seller.id);

    const order = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerToken))
      .send({ itemId: item.id, paymentMethod: "wave" });

    await request(app)
      .patch(`/api/orders/${order.body.id}/status`)
      .set("Authorization", bearer(sellerToken))
      .send({ status: "in_transit" });

    const confirmed = await request(app)
      .post(`/api/orders/${order.body.id}/confirm-receipt`)
      .set("Authorization", bearer(buyerToken));

    expect(confirmed.status).toBe(200);
    expect(confirmed.body.status).toBe("delivered");
  });

  it("GET /api/me/sales returns seller order history", async () => {
    const seller = await makeUser("Seller", { sellerStatus: "approved" });
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const sellerToken = await makeSession(seller.id);
    const buyerToken = await makeSession(buyer.id);

    await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerToken))
      .send({ itemId: item.id, paymentMethod: "wave" });

    const res = await request(app)
      .get("/api/me/sales")
      .set("Authorization", bearer(sellerToken));

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0].item.id).toBe(item.id);
  });

  it("PATCH /api/conversations/:id/read clears unread counts for the reader", async () => {
    const buyer = await makeUser("Buyer");
    const seller = await makeUser("Seller");
    const buyerToken = await makeSession(buyer.id);
    const sellerToken = await makeSession(seller.id);

    const conversation = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(buyerToken))
      .send({ sellerId: seller.id, initialMessage: "Salut" });

    await request(app)
      .post(`/api/conversations/${conversation.body.id}/messages`)
      .set("Authorization", bearer(sellerToken))
      .send({ text: "Reponse vendeur" });

    const read = await request(app)
      .patch(`/api/conversations/${conversation.body.id}/read`)
      .set("Authorization", bearer(buyerToken));

    expect(read.status).toBe(200);
    expect(read.body.unreadCount).toBe(0);

    const inbox = await request(app)
      .get("/api/conversations")
      .set("Authorization", bearer(buyerToken));
    expect(inbox.body[0].unreadCount).toBe(0);
  });

  it("POST /api/conversations/:id/messages censors contact details server-side", async () => {
    const buyer = await makeUser("Buyer");
    const seller = await makeUser("Seller");
    const buyerToken = await makeSession(buyer.id);

    const conversation = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(buyerToken))
      .send({ sellerId: seller.id, initialMessage: "Bonjour" });

    const sent = await request(app)
      .post(`/api/conversations/${conversation.body.id}/messages`)
      .set("Authorization", bearer(buyerToken))
      .send({ text: "Ecris-moi sur awa@example.com ou +221771112233" });

    expect(sent.status).toBe(201);
    expect(sent.body.text).not.toContain("awa@example.com");
    expect(sent.body.text).not.toContain("+221771112233");
  });
});

describe("TDD backlog - promotions, help and platform", () => {
  beforeEach(resetDb);

  it("GET /api/promotions lists active campaigns", async () => {
    const res = await request(app).get("/api/promotions");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.promotions)).toBe(true);
    expect(res.body.promotions.length).toBeGreaterThan(0);
  });

  it("GET /api/promotions/:id returns a single campaign", async () => {
    const list = await request(app).get("/api/promotions");
    const id = list.body.promotions[0].id;

    const res = await request(app).get(`/api/promotions/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
    expect(res.body).toHaveProperty("headline");
  });

  it("GET /api/help/articles returns FAQ entries", async () => {
    const res = await request(app).get("/api/help/articles");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.articles)).toBe(true);
    expect(res.body.articles[0]).toMatchObject({
      slug: expect.any(String),
      title: expect.any(String),
    });
  });

  it("POST /api/notifications/mark-all-read clears unread notifications", async () => {
    const user = await makeUser("User");
    const token = await makeSession(user.id);

    const cleared = await request(app)
      .post("/api/notifications/mark-all-read")
      .set("Authorization", bearer(token));

    expect(cleared.status).toBe(200);
    expect(cleared.body.unread).toBe(0);

    const list = await request(app)
      .get("/api/notifications")
      .set("Authorization", bearer(token));
    expect(list.body.notifications.every((n: { read: boolean }) => n.read)).toBe(true);
  });
});
