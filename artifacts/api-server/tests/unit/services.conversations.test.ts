import { describe, it, expect, beforeEach } from "vitest";
import {
  getInbox,
  createConversation,
  getMessages,
  sendMessage,
} from "../../src/services/conversations";
import { resetDb, makeUser, makeItem } from "../helpers/db";

describe("conversations service", () => {
  beforeEach(resetDb);

  it("createConversation rejects self-chat and seller mismatch", async () => {
    const user = await makeUser("Solo");
    await expect(
      createConversation(user.id, { sellerId: user.id }),
    ).rejects.toMatchObject({ status: 400 });

    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const item = await makeItem(seller.id);
    const other = await makeUser("Other seller");

    await expect(
      createConversation(buyer.id, { sellerId: other.id, itemId: item.id }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("sendMessage and getMessages update unread for recipient", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");

    const conv = await createConversation(buyer.id, {
      sellerId: seller.id,
      initialMessage: "Bonjour",
    });

    await sendMessage(conv.id, seller.id, "Reponse");

    const sellerInbox = await getInbox(seller.id);
    expect(sellerInbox[0].unreadCount).toBeGreaterThan(0);

    const msgs = await getMessages(conv.id, buyer.id, { limit: 10 });
    expect(msgs.some((m) => m.text === "Reponse")).toBe(true);

    const buyerInbox = await getInbox(buyer.id);
    expect(buyerInbox[0].unreadCount).toBe(0);
  });

  it("sendMessage rejects non-participants", async () => {
    const seller = await makeUser("Seller");
    const buyer = await makeUser("Buyer");
    const stranger = await makeUser("Stranger");

    const conv = await createConversation(buyer.id, { sellerId: seller.id });

    await expect(sendMessage(conv.id, stranger.id, "Hi")).rejects.toMatchObject({
      status: 403,
    });
  });
});
