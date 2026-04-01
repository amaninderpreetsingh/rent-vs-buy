import { describe, it, expect } from "vitest";
import { calculateMonthlyMortgagePayment, calculateMortgageAmortizationForMonth } from "../mortgageUtils";

describe("calculateMonthlyMortgagePayment", () => {
  it("calculates standard 30yr 6% fixed correctly", () => {
    // $320,000 loan at 6% for 30 years
    const payment = calculateMonthlyMortgagePayment(320000, 6, 30);
    // Expected ~$1,918.56
    expect(payment).toBeCloseTo(1918.56, 0);
  });

  it("calculates 0% interest as simple division", () => {
    const payment = calculateMonthlyMortgagePayment(360000, 0, 30);
    // $360k / 360 months = $1,000
    expect(payment).toBe(1000);
  });

  it("higher interest means higher payment", () => {
    const low = calculateMonthlyMortgagePayment(300000, 3, 30);
    const high = calculateMonthlyMortgagePayment(300000, 7, 30);
    expect(high).toBeGreaterThan(low);
  });

  it("shorter term means higher payment", () => {
    const long = calculateMonthlyMortgagePayment(300000, 6, 30);
    const short = calculateMonthlyMortgagePayment(300000, 6, 15);
    expect(short).toBeGreaterThan(long);
  });
});

describe("calculateMortgageAmortizationForMonth", () => {
  it("first month is mostly interest", () => {
    const { principalPayment, interestPayment } = calculateMortgageAmortizationForMonth(
      320000, 6, 30, 1
    );
    expect(interestPayment).toBeGreaterThan(principalPayment);
    // First month interest should be ~$1,600 (320k * 6% / 12)
    expect(interestPayment).toBeCloseTo(1600, 0);
  });

  it("last month is mostly principal", () => {
    const { principalPayment, interestPayment } = calculateMortgageAmortizationForMonth(
      320000, 6, 30, 360
    );
    expect(principalPayment).toBeGreaterThan(interestPayment);
  });

  it("remaining balance reaches ~0 at final month", () => {
    const { remainingBalance } = calculateMortgageAmortizationForMonth(
      320000, 6, 30, 360
    );
    expect(remainingBalance).toBeCloseTo(0, 0);
  });

  it("returns zeros for months beyond loan term", () => {
    const result = calculateMortgageAmortizationForMonth(320000, 6, 30, 361);
    expect(result.principalPayment).toBe(0);
    expect(result.interestPayment).toBe(0);
    expect(result.remainingBalance).toBe(0);
  });

  it("principal + interest equals monthly payment", () => {
    const { principalPayment, interestPayment } = calculateMortgageAmortizationForMonth(
      320000, 6, 30, 1
    );
    const monthlyPayment = calculateMonthlyMortgagePayment(320000, 6, 30);
    expect(principalPayment + interestPayment).toBeCloseTo(monthlyPayment, 2);
  });

  it("handles 0% interest correctly", () => {
    const { principalPayment, interestPayment, remainingBalance } =
      calculateMortgageAmortizationForMonth(360000, 0, 30, 1);
    expect(principalPayment).toBe(1000);
    expect(interestPayment).toBe(0);
    expect(remainingBalance).toBeCloseTo(359000, 0);
  });
});
