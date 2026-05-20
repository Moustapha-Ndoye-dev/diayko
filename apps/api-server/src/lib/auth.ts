import type { Request } from "express";

export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  sellerStatus: "none" | "pending" | "approved";
  role: UserRole;
  emailVerified: boolean;
}

/** Raw token from Authorization header (JWT access or legacy tests). */
export function getBearerToken(req: Request): string | undefined {
  const raw = req.headers.authorization;
  if (typeof raw !== "string" || !raw.startsWith("Bearer ")) return undefined;
  return raw.slice(7).trim() || undefined;
}
