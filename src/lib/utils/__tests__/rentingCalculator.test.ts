import { describe, it, expect } from "vitest";
import { calculateRentingYearlyData } from "../rentingCalculator";
import { defaultRenting } from "../../defaults";

describe("calculateRentingYearlyData", () => {
  const defaultResult = () => calculateRentingYearlyData({ renting: defaultRenting, loanTerm: 30 });

  describe("Year 0", () => {
    it("all monthly rents are 0", () => {
      const { rentingResults } = defaultResult();
      for (const month of rentingResults[0].monthlyData) {
        expect(month.rent).toBe(0);
      }
    });

    it("total rent is 0", () => {
      const { rentingResults } = defaultResult();
      expect(rentingResults[0].totalRent).toBe(0);
    });

    it("has 12 monthly data points", () => {
      const { rentingResults } = defaultResult();
      expect(rentingResults[0].monthlyData).toHaveLength(12);
    });
  });

  describe("Year 1", () => {
    it("all months use initial rent", () => {
      const { rentingResults } = defaultResult();
      for (const month of rentingResults[1].monthlyData) {
        expect(month.rent).toBe(defaultRenting.monthlyRent);
      }
    });

    it("yearly total = 12 * monthly rent", () => {
      const { rentingResults } = defaultResult();
      expect(rentingResults[1].totalRent).toBeCloseTo(defaultRenting.monthlyRent * 12, 2);
    });
  });

  describe("rent escalation", () => {
    it("Year 2 rent is higher than Year 1", () => {
      const { rentingResults } = defaultResult();
      expect(rentingResults[2].monthlyData[0].rent).toBeGreaterThan(
        rentingResults[1].monthlyData[0].rent
      );
    });

    it("applies annual increase correctly", () => {
      const { rentingResults } = defaultResult();
      const year1Rent = rentingResults[1].monthlyData[0].rent;
      const year2Rent = rentingResults[2].monthlyData[0].rent;
      const expectedIncrease = 1 + defaultRenting.annualRentIncrease / 100;
      expect(year2Rent).toBeCloseTo(year1Rent * expectedIncrease, 2);
    });

    it("0% increase keeps rent constant", () => {
      const { rentingResults } = calculateRentingYearlyData({
        renting: { monthlyRent: 2000, annualRentIncrease: 0 },
        loanTerm: 30,
      });
      expect(rentingResults[1].monthlyData[0].rent).toBe(2000);
      expect(rentingResults[30].monthlyData[0].rent).toBe(2000);
    });
  });

  describe("structural integrity", () => {
    it("returns correct number of yearly results", () => {
      const { rentingResults } = defaultResult();
      expect(rentingResults).toHaveLength(31); // 0-30
    });

    it("each year has 12 monthly entries", () => {
      const { rentingResults } = defaultResult();
      for (const yearResult of rentingResults) {
        expect(yearResult.monthlyData).toHaveLength(12);
      }
    });
  });
});
