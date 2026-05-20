import jwt from "jsonwebtoken";
import type { JwtPayload as LibJwtPayload } from "jsonwebtoken";
import { validateJwtSecret } from "./security";

export type TokenKind = "access" | "refresh";

export interface DiaykoJwtPayload {
  sub: string;
  tv: number;
  typ: TokenKind;
}

function getSecret(): string {
  return validateJwtSecret(process.env.JWT_SECRET);
}

export function signAccessToken(userId: string, tokenVersion: number): string {
  return jwt.sign({ sub: userId, tv: tokenVersion, typ: "access" }, getSecret(), {
    expiresIn: "15m",
  });
}

export function signRefreshToken(userId: string, tokenVersion: number): string {
  return jwt.sign({ sub: userId, tv: tokenVersion, typ: "refresh" }, getSecret(), {
    expiresIn: "7d",
  });
}

function verifyTyped(
  token: string,
  expectedTyp: TokenKind,
): Pick<LibJwtPayload, "sub"> & DiaykoJwtPayload {
  const decoded = jwt.verify(token, getSecret()) as LibJwtPayload & Partial<DiaykoJwtPayload>;
  if (
    decoded.typ !== expectedTyp ||
    typeof decoded.sub !== "string" ||
    typeof decoded.tv !== "number"
  ) {
    throw new jwt.JsonWebTokenError("invalid token shape");
  }
  return {
    ...decoded,
    sub: decoded.sub,
    tv: decoded.tv,
    typ: expectedTyp,
  };
}

export function verifyAccessToken(token: string) {
  return verifyTyped(token, "access");
}

export function verifyRefreshToken(token: string) {
  return verifyTyped(token, "refresh");
}
