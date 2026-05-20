import { describe, it, expect, beforeEach } from "vitest";
import { createOrderReview, listSellerReviews } from "../../src/services/reviews";
import { createOrder, updateOrderStatus } from "../../src/services/orders";
import { resetDb, makeUser, makeItem } from "../helpers/db";

async function deliveredOrder() {
  const seller = await makeUser("Seller");
  const buyer = await makeUser("Buyer");
  const item = await makeItem(seller.id);
  const order = await createOrder(buyer.id, { itemId: item.id, paymentMethod: "wave" });
  await updateOrderStatus(order.id, seller.id, "delivered");
  return { seller, buyer, order };
}

describe("reviews service", () => {
  beforeEach(resetDb);

  it("createOrderReview stores review after delivery", async () => {
    const { buyer, order, seller } = await deliveredOrder();

    const rev = await createOrderReview(order.id, buyer.id, 5, "Top");
    expect(rev.rating).toBe(5);

    const list = await listSellerReviews(seller.id, 1, 20);
    expect(list.total).toBe(1);
  });

  it("createOrderReview rejects duplicate and wrong buyer", async () => {
    const { buyer, order } = await deliveredOrder();
    const stranger = await makeUser("Stranger");

    await createOrderReview(order.id, buyer.id, 4, null);

    await expect(createOrderReview(order.id, buyer.id, 3, null)).rejects.toMatchObject({
      status: 409,
    });

    await expect(createOrderReview(order.id, stranger.id, 5, null)).rejects.toMatchObject({
      status: 403,
    });
  });

  it("createOrderReview rejects before delivery", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const order = await createOrder(buyer.id, { itemId: item.id, paymentMethod: "wave" });

    await expect(createOrderReview(order.id, buyer.id, 5, null)).rejects.toMatchObject({
      status: 400,
    });

    await expect(createOrderReview(order.id, buyer.id, 0, null)).rejects.toMatchObject({
      status: 400,
    });
  });
});
