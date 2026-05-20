import { describe, it, expect, beforeEach } from "vitest";
import {
  listItems,
  getItemDetail,
  createItem,
  updateItemOwned,
  deleteItemAsOwner,
  recordView,
  toggleLike,
} from "../../src/services/items";
import { resetDb, makeUser, makeItem } from "../helpers/db";

describe("items service", () => {
  beforeEach(resetDb);

  it("listItems paginates and sets hasMore", async () => {
    const seller = await makeUser("Seller");
    await makeItem(seller.id, { title: "A" });
    await makeItem(seller.id, { title: "B" });

    const page = await listItems({ page: 1, limit: 1 });
    expect(page.total).toBe(2);
    expect(page.items).toHaveLength(1);
    expect(page.hasMore).toBe(true);
  });

  it("getItemDetail includes seller", async () => {
    const seller = await makeUser("Aminata");
    const item = await makeItem(seller.id);
    const detail = await getItemDetail(item.id);
    expect(detail.seller.name).toBe("Aminata");
    expect(detail.images.length).toBeGreaterThan(0);
  });

  it("createItem persists images", async () => {
    const seller = await makeUser("Seller");
    const created = await createItem(seller.id, {
      title: "Robe",
      brand: "Diayko",
      price: 9000,
      size: "M",
      condition: "Good",
      category: "women",
      description: "Belle robe",
      images: ["https://example.com/a.jpg"],
    });
    expect(created.images).toEqual(["https://example.com/a.jpg"]);
  });

  it("updateItemOwned forbids strangers", async () => {
    const owner = await makeUser("Owner");
    const other = await makeUser("Other");
    const item = await makeItem(owner.id);

    const updated = await updateItemOwned(item.id, owner.id, { title: "New" });
    expect(updated.title).toBe("New");

    await expect(updateItemOwned(item.id, other.id, { title: "Hack" })).rejects.toMatchObject({
      status: 403,
    });
  });

  it("deleteItemAsOwner removes listing", async () => {
    const seller = await makeUser("Seller");
    const item = await makeItem(seller.id);
    await deleteItemAsOwner(item.id, seller.id);
    await expect(getItemDetail(item.id)).rejects.toMatchObject({ status: 404 });
  });

  it("recordView increments counter", async () => {
    const seller = await makeUser("Seller");
    const item = await makeItem(seller.id);
    const v1 = await recordView(item.id);
    const v2 = await recordView(item.id);
    expect(v1.viewsCount).toBe(1);
    expect(v2.viewsCount).toBe(2);
  });

  it("toggleLike adds then removes like", async () => {
    const seller = await makeUser("Seller");
    const liker = await makeUser("Liker");
    const item = await makeItem(seller.id);

    const on = await toggleLike(liker.id, item.id);
    expect(on).toEqual({ liked: true, likesCount: 1 });

    const off = await toggleLike(liker.id, item.id);
    expect(off).toEqual({ liked: false, likesCount: 0 });
  });
});
