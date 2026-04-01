import { describe, it, expect } from "vitest";
import { calculateBuyingYearlyData } from "../buyingCalculator";
import { defaultBuying } from "../../defaults";

describe("calculateBuyingYearlyData", () => {
  const defaultResult = () => calculateBuyingYearlyData(defaultBuying);

  describe("Year 0 (initial state)", () => {
    it("home value equals purchase price", () => {
      const { buyingCosts } = defaultResult();
      expect(buyingCosts[0].homeValue).toBe(defaultBuying.housePrice);
    });

    it("equity equals down payment", () => {
      const { buyingCosts } = defaultResult();
      const downPayment = defaultBuying.housePrice * (defaultBuying.downPaymentPercent / 100);
      expect(buyingCosts[0].homeEquity).toBe(downPayment);
    });

    it("all costs are zero", () => {
      const { buyingCosts } = defaultResult();
      expect(buyingCosts[0].mortgagePayment).toBe(0);
      expect(buyingCosts[0].propertyTaxes).toBe(0);
      expect(buyingCosts[0].homeInsurance).toBe(0);
      expect(buyingCosts[0].maintenanceCosts).toBe(0);
    });

    it("has empty monthly data (snapshot, not a period)", () => {
      const { buyingCosts } = defaultResult();
      expect(buyingCosts[0].monthlyData).toHaveLength(0);
    });
  });

  describe("year-over-year progression", () => {
    it("home value appreciates each year", () => {
      const { buyingCosts } = defaultResult();
      for (let y = 1; y < buyingCosts.length; y++) {
        expect(buyingCosts[y].homeValue).toBeGreaterThan(buyingCosts[y - 1].homeValue);
      }
    });

    it("loan balance decreases each year", () => {
      const { buyingCosts } = defaultResult();
      for (let y = 2; y < buyingCosts.length; y++) {
        expect(buyingCosts[y].loanBalance).toBeLessThan(buyingCosts[y - 1].loanBalance);
      }
    });

    it("equity increases each year", () => {
      const { buyingCosts } = defaultResult();
      for (let y = 1; y < buyingCosts.length; y++) {
        expect(buyingCosts[y].homeEquity).toBeGreaterThan(buyingCosts[y - 1].homeEquity);
      }
    });
  });

  describe("monthly data integrity", () => {
    it("each active year has exactly 12 monthly entries", () => {
      const { buyingCosts } = defaultResult();
      for (let y = 1; y < buyingCosts.length; y++) {
        expect(buyingCosts[y].monthlyData).toHaveLength(12);
      }
    });

    it("yearly mortgage equals sum of 12 monthly payments", () => {
      const { buyingCosts } = defaultResult();
      for (let y = 1; y <= defaultBuying.loanTerm; y++) {
        const monthlySum = buyingCosts[y].monthlyData.reduce(
          (sum, m) => sum + m.mortgagePayment, 0
        );
        expect(buyingCosts[y].mortgagePayment).toBeCloseTo(monthlySum, 2);
      }
    });
  });

  describe("final year", () => {
    it("loan balance reaches ~0 at end of term", () => {
      const { buyingCosts } = defaultResult();
      expect(buyingCosts[defaultBuying.loanTerm].loanBalance).toBeCloseTo(0, 0);
    });

    it("returns correct number of yearly results", () => {
      const { buyingCosts } = defaultResult();
      expect(buyingCosts).toHaveLength(defaultBuying.loanTerm + 1); // 0-30
    });
  });

  describe("0% appreciation", () => {
    it("home value stays constant", () => {
      const { buyingCosts } = calculateBuyingYearlyData(
        { ...defaultBuying, appreciationScenario: "custom", customAppreciationRate: 0 }
      );
      expect(buyingCosts[30].homeValue).toBeCloseTo(defaultBuying.housePrice, 0);
    });
  });
});
