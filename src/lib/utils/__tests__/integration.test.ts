import { describe, it, expect } from "vitest";
import { calculateComparison } from "../calculationEngine";
import { defaultFormData } from "../../defaults";
import { FormData } from "../../types";

describe("integration: full calculation flow", () => {
  it("default inputs produce valid, fully-populated results", () => {
    const results = calculateComparison(defaultFormData);

    expect(results.yearlyComparisons).toBeDefined();
    expect(results.buyingResults).toBeDefined();
    expect(results.rentingResults).toBeDefined();
    expect(results.summary).toBeDefined();
    expect(results.finalInvestmentAmount).toBeDefined();

    expect(results.yearlyComparisons).toHaveLength(31);
    expect(results.buyingResults).toHaveLength(31);
    expect(results.rentingResults).toHaveLength(31);

    expect(results.summary.finalBuyingWealth).toBeGreaterThan(0);
    expect(results.summary.finalRentingWealth).toBeGreaterThan(0);
    expect(results.summary.difference).toBeGreaterThan(0);
    expect(["buying", "renting", "equal"]).toContain(results.summary.betterOption);
  });

  it("summary matches final yearlyComparison entry", () => {
    const results = calculateComparison(defaultFormData);
    const final = results.yearlyComparisons[30];

    expect(results.summary.finalBuyingWealth).toBe(final.buyingWealth);
    expect(results.summary.finalRentingWealth).toBe(final.rentingWealth);
    expect(results.summary.difference).toBe(Math.abs(final.difference));

    if (final.difference > 0) {
      expect(results.summary.betterOption).toBe("buying");
    } else if (final.difference < 0) {
      expect(results.summary.betterOption).toBe("renting");
    } else {
      expect(results.summary.betterOption).toBe("equal");
    }
  });

  it("year 0 through year N wealth shows reasonable progression", () => {
    const results = calculateComparison(defaultFormData);

    const year0Buying = results.yearlyComparisons[0].buyingWealth;
    const year10Buying = results.yearlyComparisons[10].buyingWealth;
    const year30Buying = results.yearlyComparisons[30].buyingWealth;

    expect(year0Buying).toBeLessThan(year10Buying);
    expect(year10Buying).toBeLessThan(year30Buying);

    const year0Renting = results.yearlyComparisons[0].rentingWealth;
    const year10Renting = results.yearlyComparisons[10].rentingWealth;
    const year30Renting = results.yearlyComparisons[30].rentingWealth;

    expect(year0Renting).toBeLessThan(year10Renting);
    expect(year10Renting).toBeLessThan(year30Renting);
  });

  it("all active yearly results have 12 monthly data points with non-negative values", () => {
    const results = calculateComparison(defaultFormData);

    for (let year = 1; year <= 30; year++) {
      const buyingYear = results.buyingResults[year];
      const rentingYear = results.rentingResults[year];

      expect(buyingYear.monthlyData).toHaveLength(12);
      expect(rentingYear.monthlyData).toHaveLength(12);

      for (const month of buyingYear.monthlyData) {
        expect(month.homeValue).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("changing inputs produces different results", () => {
    const results1 = calculateComparison(defaultFormData);

    const modifiedFormData: FormData = {
      ...defaultFormData,
      buying: { ...defaultFormData.buying, housePrice: 600000 },
    };
    const results2 = calculateComparison(modifiedFormData);

    expect(results1.summary.finalBuyingWealth).not.toBe(results2.summary.finalBuyingWealth);
  });

  it("buying-better scenario: high appreciation, high rent", () => {
    const formData: FormData = {
      general: { ...defaultFormData.general, useIncomeAndSavings: false },
      buying: {
        ...defaultFormData.buying,
        housePrice: 350000,
        downPaymentPercent: 20,
        interestRate: 4,
        appreciationScenario: "high",
      },
      renting: { monthlyRent: 3000, annualRentIncrease: 5 },
      investment: { annualReturn: 7, capitalGainsTaxRate: 15 },
    };

    const results = calculateComparison(formData);
    expect(results.summary.betterOption).toBe("buying");

    const year0 = results.yearlyComparisons[0];
    const year30 = results.yearlyComparisons[30];
    expect(year30.buyingWealth).toBeGreaterThan(year0.buyingWealth * 3);
  });

  it("renting-better scenario: expensive house, low appreciation, high investment return", () => {
    const formData: FormData = {
      general: { ...defaultFormData.general, useIncomeAndSavings: false },
      buying: {
        ...defaultFormData.buying,
        housePrice: 600000,
        downPaymentPercent: 20,
        interestRate: 7,
        appreciationScenario: "low",
      },
      renting: { monthlyRent: 1200, annualRentIncrease: 2 },
      investment: { annualReturn: 12, capitalGainsTaxRate: 15 },
    };

    const results = calculateComparison(formData);
    expect(results.summary.betterOption).toBe("renting");
  });

  it("with income and savings: both scenarios start with correct initial wealth", () => {
    const formData: FormData = {
      general: {
        ...defaultFormData.general,
        useIncomeAndSavings: true,
        currentSavings: 150000,
      },
      buying: { ...defaultFormData.buying, housePrice: 400000, downPaymentPercent: 20 },
      renting: defaultFormData.renting,
      investment: defaultFormData.investment,
    };

    const results = calculateComparison(formData);
    const closingCosts = 400000 * (formData.buying.closingCostPercent / 100);

    // Buyer: 80k equity + (150k - 80k - closingCosts) leftover
    expect(results.yearlyComparisons[0].buyingWealth).toBeCloseTo(150000 - closingCosts, -2);
    // Renter: all 150k invested
    expect(results.yearlyComparisons[0].rentingWealth).toBeCloseTo(150000, -2);
  });

  it("cumulative costs are consistent and monotonically increasing", () => {
    const results = calculateComparison(defaultFormData);

    let prevBuyingCosts = 0;
    let prevRentingCosts = 0;

    for (const comparison of results.yearlyComparisons) {
      expect(comparison.cumulativeBuyingCosts).toBeGreaterThanOrEqual(prevBuyingCosts);
      expect(comparison.cumulativeRentingCosts).toBeGreaterThanOrEqual(prevRentingCosts);
      prevBuyingCosts = comparison.cumulativeBuyingCosts;
      prevRentingCosts = comparison.cumulativeRentingCosts;
    }

    const finalComparison = results.yearlyComparisons[30];
    expect(finalComparison.cumulativeBuyingCosts).toBeGreaterThan(100000);
    expect(finalComparison.cumulativeRentingCosts).toBeGreaterThan(100000);
  });
});
