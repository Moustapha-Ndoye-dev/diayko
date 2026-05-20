import { describe, expect, it } from "vitest";
import { isCorsOriginAllowed, resolveSecurityConfig } from "../../src/lib/security";

describe("security config", () => {
  it("autorise tous les origins en developpement", () => {
    expect(
      isCorsOriginAllowed("https://preview.diayko.local", {
        nodeEnv: "development",
        corsOrigins: "",
      }),
    ).toBe(true);
  });

  it("restreint CORS en production a la liste configuree", () => {
    const env = {
      nodeEnv: "production",
      corsOrigins: "https://app.diayko.sn, https://admin.diayko.sn",
    };

    expect(isCorsOriginAllowed("https://app.diayko.sn", env)).toBe(true);
    expect(isCorsOriginAllowed("https://evil.example", env)).toBe(false);
  });

  it("demande un JWT_SECRET fort en production", () => {
    expect(() =>
      resolveSecurityConfig({
        nodeEnv: "production",
        jwtSecret: "short-secret",
        corsOrigins: "https://app.diayko.sn",
      }),
    ).toThrow("JWT_SECRET");
  });
});
