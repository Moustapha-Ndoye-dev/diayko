import * as repo from "../repos/wallets";
import { HttpError } from "../middlewares/errorHandler";

export async function getWallet(userId: string) {
  const wallet = await repo.getOrCreateWallet(userId);
  return {
    currency: wallet.currency,
    available: Number(wallet.available),
    pending: Number(wallet.pending),
  };
}

export async function requestWithdrawal(
  userId: string,
  data: { amount: number; method: string; phone: string },
) {
  if (data.amount <= 0) throw new HttpError(400, "Amount must be positive");
  const withdrawal = await repo.createWithdrawal({
    userId,
    amount: String(data.amount),
    method: data.method,
    phone: data.phone,
  });
  if (!withdrawal) throw new HttpError(500, "Failed to create withdrawal");
  return withdrawal;
}

export async function listTransactions(userId: string) {
  const withdrawals = await repo.listTransactions(userId);
  return {
    transactions: withdrawals.map((row) => ({
      id: row.id,
      type: "debit" as const,
      label: "Retrait portefeuille",
      amount: Number(row.amount),
      method: row.method,
      status: row.status,
      createdAt: row.createdAt,
    })),
  };
}
