import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import { resetDb, makeUser, makeSession, bearer } from "./helpers/db";

describe("Admin API (integration)", () => {
  beforeEach(resetDb);

  it("returns 404 when user id does not exist", async () => {
    const admin = await makeUser("Admin", { role: "admin" });
    const token = await makeSession(admin.id);

    const res = await request(app)
      .post("/api/admin/users/00000000-0000-0000-0000-000000000000/seller-status")
      .set("Authorization", bearer(token))
      .send({ sellerStatus: "approved" });

    expect(res.status).toBe(404);
  });

  it("rejects invalid sellerStatus body", async () => {
    const admin = await makeUser("Admin", { role: "admin" });
    const seller = await makeUser("Seller");
    const token = await makeSession(admin.id);

    const res = await request(app)
      .post(`/api/admin/users/${seller.id}/seller-status`)
      .set("Authorization", bearer(token))
      .send({ sellerStatus: "hacker" });

    expect(res.status).toBe(400);
  });

  it("requires admin role", async () => {
    const user = await makeUser("User");
    const seller = await makeUser("Seller", { sellerStatus: "pending" });
    const token = await makeSession(user.id);

    const res = await request(app)
      .post(`/api/admin/users/${seller.id}/seller-status`)
      .set("Authorization", bearer(token))
      .send({ sellerStatus: "approved" });

    expect(res.status).toBe(403);
  });
});
