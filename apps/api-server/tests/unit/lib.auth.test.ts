import { describe, it, expect } from "vitest";
import type { Request } from "express";
import { getBearerToken } from "../../src/lib/auth";

function reqWithAuth(value?: string): Request {
  return {
    headers: value === undefined ? {} : { authorization: value },
  } as Request;
}

describe("getBearerToken", () => {
  it("returns undefined when header is missing", () => {
    expect(getBearerToken(reqWithAuth())).toBeUndefined();
  });

  it("returns undefined for non-Bearer schemes", () => {
    expect(getBearerToken(reqWithAuth("Basic abc"))).toBeUndefined();
  });

  it("returns undefined for bare Bearer without token", () => {
    expect(getBearerToken(reqWithAuth("Bearer"))).toBeUndefined();
    expect(getBearerToken(reqWithAuth("Bearer "))).toBeUndefined();
  });

  it("extracts the token after Bearer", () => {
    expect(getBearerToken(reqWithAuth("Bearer jwt.token.here"))).toBe("jwt.token.here");
  });

  it("trims surrounding whitespace on the token", () => {
    expect(getBearerToken(reqWithAuth("Bearer   spaced  "))).toBe("spaced");
  });
});
