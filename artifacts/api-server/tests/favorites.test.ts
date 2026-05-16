import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, makeItem, makeSession, bearer } from "./helpers/db";

describe("Favorites API", () => {
  beforeEach(resetDb);

  it("returns an empty list when the user has liked nothing", async () => {
    const u = await makeUser("U");
    const sid = await makeSession(u.id);
    const res = await request(app)
      .get(`/api/me/favorites`)
      .set("Authorization", bearer(sid));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: [], ids: [] });
  });

  it("lists items the authed user has liked", async () => {
    const seller = await makeUser("Seller");
    const liker = await makeUser("Liker");
    const likerSid = await makeSession(liker.id);
    const a = await makeItem(seller.id, { title: "Liked" });
    await makeItem(seller.id, { title: "Not liked" });

    await request(app)
      .post(`/api/items/${a.id}/like`)
      .set("Authorization", bearer(likerSid));

    const res = await request(app)
      .get(`/api/me/favorites`)
      .set("Authorization", bearer(likerSid));
    expect(res.status).toBe(200);
    expect(res.body.ids).toEqual([a.id]);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].title).toBe("Liked");
    expect(res.body.items[0].images).toHaveLength(1);
  });

  it("removes from favorites when unliked", async () => {
    const seller = await makeUser("Seller");
    const liker = await makeUser("Liker");
    const likerSid = await makeSession(liker.id);
    const item = await makeItem(seller.id);

    await request(app).post(`/api/items/${item.id}/like`).set("Authorization", bearer(likerSid));
    await request(app).post(`/api/items/${item.id}/like`).set("Authorization", bearer(likerSid));

    const res = await request(app)
      .get(`/api/me/favorites`)
      .set("Authorization", bearer(likerSid));
    expect(res.body.ids).toEqual([]);
  });

  it("returns 401 when not authenticated", async () => {
    const res = await request(app).get(`/api/me/favorites`);
    expect(res.status).toBe(401);
  });
});
