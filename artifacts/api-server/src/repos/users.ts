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

export async function deleteUserAndSessions(userId: string): Promise<void> {
  await db
    .delete(sessionsTable)
    .where(
      sql`${sessionsTable.sess}->>'user' IS NOT NULL AND ${sessionsTable.sess}->'user'->>'id' = ${userId}`,
    );
  await db.delete(usersTable).where(eq(usersTable.id, userId));
}
