import { describe, it, expect } from "vitest";
import { calculateBuyingYearlyData } from "../buyingCalculator";
import { defaultBuying } from "../../defaults";

describe("calculateBuyingYearlyData", () => {
  const defaultResult = () => calculateBuyingYearlyData({ buying: defaultBuying });

  describe("Year 0 (initial state)", () => {
    it("home value equals purchase price", () => {
      const { buyingResults } = defaultResult();
      expect(buyingResults[0].homeValue).toBe(defaultBuying.housePrice);
    });

    it("equity equals down payment", () => {
      const { buyingResults } = defaultResult();
      const downPayment = defaultBuying.housePrice * (defaultBuying.downPaymentPercent / 100);
      expect(buyingResults[0].homeEquity).toBe(downPayment);
    });

    it("all costs are zero", () => {
      const { buyingResults } = defaultResult();
      expect(buyingResults[0].mortgagePayment).toBe(0);
      expect(buyingResults[0].propertyTaxes).toBe(0);
      expect(buyingResults[0].homeInsurance).toBe(0);
      expect(buyingResults[0].maintenanceCosts).toBe(0);
    });

    it("has 12 monthly data points", () => {
      const { buyingResults } = defaultResult();
      expect(buyingResults[0].monthlyData).toHaveLength(12);
    });
  });

  describe("year-over-year progression", () => {
    it("home value appreciates each year", () => {
      const { buyingResults } = defaultResult();
      for (let y = 1; y < buyingResults.length; y++) {
        expect(buyingResults[y].homeValue).toBeGreaterThan(buyingResults[y - 1].homeValue);
      }
    });

    it("loan balance decreases each year", () => {
      const { buyingResults } = defaultResult();
      for (let y = 1; y < buyingResults.length; y++) {
        expect(buyingResults[y].loanBalance).toBeLessThan(buyingResults[y - 1].loanBalance);
      }
    });

    it("equity increases each year", () => {
      const { buyingResults } = defaultResult();
      for (let y = 1; y < buyingResults.length; y++) {
        expect(buyingResults[y].homeEquity).toBeGreaterThan(buyingResults[y - 1].homeEquity);
      }
    });
  });

  describe("monthly data integrity", () => {
    it("each year has exactly 12 monthly entries", () => {
      const { buyingResults } = defaultResult();
      for (const yearResult of buyingResults) {
        expect(yearResult.monthlyData).toHaveLength(12);
      }
    });

    it("yearly mortgage equals sum of 12 monthly payments", () => {
      const { buyingResults } = defaultResult();
      for (let y = 1; y <= defaultBuying.loanTerm; y++) {
        const monthlySum = buyingResults[y].monthlyData.reduce(
          (sum, m) => sum + m.mortgagePayment, 0
        );
        expect(buyingResults[y].mortgagePayment).toBeCloseTo(monthlySum, 2);
      }
    });
  });

  describe("final year", () => {
    it("loan balance reaches ~0 at end of term", () => {
      const { buyingResults } = defaultResult();
      expect(buyingResults[defaultBuying.loanTerm].loanBalance).toBeCloseTo(0, 0);
    });

    it("returns correct number of yearly results", () => {
      const { buyingResults } = defaultResult();
      expect(buyingResults).toHaveLength(defaultBuying.loanTerm + 1); // 0-30
    });
  });

  describe("0% appreciation", () => {
    it("home value stays constant", () => {
      const { buyingResults } = calculateBuyingYearlyData({
        buying: { ...defaultBuying, appreciationScenario: "custom", customAppreciationRate: 0 },
      });
      expect(buyingResults[30].homeValue).toBeCloseTo(defaultBuying.housePrice, 0);
    });
  });
});
