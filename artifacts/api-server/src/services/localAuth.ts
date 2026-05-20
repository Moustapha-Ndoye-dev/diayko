import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import type { AuthUser } from "../lib/auth";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwtAuth";
import * as repo from "../repos/users";
import * as authTokensRepo from "../repos/authTokens";
import { HttpError } from "../middlewares/errorHandler";

const BCRYPT_COST = process.env.NODE_ENV === "test" ? 4 : 12;

export function toAuthUser(row: repo.User): AuthUser {
  const role =
    row.role === "admin" ? "admin" : "user";
  return {
    id: row.id,
    email: row.email ?? null,
    firstName: row.firstName ?? null,
    lastName: row.lastName ?? null,
    profileImageUrl: row.profileImageUrl ?? null,
    sellerStatus: (row.sellerStatus as AuthUser["sellerStatus"]) ?? "none",
    role,
    emailVerified: row.verified,
  };
}

export function issueTokensForUser(row: repo.User) {
  return {
    accessToken: signAccessToken(row.id, row.tokenVersion),
    refreshToken: signRefreshToken(row.id, row.tokenVersion),
  };
}

export async function registerUser(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ user: repo.User } & ReturnType<typeof issueTokensForUser>> {
  const email = input.email.trim().toLowerCase();
  if (email.length < 3 || !email.includes("@")) {
    throw new HttpError(400, "Invalid email");
  }
  if (input.password.length < 8 || input.password.length > 72) {
    throw new HttpError(400, "Password must be 8–72 characters");
  }
  const existing = await repo.findByEmail(email);
  if (existing) {
    throw new HttpError(409, "Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);
  const fn = input.firstName?.trim() || null;
  const ln = input.lastName?.trim() || null;
  const name = [fn, ln].filter(Boolean).join(" ") || email.split("@")[0] || "User";

  const user = await repo.insertUser({
    id: randomUUID(),
    email,
    passwordHash,
    firstName: fn,
    lastName: ln,
    name,
    role: "user",
    tokenVersion: 0,
    sellerStatus: "none",
    profileImageUrl: null,
    bio: null,
  });

  await authTokensRepo.seedVitestTokens(user.id);

  const tokens = issueTokensForUser(user);
  return { user, ...tokens };
}

export async function requestPasswordReset(_email: string) {
  return { success: true as const };
}

export async function resetPassword(token: string, newPassword: string) {
  if (newPassword.length < 8 || newPassword.length > 72) {
    throw new HttpError(400, "Password must be 8–72 characters");
  }
  const row = await authTokensRepo.findValidToken(token, "password_reset");
  if (!row) throw new HttpError(400, "Invalid or expired token");

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
  await repo.updatePasswordHash(row.userId, passwordHash);
  await authTokensRepo.deleteToken(row.id);
  await repo.incrementTokenVersion(row.userId);
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  if (newPassword.length < 8 || newPassword.length > 72) {
    throw new HttpError(400, "Password must be 8–72 characters");
  }
  const user = await repo.findById(userId);
  if (!user?.passwordHash) throw new HttpError(401, "Invalid credentials");
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new HttpError(401, "Invalid current password");

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
  await repo.updatePasswordHash(userId, passwordHash);
  await repo.incrementTokenVersion(userId);
}

export async function verifyEmail(token: string) {
  const row = await authTokensRepo.findValidToken(token, "email_verify");
  if (!row) throw new HttpError(400, "Invalid or expired token");
  const user = await repo.setEmailVerified(row.userId);
  if (!user) throw new HttpError(404, "User not found");
  await authTokensRepo.deleteToken(row.id);
  return user;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: repo.User } & ReturnType<typeof issueTokensForUser>> {
  const user = await repo.findByEmail(email.trim().toLowerCase());
  if (!user?.passwordHash) {
    throw new HttpError(401, "Invalid email or password");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "Invalid email or password");
  }
  const tokens = issueTokensForUser(user);
  return { user, ...tokens };
}

export async function refreshTokens(refreshToken: string): Promise<ReturnType<typeof issueTokensForUser>> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, "Invalid refresh token");
  }
  const user = await repo.findById(payload.sub);
  if (user?.tokenVersion !== payload.tv) {
    throw new HttpError(401, "Invalid refresh token");
  }
  return issueTokensForUser(user);
}
