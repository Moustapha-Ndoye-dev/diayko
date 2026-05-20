import { db } from "@workspace/db";
import { usersTable, sessionsTable } from "@workspace/db/schema";
import { eq, sql } from "drizzle-orm";

export type User = typeof usersTable.$inferSelect;

export async function findById(id: string): Promise<User | null> {
  const rows = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function findByEmail(email: string): Promise<User | null> {
  const normalized = email.trim().toLowerCase();
  const [row] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalized))
    .limit(1);
  return row ?? null;
}

export async function insertUser(row: typeof usersTable.$inferInsert): Promise<User> {
  const [u] = await db.insert(usersTable).values(row).returning();
  if (!u) throw new Error("insert failed");
  return u;
}

export async function incrementTokenVersion(id: string): Promise<void> {
  await db
    .update(usersTable)
    .set({
      tokenVersion: sql`${usersTable.tokenVersion} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, id));
}

export async function updateSellerStatus(
  userId: string,
  sellerStatus: "none" | "pending" | "approved",
): Promise<User | null> {
  const [user] = await db
    .update(usersTable)
    .set({ sellerStatus, updatedAt: new Date() })
    .where(eq(usersTable.id, userId))
    .returning();
  return user ?? null;
}

export async function updateProfile(
  id: string,
  fields: { name?: string; bio?: string | null },
): Promise<User | null> {
  const setFields: Record<string, unknown> = { updatedAt: new Date() };
  if (fields.name !== undefined) setFields.name = fields.name;
  if (fields.bio !== undefined) setFields.bio = fields.bio ?? null;

  const [user] = await db
    .update(usersTable)
    .set(setFields)
    .where(eq(usersTable.id, id))
    .returning();
  return user ?? null;
}

export async function updatePasswordHash(userId: string, passwordHash: string) {
  const [user] = await db
    .update(usersTable)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(usersTable.id, userId))
    .returning();
  return user ?? null;
}

export async function setEmailVerified(userId: string) {
  const [user] = await db
    .update(usersTable)
    .set({ verified: true, updatedAt: new Date() })
    .where(eq(usersTable.id, userId))
    .returning();
  return user ?? null;
}

export async function listBySellerStatus(status: string) {
  return db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      sellerStatus: usersTable.sellerStatus,
    })
    .from(usersTable)
    .where(eq(usersTable.sellerStatus, status));
}

export async function deleteUserAndSessions(userId: string): Promise<void> {
  await db.delete(sessionsTable).where(
    sql`${sessionsTable.sess}->>'user' IS NOT NULL AND ${sessionsTable.sess}->'user'->>'id' = ${userId}`,
  );
  await db.delete(usersTable).where(eq(usersTable.id, userId));
}
