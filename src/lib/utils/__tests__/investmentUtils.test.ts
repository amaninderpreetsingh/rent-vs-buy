import { describe, it, expect } from "vitest";
import { calculateInvestmentReturnForMonth, calculateCapitalGainsTax } from "../investmentUtils";

describe("calculateInvestmentReturnForMonth", () => {
  it("calculates monthly return on 10% annual for $10,000", () => {
    const monthlyReturn = calculateInvestmentReturnForMonth(10000, 10);
    // Monthly rate = (1.10)^(1/12) - 1 ≈ 0.007974
    // Return = 10000 * 0.007974 ≈ $79.74
    expect(monthlyReturn).toBeCloseTo(79.74, 0);
  });

  it("returns 0 for 0% annual return", () => {
    expect(calculateInvestmentReturnForMonth(10000, 0)).toBe(0);
  });

  it("returns 0 for $0 invested", () => {
    expect(calculateInvestmentReturnForMonth(0, 10)).toBe(0);
  });

  it("higher return rate produces higher monthly return", () => {
    const low = calculateInvestmentReturnForMonth(10000, 5);
    const high = calculateInvestmentReturnForMonth(10000, 15);
    expect(high).toBeGreaterThan(low);
  });

  it("12 months of compounding approximates annual rate", () => {
    let balance = 10000;
    for (let i = 0; i < 12; i++) {
      balance += calculateInvestmentReturnForMonth(balance, 10);
    }
    // Should be close to 10000 * 1.10 = 11000
    expect(balance).toBeCloseTo(11000, -1);
  });
});

describe("calculateCapitalGainsTax", () => {
  it("calculates 15% tax on $10,000 gain", () => {
    expect(calculateCapitalGainsTax(10000, 15)).toBe(1500);
  });

  it("returns 0 for 0% tax rate", () => {
    expect(calculateCapitalGainsTax(10000, 0)).toBe(0);
  });

  it("returns 0 for $0 gains", () => {
    expect(calculateCapitalGainsTax(0, 15)).toBe(0);
  });
});
