import * as client from "openid-client";
import crypto from "crypto";
import { type Request, type Response } from "express";
import { db, sessionsTable, usersTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";

export const ISSUER_URL = process.env.ISSUER_URL ?? "https://replit.com/oidc";
export const SESSION_COOKIE = "sid";
export const SESSION_TTL = 7 * 24 * 60 * 60 * 1000;

export interface SessionData {
  userId: string;
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
}

let oidcConfig: client.Configuration | null = null;

export async function getOidcConfig(): Promise<client.Configuration> {
  if (!oidcConfig) {
    if (!process.env.REPL_ID) {
      throw new Error("REPL_ID env var is required for Replit Auth");
    }
    oidcConfig = await client.discovery(
      new URL(ISSUER_URL),
      process.env.REPL_ID,
    );
  }
  return oidcConfig;
}

export async function createSession(data: SessionData): Promise<string> {
  const sid = crypto.randomBytes(32).toString("hex");
  await db.insert(sessionsTable).values({
    sid,
    sess: data as unknown as Record<string, unknown>,
    expire: new Date(Date.now() + SESSION_TTL),
  });
  return sid;
}

export async function getSession(sid: string): Promise<SessionData | null> {
  const [row] = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.sid, sid));

  if (!row || row.expire < new Date()) {
    if (row) await deleteSession(sid);
    return null;
  }

  return row.sess as unknown as SessionData;
}

export async function updateSession(
  sid: string,
  data: SessionData,
): Promise<void> {
  await db
    .update(sessionsTable)
    .set({
      sess: data as unknown as Record<string, unknown>,
      expire: new Date(Date.now() + SESSION_TTL),
    })
    .where(eq(sessionsTable.sid, sid));
}

export async function deleteSession(sid: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.sid, sid));
}

export async function clearSession(
  res: Response,
  sid?: string,
): Promise<void> {
  if (sid) await deleteSession(sid);
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

export function getSessionId(req: Request): string | undefined {
  const authHeader = req.headers["authorization"];
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return req.cookies?.[SESSION_COOKIE];
}

export async function loadUser(userId: string): Promise<User | null> {
  const [row] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  return row ?? null;
}

export async function upsertUserFromClaims(
  claims: Record<string, unknown>,
): Promise<User> {
  const sub = String(claims.sub);
  const email = (claims.email as string | undefined) ?? null;
  const firstName = (claims.first_name as string | undefined) ?? null;
  const lastName = (claims.last_name as string | undefined) ?? null;
  const profileImageUrl =
    (claims.profile_image_url as string | undefined) ??
    (claims.picture as string | undefined) ??
    null;
  const displayName =
    [firstName, lastName].filter(Boolean).join(" ").trim() ||
    email ||
    "Utilisateur";

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.subId, sub))
    .limit(1);

  if (existing[0]) {
    const [updated] = await db
      .update(usersTable)
      .set({
        email,
        firstName,
        lastName,
        profileImageUrl,
      })
      .where(eq(usersTable.id, existing[0].id))
      .returning();
    return updated!;
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      subId: sub,
      email,
      firstName,
      lastName,
      profileImageUrl,
      name: displayName,
    })
    .returning();
  return created!;
}
