import { type Request, type Response, type NextFunction } from "express";
import type { AuthUser, UserRole } from "../lib/auth";
import { getBearerToken } from "../lib/auth";
import { verifyAccessToken } from "../lib/jwtAuth";
import * as usersRepo from "../repos/users";
import { toAuthUser } from "../services/localAuth";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthUser {}

    interface Request {
      isAuthenticated(): this is AuthedRequest;
      user?: User;
    }

    export interface AuthedRequest {
      user: User;
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.isAuthenticated = function (this: Request) {
    return this.user != null;
  } as Request["isAuthenticated"];

  const bearer = getBearerToken(req);
  if (!bearer?.includes(".")) {
    next();
    return;
  }

  try {
    const payload = verifyAccessToken(bearer);
    const row = await usersRepo.findById(payload.sub);
    if (row?.tokenVersion !== payload.tv) {
      next();
      return;
    }
    req.user = toAuthUser(row);
    next();
  } catch {
    next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
