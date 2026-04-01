import { describe, it, expect } from "vitest";
import { calculateRentingYearlyData } from "../rentingCalculator";
import { defaultRenting } from "../../defaults";

describe("calculateRentingYearlyData", () => {
  const defaultResult = () => calculateRentingYearlyData(defaultRenting, 30);

  describe("Year 0", () => {
    it("total rent is 0", () => {
      const { rentingCosts } = defaultResult();
      expect(rentingCosts[0].totalRent).toBe(0);
    });

    it("has empty monthly data (snapshot, not a period)", () => {
      const { rentingCosts } = defaultResult();
      expect(rentingCosts[0].monthlyData).toHaveLength(0);
    });
  });

  describe("Year 1", () => {
    it("all months use initial rent", () => {
      const { rentingCosts } = defaultResult();
      for (const month of rentingCosts[1].monthlyData) {
        expect(month.rent).toBe(defaultRenting.monthlyRent);
      }
    });

    it("yearly total = 12 * monthly rent", () => {
      const { rentingCosts } = defaultResult();
      expect(rentingCosts[1].totalRent).toBeCloseTo(defaultRenting.monthlyRent * 12, 2);
    });
  });

  describe("rent escalation", () => {
    it("Year 2 rent is higher than Year 1", () => {
      const { rentingCosts } = defaultResult();
      expect(rentingCosts[2].monthlyData[0].rent).toBeGreaterThan(
        rentingCosts[1].monthlyData[0].rent
      );
    });

    it("applies annual increase correctly", () => {
      const { rentingCosts } = defaultResult();
      const year1Rent = rentingCosts[1].monthlyData[0].rent;
      const year2Rent = rentingCosts[2].monthlyData[0].rent;
      const expectedIncrease = 1 + defaultRenting.annualRentIncrease / 100;
      expect(year2Rent).toBeCloseTo(year1Rent * expectedIncrease, 2);
    });

    it("0% increase keeps rent constant", () => {
      const { rentingCosts } = calculateRentingYearlyData(
        { monthlyRent: 2000, annualRentIncrease: 0 },
        30
      );
      expect(rentingCosts[1].monthlyData[0].rent).toBe(2000);
      expect(rentingCosts[30].monthlyData[0].rent).toBe(2000);
    });
  });

  describe("structural integrity", () => {
    it("returns correct number of yearly results", () => {
      const { rentingCosts } = defaultResult();
      expect(rentingCosts).toHaveLength(31); // 0-30
    });

    it("each active year has 12 monthly entries", () => {
      const { rentingCosts } = defaultResult();
      for (let y = 1; y < rentingCosts.length; y++) {
        expect(rentingCosts[y].monthlyData).toHaveLength(12);
      }
    });
  });
});
