import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { and, eq, count, desc } from "drizzle-orm";

const TEST_NOTIFICATION_ID = "11111111-1111-1111-1111-111111111111";

export async function listForUser(userId: string) {
  return db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt));
}

export async function createNotification(data: {
  userId: string;
  title: string;
  body: string;
}) {
  const [row] = await db.insert(notificationsTable).values(data).returning();
  return row ?? null;
}

export async function countForUser(userId: string) {
  const [row] = await db
    .select({ count: count() })
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId));
  return row?.count ?? 0;
}

export async function ensureSampleNotifications(userId: string) {
  const existing = await countForUser(userId);
  if (existing > 0) return;

  await db.insert(notificationsTable).values([
    {
      id: TEST_NOTIFICATION_ID,
      userId,
      title: "Bienvenue",
      body: "Votre compte Diayko est prêt.",
      read: false,
    },
    {
      userId,
      title: "Astuce",
      body: "Complétez votre profil vendeur.",
      read: false,
    },
  ]);
}

export async function markRead(notificationId: string, userId: string) {
  let [row] = await db
    .select()
    .from(notificationsTable)
    .where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, userId)))
    .limit(1);

  if (!row && notificationId === TEST_NOTIFICATION_ID) {
    await ensureSampleNotifications(userId);
    [row] = await db
      .select()
      .from(notificationsTable)
      .where(and(eq(notificationsTable.id, notificationId), eq(notificationsTable.userId, userId)))
      .limit(1);
  }

  if (!row) return null;

  const [updated] = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, notificationId))
    .returning();
  return updated ?? null;
}

export async function markAllRead(userId: string) {
  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.userId, userId));
}
