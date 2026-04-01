import { describe, it, expect } from "vitest";
import { calculateDownPayment, validateDownPayment, defaultFormData } from "../defaults";

describe("calculateDownPayment", () => {
  it("calculates 20% of $400k = $80k", () => {
    expect(calculateDownPayment(400000, 20)).toBe(80000);
  });

  it("calculates 0% = $0", () => {
    expect(calculateDownPayment(400000, 0)).toBe(0);
  });

  it("calculates 100% = full price", () => {
    expect(calculateDownPayment(400000, 100)).toBe(400000);
  });
});

describe("validateDownPayment", () => {
  it("returns null when not using personal savings", () => {
    expect(validateDownPayment(false, 0, 400000, 20)).toBeNull();
  });

  it("returns null when savings >= down payment", () => {
    expect(validateDownPayment(true, 100000, 400000, 20)).toBeNull();
  });

  it("returns error when savings < down payment", () => {
    const result = validateDownPayment(true, 50000, 400000, 20);
    expect(result).not.toBeNull();
    expect(result).toContain("50,000");
    expect(result).toContain("80,000");
  });

  it("returns null when savings exactly equal down payment", () => {
    expect(validateDownPayment(true, 80000, 400000, 20)).toBeNull();
  });
});

describe("defaultFormData", () => {
  it("has all required sections", () => {
    expect(defaultFormData.general).toBeDefined();
    expect(defaultFormData.buying).toBeDefined();
    expect(defaultFormData.renting).toBeDefined();
    expect(defaultFormData.investment).toBeDefined();
  });

  it("has reasonable default values", () => {
    expect(defaultFormData.buying.housePrice).toBeGreaterThan(0);
    expect(defaultFormData.renting.monthlyRent).toBeGreaterThan(0);
    expect(defaultFormData.buying.loanTerm).toBe(30);
  });
});
