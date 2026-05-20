import { describe, it, expect, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../src/lib/jwtAuth";

beforeEach(() => {
  process.env.JWT_SECRET ??= "vitest-jwt-secret-32-chars-min____________";
});

describe("jwtAuth helpers", () => {
  it("access round-trip preserves sub/tv and typ access", () => {
    const t = signAccessToken("11111111-1111-1111-1111-111111111111", 4);
    const p = verifyAccessToken(t);
    expect(p.sub).toBe("11111111-1111-1111-1111-111111111111");
    expect(p.tv).toBe(4);
    expect(p.typ).toBe("access");
  });

  it("refresh tokens cannot satisfy access verification", () => {
    const rt = signRefreshToken("22222222-2222-2222-2222-222222222222", 1);
    expect(() => verifyAccessToken(rt)).toThrow(jwt.JsonWebTokenError);
  });

  it("access tokens cannot satisfy refresh verification", () => {
    const at = signAccessToken("33333333-3333-3333-3333-333333333333", 0);
    expect(() => verifyRefreshToken(at)).toThrow(jwt.JsonWebTokenError);
  });
});
