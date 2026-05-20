import { describe, expect, it } from "vitest";
import { censorMessage, hasCensoredContent } from "../../mobile/lib/censor";

describe("mobile contact censor", () => {
  it("redacts private contact details from chat messages", () => {
    const original =
      "Contacte moi sur awa@example.com, +221 77 123 45 67, https://example.com ou @awa.";

    const censored = censorMessage(original);

    expect(censored).not.toContain("awa@example.com");
    expect(censored).not.toContain("+221 77 123 45 67");
    expect(censored).not.toContain("https://example.com");
    expect(censored).not.toContain("@awa");
    expect(hasCensoredContent(original, censored)).toBe(true);
  });

  it("leaves normal marketplace messages untouched", () => {
    const original = "Bonjour, le sac vert est toujours disponible ?";
    const censored = censorMessage(original);

    expect(censored).toBe(original);
    expect(hasCensoredContent(original, censored)).toBe(false);
  });
});
