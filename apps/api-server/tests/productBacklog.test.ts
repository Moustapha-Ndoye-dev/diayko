import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import { bearer, makeItem, makeSession, makeUser, resetDb } from "./helpers/db";

describe("Backlog produit - publication", () => {
  beforeEach(resetDb);

  it("POST /api/items accepte temporairement une annonce sans photo", async () => {
    const seller = await makeUser("Seller", { sellerStatus: "approved" });
    const token = await makeSession(seller.id);

    const res = await request(app)
      .post("/api/items")
      .set("Authorization", bearer(token))
      .send({
        title: "Sac vert",
        brand: "Diayko",
        price: 18000,
        size: "M",
        condition: "Good",
        category: "bags",
        description: "Annonce créée avant upload photo.",
        images: [],
      });

    expect(res.status).toBe(201);
    expect(res.body.images).toEqual([]);
  });
});

describe("Backlog produit - notifications métier", () => {
  beforeEach(resetDb);

  it("crée une notification vendeur quand un article reçoit un favori", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id, { title: "Robe wax" });
    const buyerToken = await makeSession(buyer.id);
    const sellerToken = await makeSession(seller.id);

    const liked = await request(app)
      .post(`/api/items/${item.id}/like`)
      .set("Authorization", bearer(buyerToken));
    expect(liked.status).toBe(200);

    const notifications = await request(app)
      .get("/api/notifications")
      .set("Authorization", bearer(sellerToken));
    expect(notifications.status).toBe(200);
    expect(
      notifications.body.notifications.some((n: { title: string; body: string }) =>
        n.title.includes("favori") && n.body.includes("Robe wax"),
      ),
    ).toBe(true);
  });

  it("crée une notification au destinataire quand un message arrive", async () => {
    const buyer = await makeUser("Buyer");
    const seller = await makeUser("Seller");
    const buyerToken = await makeSession(buyer.id);
    const sellerToken = await makeSession(seller.id);

    const conversation = await request(app)
      .post("/api/conversations")
      .set("Authorization", bearer(buyerToken))
      .send({ sellerId: seller.id, initialMessage: "Bonjour" });
    expect(conversation.status).toBe(201);

    const notifications = await request(app)
      .get("/api/notifications")
      .set("Authorization", bearer(sellerToken));
    expect(
      notifications.body.notifications.some((n: { title: string; body: string }) =>
        n.title.includes("message") && n.body.includes("Bonjour"),
      ),
    ).toBe(true);
  });

  it("crée des notifications acheteur et vendeur quand une commande est créée", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id, { title: "Baskets blanches" });
    const buyerToken = await makeSession(buyer.id);
    const sellerToken = await makeSession(seller.id);

    const order = await request(app)
      .post("/api/orders")
      .set("Authorization", bearer(buyerToken))
      .send({ itemId: item.id, paymentMethod: "wave" });
    expect(order.status).toBe(201);

    const buyerNotifications = await request(app)
      .get("/api/notifications")
      .set("Authorization", bearer(buyerToken));
    const sellerNotifications = await request(app)
      .get("/api/notifications")
      .set("Authorization", bearer(sellerToken));

    expect(
      buyerNotifications.body.notifications.some((n: { title: string; body: string }) =>
        n.title.includes("Commande") && n.body.includes("Baskets blanches"),
      ),
    ).toBe(true);
    expect(
      sellerNotifications.body.notifications.some((n: { title: string; body: string }) =>
        n.title.includes("vente") && n.body.includes("Baskets blanches"),
      ),
    ).toBe(true);
  }, 45_000);
});

describe("Backlog produit - portefeuille", () => {
  beforeEach(resetDb);

  it("GET /api/wallet/transactions retourne l'historique des retraits", async () => {
    const seller = await makeUser("Seller", { sellerStatus: "approved" });
    const token = await makeSession(seller.id);

    const withdrawal = await request(app)
      .post("/api/wallet/withdrawals")
      .set("Authorization", bearer(token))
      .send({ amount: 5000, method: "wave", phone: "+221771112233" });
    expect(withdrawal.status).toBe(201);

    const history = await request(app)
      .get("/api/wallet/transactions")
      .set("Authorization", bearer(token));

    expect(history.status).toBe(200);
    expect(history.body.transactions).toHaveLength(1);
    expect(history.body.transactions[0]).toMatchObject({
      type: "debit",
      amount: 5000,
      method: "wave",
      status: "pending",
    });
  });
});
