import { describe, it, expect, beforeEach } from "vitest";
import {
  getProfile,
  updateProfile,
  deleteAccount,
  toPublicUser,
} from "../../src/services/users";
import { resetDb, makeUser } from "../helpers/db";

describe("users service", () => {
  beforeEach(resetDb);

  it("toPublicUser strips passwordHash", async () => {
    const row = await makeUser("Secret", { passwordHash: "hash" });
    const pub = toPublicUser(row);
    expect(pub).not.toHaveProperty("passwordHash");
    expect(pub.name).toBe("Secret");
  });

  it("getProfile returns public user or 404", async () => {
    const u = await makeUser("Visible");
    const profile = await getProfile(u.id);
    expect(profile.id).toBe(u.id);

    await expect(getProfile("00000000-0000-0000-0000-000000000000")).rejects.toMatchObject({
      status: 404,
    });
  });

  it("updateProfile persists name and bio", async () => {
    const u = await makeUser("Old");
    const updated = await updateProfile(u.id, { name: "New", bio: "Bio" });
    expect(updated.name).toBe("New");
    expect(updated.bio).toBe("Bio");
  });

  it("deleteAccount removes the user row", async () => {
    const u = await makeUser("Gone");
    await deleteAccount(u.id);
    await expect(getProfile(u.id)).rejects.toMatchObject({ status: 404 });
  });
});
