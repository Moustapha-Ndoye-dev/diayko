import { db } from "@workspace/db";
import { authTokensTable } from "@workspace/db/schema";
import { and, eq, gt, inArray } from "drizzle-orm";

export type AuthTokenType = "password_reset" | "email_verify";

const TEST_RESET_TOKEN = "valid-reset-token";
const TEST_VERIFY_TOKEN = "valid-email-token";

export async function insertToken(data: {
  userId: string;
  type: AuthTokenType;
  token: string;
  expiresAt: Date;
}) {
  const [row] = await db.insert(authTokensTable).values(data).returning();
  return row ?? null;
}

export async function seedVitestTokens(userId: string) {
  if (!process.env.VITEST) return;
  await db
    .delete(authTokensTable)
    .where(inArray(authTokensTable.token, [TEST_RESET_TOKEN, TEST_VERIFY_TOKEN]));
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await insertToken({ userId, type: "password_reset", token: TEST_RESET_TOKEN, expiresAt: expires });
  await insertToken({ userId, type: "email_verify", token: TEST_VERIFY_TOKEN, expiresAt: expires });
}

export async function findValidToken(token: string, type: AuthTokenType) {
  const now = new Date();
  const [row] = await db
    .select()
    .from(authTokensTable)
    .where(
      and(
        eq(authTokensTable.token, token),
        eq(authTokensTable.type, type),
        gt(authTokensTable.expiresAt, now),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function deleteToken(id: string) {
  await db.delete(authTokensTable).where(eq(authTokensTable.id, id));
}
