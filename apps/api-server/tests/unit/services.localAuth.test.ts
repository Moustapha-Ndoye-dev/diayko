import { describe, it, expect, beforeEach } from "vitest";
import {
  registerUser,
  loginUser,
  refreshTokens,
  toAuthUser,
  issueTokensForUser,
} from "../../src/services/localAuth";
import { HttpError } from "../../src/middlewares/errorHandler";
import { verifyAccessToken } from "../../src/lib/jwtAuth";
import { resetDb, makeUser } from "../helpers/db";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  registerUserInput,
  VALID_TEST_CREDENTIAL,
  SHORT_TEST_CREDENTIAL,
} from "../helpers/authBodies";

describe("localAuth service", () => {
  beforeEach(resetDb);

  it("toAuthUser maps admin role and seller status", async () => {
    const row = await makeUser("Admin", { role: "admin", sellerStatus: "approved" });
    const auth = toAuthUser(row);
    expect(auth.role).toBe("admin");
    expect(auth.sellerStatus).toBe("approved");
    expect(auth.emailVerified).toBe(false);
  });

  it("issueTokensForUser produces verifiable access token", async () => {
    const row = await makeUser("Tok");
    const { accessToken } = issueTokensForUser(row);
    const payload = verifyAccessToken(accessToken);
    expect(payload.sub).toBe(row.id);
    expect(payload.tv).toBe(row.tokenVersion);
  });

  it("registerUser normalizes email and rejects duplicates", async () => {
    const first = await registerUser(
      registerUserInput("User@Example.com", VALID_TEST_CREDENTIAL, {
        firstName: "A",
        lastName: "B",
      }),
    );
    expect(first.user.email).toBe("user@example.com");

    await expect(
      registerUser(registerUserInput("USER@example.com")),
    ).rejects.toMatchObject({ status: 409 });
  });

  it("registerUser rejects invalid email and short password", async () => {
    await expect(registerUser(registerUserInput("bad"))).rejects.toMatchObject({
      status: 400,
    });

    await expect(
      registerUser(registerUserInput("ok@example.com", SHORT_TEST_CREDENTIAL)),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("loginUser rejects unknown email and wrong password", async () => {
    await registerUser(registerUserInput("login@example.com"));

    await expect(loginUser("login@example.com", "wrongpass")).rejects.toMatchObject({
      status: 401,
    });

    await expect(loginUser("missing@example.com", VALID_TEST_CREDENTIAL)).rejects.toMatchObject(
      {
        status: 401,
      },
    );
  });

  it("refreshTokens rejects invalid token and stale token version", async () => {
    const { refreshToken, user } = await registerUser(registerUserInput("refresh@example.com"));

    const rotated = await refreshTokens(refreshToken);
    expect(rotated.accessToken).toBeTruthy();

    await db
      .update(usersTable)
      .set({ tokenVersion: user.tokenVersion + 1 })
      .where(eq(usersTable.id, user.id));

    await expect(refreshTokens(refreshToken)).rejects.toMatchObject({ status: 401 });
  });

  it("refreshTokens rejects malformed JWT", async () => {
    await expect(refreshTokens("not-a-jwt")).rejects.toBeInstanceOf(HttpError);
  });
});
