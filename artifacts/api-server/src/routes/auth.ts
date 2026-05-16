import * as oidc from "openid-client";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetCurrentAuthUserResponse,
  ExchangeMobileAuthorizationCodeBody,
  ExchangeMobileAuthorizationCodeResponse,
  LogoutMobileSessionResponse,
} from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  clearSession,
  getOidcConfig,
  getSessionId,
  createSession,
  deleteSession,
  SESSION_COOKIE,
  SESSION_TTL,
  ISSUER_URL,
  type SessionData,
} from "../lib/auth.js";
import { authRateLimit } from "../middlewares/rateLimiter.js";

const OIDC_COOKIE_TTL = 10 * 60 * 1000;
const router: IRouter = Router();

function getOrigin(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host =
    req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

function setOidcCookie(res: Response, name: string, value: string) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: OIDC_COOKIE_TTL,
  });
}

function getSafeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

async function upsertUser(claims: Record<string, unknown>) {
  const firstName = (claims.first_name as string) || null;
  const lastName = (claims.last_name as string) || null;
  const name = [firstName, lastName].filter(Boolean).join(" ") || null;

  const authData = {
    id: claims.sub as string,
    email: (claims.email as string) || null,
    firstName,
    lastName,
    profileImageUrl: ((claims.profile_image_url || claims.picture) as string) || null,
    name,
    updatedAt: new Date(),
  };

  const [user] = await db
    .insert(usersTable)
    .values({ ...authData, sellerStatus: "none" })
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        email: authData.email,
        firstName: authData.firstName,
        lastName: authData.lastName,
        profileImageUrl: authData.profileImageUrl,
        name: authData.name,
        updatedAt: authData.updatedAt,
      },
    })
    .returning();
  return user;
}

function buildSessionData(
  dbUser: typeof usersTable.$inferSelect,
  tokens: { access_token: string; refresh_token?: string; expiresIn: () => number | undefined },
  claimsExp?: number,
): SessionData {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = tokens.expiresIn();
  return {
    user: {
      id: dbUser.id,
      email: dbUser.email ?? null,
      firstName: dbUser.firstName ?? null,
      lastName: dbUser.lastName ?? null,
      profileImageUrl: dbUser.profileImageUrl ?? null,
      sellerStatus: (dbUser.sellerStatus as "none" | "pending" | "approved") ?? "none",
    },
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: expiresIn ? now + expiresIn : claimsExp,
  };
}

// ── Auth user endpoint ─────────────────────────────────────────────────────────

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

// ── Browser OIDC flow ──────────────────────────────────────────────────────────

router.get("/login", authRateLimit, async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const callbackUrl = `${getOrigin(req)}/api/callback`;
  const returnTo = getSafeReturnTo(req.query.returnTo);

  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const codeVerifier = oidc.randomPKCECodeVerifier();
  const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

  const redirectTo = oidc.buildAuthorizationUrl(config, {
    redirect_uri: callbackUrl,
    scope: "openid email profile offline_access",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    prompt: "login consent",
    state,
    nonce,
  });

  setOidcCookie(res, "code_verifier", codeVerifier);
  setOidcCookie(res, "nonce", nonce);
  setOidcCookie(res, "state", state);
  setOidcCookie(res, "return_to", returnTo);

  res.redirect(redirectTo.href);
});

// Query params are not validated because the OIDC provider may include
// parameters not expressed in the schema.
router.get("/callback", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const callbackUrl = `${getOrigin(req)}/api/callback`;

  const codeVerifier = req.cookies?.code_verifier;
  const nonce = req.cookies?.nonce;
  const expectedState = req.cookies?.state;

  if (!codeVerifier || !expectedState) {
    res.redirect("/api/login");
    return;
  }

  const currentUrl = new URL(
    `${callbackUrl}?${new URL(req.url, `http://${req.headers.host}`).searchParams}`,
  );

  let tokens: oidc.TokenEndpointResponse & oidc.TokenEndpointResponseHelpers;
  try {
    tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState,
      idTokenExpected: true,
    });
  } catch {
    res.redirect("/api/login");
    return;
  }

  const returnTo = getSafeReturnTo(req.cookies?.return_to);

  res.clearCookie("code_verifier", { path: "/" });
  res.clearCookie("nonce", { path: "/" });
  res.clearCookie("state", { path: "/" });
  res.clearCookie("return_to", { path: "/" });

  const claims = tokens.claims();
  if (!claims) {
    res.redirect("/api/login");
    return;
  }

  const dbUser = await upsertUser(claims as unknown as Record<string, unknown>);
  const sid = await createSession(buildSessionData(dbUser, tokens, claims.exp));
  setSessionCookie(res, sid);
  res.redirect(returnTo);
});

router.get("/logout", async (req: Request, res: Response) => {
  const config = await getOidcConfig();
  const origin = getOrigin(req);
  const sid = getSessionId(req);
  await clearSession(res, sid);

  const endSessionUrl = oidc.buildEndSessionUrl(config, {
    client_id: process.env.REPL_ID!,
    post_logout_redirect_uri: origin,
  });

  res.redirect(endSessionUrl.href);
});

// ── Mobile OIDC flow ───────────────────────────────────────────────────────────

router.post("/mobile-auth/token-exchange", authRateLimit, async (req: Request, res: Response) => {
  const parsed = ExchangeMobileAuthorizationCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid required parameters" });
    return;
  }

  const { code, code_verifier, redirect_uri, state, nonce } = parsed.data;

  try {
    const config = await getOidcConfig();

    const callbackUrl = new URL(redirect_uri);
    callbackUrl.searchParams.set("code", code);
    callbackUrl.searchParams.set("state", state);
    callbackUrl.searchParams.set("iss", ISSUER_URL);

    const tokens = await oidc.authorizationCodeGrant(config, callbackUrl, {
      pkceCodeVerifier: code_verifier,
      expectedNonce: nonce ?? undefined,
      expectedState: state,
      idTokenExpected: true,
    });

    const claims = tokens.claims();
    if (!claims) {
      res.status(401).json({ error: "No claims in ID token" });
      return;
    }

    const dbUser = await upsertUser(claims as unknown as Record<string, unknown>);
    const sid = await createSession(buildSessionData(dbUser, tokens, claims.exp));
    res.json(ExchangeMobileAuthorizationCodeResponse.parse({ token: sid }));
  } catch (err) {
    req.log.error({ err }, "Mobile token exchange error");
    res.status(500).json({ error: "Token exchange failed" });
  }
});

router.post("/mobile-auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  if (sid) await deleteSession(sid);
  res.json(LogoutMobileSessionResponse.parse({ success: true }));
});

// ── Seller status endpoints ────────────────────────────────────────────────────

/**
 * POST /users/me/seller-access
 * Request seller access — sets sellerStatus to 'pending'.
 * Requires authentication.
 */
router.post("/users/me/seller-access", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  await db
    .update(usersTable)
    .set({ sellerStatus: "pending", updatedAt: new Date() })
    .where(eq(usersTable.id, req.user.id));

  res.json({ sellerStatus: "pending" });
});

/**
 * POST /users/me/seller-access/approve
 * Approve seller access — sets sellerStatus to 'approved'.
 * In production this would be an admin-only endpoint; for the demo, any authenticated user can self-approve.
 */
router.post("/users/me/seller-access/approve", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  await db
    .update(usersTable)
    .set({ sellerStatus: "approved", updatedAt: new Date() })
    .where(eq(usersTable.id, req.user.id));

  // Update the session so the mobile app gets the updated status immediately.
  const sid = getSessionId(req);
  if (sid) {
    const [updatedUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user.id))
      .limit(1);
    if (updatedUser) {
      const sessionData = await import("../lib/auth.js").then((m) => m.getSession(sid));
      if (sessionData) {
        await import("../lib/auth.js").then((m) =>
          m.updateSession(sid, {
            ...sessionData,
            user: {
              ...sessionData.user,
              sellerStatus: "approved",
            },
          }),
        );
      }
    }
  }

  res.json({ sellerStatus: "approved" });
});

/**
 * POST /users/me/seller-access/reset
 * Reset seller status to 'none'. Used during testing/demo.
 */
router.post("/users/me/seller-access/reset", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  await db
    .update(usersTable)
    .set({ sellerStatus: "none", updatedAt: new Date() })
    .where(eq(usersTable.id, req.user.id));

  res.json({ sellerStatus: "none" });
});

export default router;
