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
  describe("Year 0 initial state", () => {
    it("Year 0 buying wealth should be much less than Year 30 buying wealth", () => {
      const results = calculateComparison(defaultFormData);
      const year0 = results.yearlyComparisons[0];
      const year30 = results.yearlyComparisons[30];
      expect(year0.buyingWealth).toBeLessThan(year30.buyingWealth);
    });

    it("Year 0 renting wealth should be less than Year 30 renting wealth", () => {
      const results = calculateComparison(defaultFormData);
      const year0 = results.yearlyComparisons[0];
      const yearN = results.yearlyComparisons[results.yearlyComparisons.length - 1];
      expect(year0.rentingWealth).toBeLessThan(yearN.rentingWealth);
    });

    it("Year 0 values represent only initial state, no compounding", () => {
      const results = calculateComparison(defaultFormData);
      const buyingYear0 = results.buyingResults[0];
      const rentingYear0 = results.rentingResults[0];
      expect(buyingYear0.investmentEarnings).toBe(0);
      expect(rentingYear0.investmentEarnings).toBe(0);
      expect(buyingYear0.mortgagePayment).toBe(0);
      expect(rentingYear0.totalRent).toBe(0);
    });

    it("Year 0 has empty monthly data", () => {
      const results = calculateComparison(defaultFormData);
      expect(results.buyingResults[0].monthlyData).toHaveLength(0);
      expect(results.rentingResults[0].monthlyData).toHaveLength(0);
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
    it("without income: renter invests down payment + closing costs", () => {
      const formData = makeFormData({
        general: { useIncomeAndSavings: false },
      });
      const results = calculateComparison(formData);
      const downPayment = formData.buying.housePrice * (formData.buying.downPaymentPercent / 100);
      const closingCosts = formData.buying.housePrice * (formData.buying.closingCostPercent / 100);
      expect(results.yearlyComparisons[0].rentingWealth).toBeCloseTo(downPayment + closingCosts, -1);
    });

    it("with income: buyer invests savings minus down payment minus closing costs", () => {
      const formData = makeFormData({
        general: { useIncomeAndSavings: true, currentSavings: 200000 },
        buying: { housePrice: 400000, downPaymentPercent: 20 },
      });
      const results = calculateComparison(formData);
      const downPayment = 80000;
      const closingCosts = 400000 * (formData.buying.closingCostPercent / 100);
      expect(results.yearlyComparisons[0].buyingWealth).toBeCloseTo(
        80000 + (200000 - downPayment - closingCosts), -2
      );
      expect(results.yearlyComparisons[0].rentingWealth).toBeCloseTo(200000, -2);
    });
  });

  describe("closing costs", () => {
    it("higher closing costs reduce buyer initial investment", () => {
      const low = calculateComparison(makeFormData({ buying: { closingCostPercent: 0 } }));
      const high = calculateComparison(makeFormData({ buying: { closingCostPercent: 5 } }));
      // With closing costs, renter has more to invest (gets the closing costs amount)
      expect(high.yearlyComparisons[0].rentingWealth).toBeGreaterThan(
        low.yearlyComparisons[0].rentingWealth
      );
    });

    it("selling costs reduce final buying wealth", () => {
      const noSelling = calculateComparison(makeFormData({ buying: { sellingCostPercent: 0 } }));
      const withSelling = calculateComparison(makeFormData({ buying: { sellingCostPercent: 6 } }));
      expect(withSelling.summary.finalBuyingWealth).toBeLessThan(noSelling.summary.finalBuyingWealth);
    });
  });

  describe("mortgage interest tax deduction", () => {
    it("tax deduction savings are positive when marginal rate > 0 and interest is high", () => {
      const formData = makeFormData({
        general: { filingStatus: "single" },
        buying: { marginalTaxRate: 24, interestRate: 6, housePrice: 500000, downPaymentPercent: 20 },
      });
      const results = calculateComparison(formData);
      // Year 1 should have tax savings (interest on $400K at 6% ≈ $24K, well above standard deduction)
      expect(results.buyingResults[1].taxDeductionSavings).toBeGreaterThan(0);
    });

    it("no tax savings when marginal rate is 0", () => {
      const formData = makeFormData({ buying: { marginalTaxRate: 0 } });
      const results = calculateComparison(formData);
      for (let y = 1; y <= formData.buying.loanTerm; y++) {
        expect(results.buyingResults[y].taxDeductionSavings).toBe(0);
      }
    });

    it("tax deduction increases buying wealth vs no deduction", () => {
      const withTax = calculateComparison(makeFormData({
        buying: { marginalTaxRate: 24, housePrice: 500000, downPaymentPercent: 20, interestRate: 6 },
      }));
      const noTax = calculateComparison(makeFormData({
        buying: { marginalTaxRate: 0, housePrice: 500000, downPaymentPercent: 20, interestRate: 6 },
      }));
      expect(withTax.summary.finalBuyingWealth).toBeGreaterThan(noTax.summary.finalBuyingWealth);
    });
  });

  describe("income tracking", () => {
    it("populates yearlyIncome when income is provided", () => {
      const formData = makeFormData({
        general: { useIncomeAndSavings: true, annualIncome: 100000, currentSavings: 100000 },
      });
      const results = calculateComparison(formData);
      expect(results.buyingResults[1].yearlyIncome).toBe(100000);
      expect(results.rentingResults[1].yearlyIncome).toBe(100000);
    });

    it("applies income growth rate", () => {
      const formData = makeFormData({
        general: {
          useIncomeAndSavings: true,
          annualIncome: 100000,
          currentSavings: 100000,
          incomeIncrease: true,
          annualIncomeGrowthRate: 5,
        },
      });
      const results = calculateComparison(formData);
      expect(results.buyingResults[2].yearlyIncome).toBeCloseTo(105000, -1);
    });

    it("does not populate yearlyIncome when toggle is off", () => {
      const formData = makeFormData({
        general: { useIncomeAndSavings: false, annualIncome: 100000 },
      });
      const results = calculateComparison(formData);
      expect(results.buyingResults[1].yearlyIncome).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("handles 0% investment return", () => {
      const formData = makeFormData({
        investment: { annualReturn: 0, capitalGainsTaxRate: 15 },
      });
      const results = calculateComparison(formData);
      expect(results.yearlyComparisons).toHaveLength(31);
      expect(results.summary.difference).toBeGreaterThanOrEqual(0);
    });

    it("handles 0% appreciation", () => {
      const formData = makeFormData({
        buying: { appreciationScenario: "custom", customAppreciationRate: 0 },
      });
      const results = calculateComparison(formData);
      expect(results.buyingResults[30].homeValue).toBeCloseTo(
        results.buyingResults[0].homeValue, -1
      );
    });

    it("handles 100% down payment (no mortgage)", () => {
      const formData = makeFormData({
        buying: { downPaymentPercent: 100 },
      });
      const results = calculateComparison(formData);
      expect(results.buyingResults[1].mortgagePayment).toBeCloseTo(0, 0);
      expect(results.yearlyComparisons).toHaveLength(31);
    });

    it("handles 0% down payment (full loan)", () => {
      const formData = makeFormData({
        buying: { downPaymentPercent: 0 },
      });
      const results = calculateComparison(formData);
      expect(results.buyingResults[0].loanBalance).toBe(formData.buying.housePrice);
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

    it("all active yearly results have 12 monthly data points", () => {
      const results = calculateComparison(defaultFormData);
      for (let year = 1; year <= defaultFormData.buying.loanTerm; year++) {
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
