import { describe, it, expect } from "vitest";
import { fcfa, serviceFee, sellerEarns } from "../../mobile/lib/currency";

describe("fcfa()", () => {
  it("formats whole numbers with narrow non-breaking spaces", () => {
    expect(fcfa(15000)).toBe("15\u202F000\u00A0FCFA");
    expect(fcfa(500)).toBe("500\u00A0FCFA");
    expect(fcfa(1234567)).toBe("1\u202F234\u202F567\u00A0FCFA");
  });

  it("rounds to whole FCFA (no decimals)", () => {
    expect(fcfa(1499.6)).toBe("1\u202F500\u00A0FCFA");
    expect(fcfa("999.4")).toBe("999\u00A0FCFA");
  });

  it("returns '—' for null/undefined/empty", () => {
    expect(fcfa(null)).toBe("—");
    expect(fcfa(undefined)).toBe("—");
    expect(fcfa("")).toBe("—");
  });
});

describe("serviceFee()", () => {
  it("applies 8% + 500 with a minimum of 500", () => {
    expect(serviceFee(10000)).toBe(1300);
    expect(serviceFee(100)).toBe(508);
    expect(serviceFee(0)).toBe(500);
  });
});

describe("sellerEarns()", () => {
  it("returns price minus service fee, never negative", () => {
    expect(sellerEarns(10000)).toBe(10000 - 1300);
    expect(sellerEarns(0)).toBe(0);
  });
});
