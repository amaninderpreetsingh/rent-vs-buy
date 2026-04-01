import { describe, it, expect } from "vitest";
import { calculateComparison } from "../calculationEngine";
import { FormData } from "../../types";
import { defaultFormData } from "../../defaults";

const makeFormData = (overrides: Partial<{
  general: Partial<FormData["general"]>;
  buying: Partial<FormData["buying"]>;
  renting: Partial<FormData["renting"]>;
  investment: Partial<FormData["investment"]>;
}>): FormData => ({
  general: { ...defaultFormData.general, ...overrides.general },
  buying: { ...defaultFormData.buying, ...overrides.buying },
  renting: { ...defaultFormData.renting, ...overrides.renting },
  investment: { ...defaultFormData.investment, ...overrides.investment },
});

describe("calculateComparison", () => {
  describe("Year 0 bug regression", () => {
    it("Year 0 buying wealth should be much less than Year 30 buying wealth", () => {
      const results = calculateComparison(defaultFormData);
      const year0 = results.yearlyComparisons[0];
      const year30 = results.yearlyComparisons[30];

      expect(year0.buyingWealth).toBeLessThan(year30.buyingWealth);
      // Year 0 should roughly equal down payment equity + initial investment
      // Default: 400k house, 20% down = 80k equity, no extra savings
      expect(year0.buyingWealth).toBeCloseTo(80000, -2);
    });

    it("Year 0 renting wealth should be less than Year 30 renting wealth when renting is better", () => {
      const results = calculateComparison(defaultFormData);
      const year0 = results.yearlyComparisons[0];
      const yearN = results.yearlyComparisons[results.yearlyComparisons.length - 1];

      // Renting wealth should grow over time (investments compound)
      expect(year0.rentingWealth).toBeLessThan(yearN.rentingWealth);
    });

    it("Year 0 values represent only initial state, no compounding", () => {
      const results = calculateComparison(defaultFormData);
      const buyingYear0 = results.buyingResults[0];
      const rentingYear0 = results.rentingResults[0];

      // No investment earnings in Year 0
      expect(buyingYear0.investmentEarnings).toBe(0);
      expect(rentingYear0.investmentEarnings).toBe(0);

      // No mortgage costs in Year 0
      expect(buyingYear0.mortgagePayment).toBe(0);
      expect(rentingYear0.totalRent).toBe(0);
    });
  });

  describe("buying-better scenario", () => {
    it("identifies buying as better when rent is high and appreciation is high", () => {
      const formData = makeFormData({
        renting: { monthlyRent: 3500, annualRentIncrease: 5 },
        buying: { appreciationScenario: "high", housePrice: 400000, downPaymentPercent: 20, interestRate: 4 },
        investment: { annualReturn: 7, capitalGainsTaxRate: 15 },
      });

      const results = calculateComparison(formData);
      expect(results.summary.betterOption).toBe("buying");
      expect(results.summary.finalBuyingWealth).toBeGreaterThan(results.summary.finalRentingWealth);
    });
  });

  describe("renting-better scenario", () => {
    it("identifies renting as better when rent is low and appreciation is low", () => {
      const formData = makeFormData({
        renting: { monthlyRent: 1000, annualRentIncrease: 2 },
        buying: { appreciationScenario: "low", housePrice: 500000, downPaymentPercent: 20, interestRate: 7 },
        investment: { annualReturn: 12, capitalGainsTaxRate: 15 },
      });

      const results = calculateComparison(formData);
      expect(results.summary.betterOption).toBe("renting");
      expect(results.summary.finalRentingWealth).toBeGreaterThan(results.summary.finalBuyingWealth);
    });
  });

  describe("wealth progression", () => {
    it("buying wealth generally increases over time", () => {
      const results = calculateComparison(defaultFormData);
      const comparisons = results.yearlyComparisons;

      // Year 0 should be less than midpoint, midpoint less than final
      expect(comparisons[0].buyingWealth).toBeLessThan(comparisons[15].buyingWealth);
      expect(comparisons[15].buyingWealth).toBeLessThan(comparisons[30].buyingWealth);
    });

    it("cumulative costs increase monotonically", () => {
      const results = calculateComparison(defaultFormData);
      for (let i = 1; i < results.yearlyComparisons.length; i++) {
        expect(results.yearlyComparisons[i].cumulativeBuyingCosts).toBeGreaterThanOrEqual(
          results.yearlyComparisons[i - 1].cumulativeBuyingCosts
        );
        expect(results.yearlyComparisons[i].cumulativeRentingCosts).toBeGreaterThanOrEqual(
          results.yearlyComparisons[i - 1].cumulativeRentingCosts
        );
      }
    });
  });

  describe("capital gains tax", () => {
    it("reduces final year wealth", () => {
      const formData = makeFormData({
        investment: { annualReturn: 10, capitalGainsTaxRate: 20 },
      });

      const results = calculateComparison(formData);
      // With defaults, renter invests the down payment and earns returns
      const finalRentingYear = results.rentingResults[formData.buying.loanTerm];

      expect(finalRentingYear.capitalGainsTaxPaid).toBeGreaterThan(0);
    });

    it("is zero when tax rate is 0%", () => {
      const formData = makeFormData({
        investment: { annualReturn: 10, capitalGainsTaxRate: 0 },
      });

      const results = calculateComparison(formData);
      const finalYear = results.buyingResults[formData.buying.loanTerm];

      expect(finalYear.capitalGainsTaxPaid).toBe(0);
    });
  });

  describe("useIncomeAndSavings modes", () => {
    it("without income: renter invests down payment amount", () => {
      const formData = makeFormData({
        general: { useIncomeAndSavings: false },
      });

      const results = calculateComparison(formData);
      const downPayment = formData.buying.housePrice * (formData.buying.downPaymentPercent / 100);

      // Year 0 renting wealth should equal the down payment amount
      expect(results.yearlyComparisons[0].rentingWealth).toBeCloseTo(downPayment, -1);
      // Year 0 buying wealth should be equity only (no extra savings)
      expect(results.yearlyComparisons[0].buyingWealth).toBeCloseTo(downPayment, -1);
    });

    it("with income: buyer invests savings minus down payment", () => {
      const formData = makeFormData({
        general: { useIncomeAndSavings: true, currentSavings: 200000 },
        buying: { housePrice: 400000, downPaymentPercent: 20 },
      });

      const results = calculateComparison(formData);
      // Down payment = 80k, leftover = 120k for buying investments
      // Renter keeps full 200k in investments
      expect(results.yearlyComparisons[0].buyingWealth).toBeCloseTo(80000 + 120000, -2);
      expect(results.yearlyComparisons[0].rentingWealth).toBeCloseTo(200000, -2);
    });
  });

  describe("edge cases (harden)", () => {
    it("handles 0% investment return", () => {
      const formData = makeFormData({
        investment: { annualReturn: 0, capitalGainsTaxRate: 15 },
      });

      const results = calculateComparison(formData);
      expect(results.yearlyComparisons).toHaveLength(31); // 0-30
      expect(results.summary.difference).toBeGreaterThanOrEqual(0);
    });

    it("handles 0% appreciation", () => {
      const formData = makeFormData({
        buying: { appreciationScenario: "custom", customAppreciationRate: 0 },
      });

      const results = calculateComparison(formData);
      // Home value should not change
      expect(results.buyingResults[30].homeValue).toBeCloseTo(
        results.buyingResults[0].homeValue, -1
      );
    });

    it("handles 100% down payment (no mortgage)", () => {
      const formData = makeFormData({
        buying: { downPaymentPercent: 100 },
      });

      const results = calculateComparison(formData);
      // No mortgage payments
      expect(results.buyingResults[1].mortgagePayment).toBeCloseTo(0, 0);
      expect(results.yearlyComparisons).toHaveLength(31);
    });

    it("handles 0% down payment (full loan)", () => {
      const formData = makeFormData({
        buying: { downPaymentPercent: 0 },
      });

      const results = calculateComparison(formData);
      // Full home price is the loan
      expect(results.buyingResults[0].loanBalance).toBe(formData.buying.housePrice);
      expect(results.yearlyComparisons).toHaveLength(31);
    });

    it("handles equal monthly costs", () => {
      // Set rent to roughly match buying monthly costs
      const formData = makeFormData({
        renting: { monthlyRent: 2500, annualRentIncrease: 0 },
        buying: { interestRate: 6, housePrice: 400000, downPaymentPercent: 20 },
        investment: { annualReturn: 0, capitalGainsTaxRate: 0 },
      });

      const results = calculateComparison(formData);
      expect(results.yearlyComparisons).toHaveLength(31);
    });
  });

  describe("structural integrity", () => {
    it("returns correct number of yearly comparisons", () => {
      const results = calculateComparison(defaultFormData);
      expect(results.yearlyComparisons).toHaveLength(defaultFormData.buying.loanTerm + 1);
    });

    it("summary matches final comparison entry", () => {
      const results = calculateComparison(defaultFormData);
      const final = results.yearlyComparisons[defaultFormData.buying.loanTerm];

      expect(results.summary.finalBuyingWealth).toBe(final.buyingWealth);
      expect(results.summary.finalRentingWealth).toBe(final.rentingWealth);
      expect(results.summary.difference).toBe(Math.abs(final.difference));
    });

    it("all yearly results have 12 monthly data points", () => {
      const results = calculateComparison(defaultFormData);
      for (let year = 0; year <= defaultFormData.buying.loanTerm; year++) {
        expect(results.buyingResults[year].monthlyData).toHaveLength(12);
        expect(results.rentingResults[year].monthlyData).toHaveLength(12);
      }
    });

    it("betterOption matches sign of difference", () => {
      const results = calculateComparison(defaultFormData);
      const final = results.yearlyComparisons[defaultFormData.buying.loanTerm];

      if (final.difference > 0) {
        expect(results.summary.betterOption).toBe("buying");
      } else if (final.difference < 0) {
        expect(results.summary.betterOption).toBe("renting");
      } else {
        expect(results.summary.betterOption).toBe("equal");
      }
    });
  });
});
