import { describe, it, expect, beforeEach } from "vitest";
import {
  listOrders,
  getOrderDetail,
  createOrder,
  updateOrderStatus,
} from "../../src/services/orders";
import { resetDb, makeUser, makeItem } from "../helpers/db";

describe("orders service", () => {
  beforeEach(resetDb);

  it("createOrder builds timeline and rejects self-purchase", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id, { price: "12000" });

    const order = await createOrder(buyer.id, {
      itemId: item.id,
      paymentMethod: "wave",
    });
    expect(order.status).toBe("processing");
    expect(order.sellerId).toBe(seller.id);
    expect(order.trackingId).toMatch(/^DK-/);

    await expect(
      createOrder(seller.id, { itemId: item.id, paymentMethod: "wave" }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("listOrders filters by role", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    await createOrder(buyer.id, { itemId: item.id, paymentMethod: "wave" });

    const buyerList = await listOrders(buyer.id, { role: "buyer" });
    expect(buyerList.orders).toHaveLength(1);

    const sellerList = await listOrders(seller.id, { role: "seller" });
    expect(sellerList.orders).toHaveLength(1);
  });

  it("getOrderDetail hides order from non-participants", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const stranger = await makeUser("Stranger");
    const item = await makeItem(seller.id);
    const order = await createOrder(buyer.id, { itemId: item.id, paymentMethod: "wave" });

    const detail = await getOrderDetail(order.id, buyer.id);
    expect(detail.events.length).toBeGreaterThan(0);

    await expect(getOrderDetail(order.id, stranger.id)).rejects.toMatchObject({
      status: 404,
    });
  });

  it("updateOrderStatus advances timeline for seller", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const order = await createOrder(buyer.id, { itemId: item.id, paymentMethod: "wave" });

    const updated = await updateOrderStatus(order.id, seller.id, "in_transit");
    expect(updated.status).toBe("in_transit");
  });
});
