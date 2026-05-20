import { db } from "@workspace/db";
import { walletsTable, walletWithdrawalsTable } from "@workspace/db/schema";
import { desc, eq } from "drizzle-orm";

export async function getOrCreateWallet(userId: string) {
  const [existing] = await db
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.userId, userId))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(walletsTable)
    .values({ userId })
    .returning();
  return created!;
}

export async function createWithdrawal(data: {
  userId: string;
  amount: string;
  method: string;
  phone: string;
}) {
  const [row] = await db.insert(walletWithdrawalsTable).values(data).returning();
  return row ?? null;
}

export async function listTransactions(userId: string) {
  return db
    .select()
    .from(walletWithdrawalsTable)
    .where(eq(walletWithdrawalsTable.userId, userId))
    .orderBy(desc(walletWithdrawalsTable.createdAt));
}
