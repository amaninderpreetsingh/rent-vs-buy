import { RentingInputs, MonthlyRentingCosts, YearlyRentingCosts } from "../types";

interface RentingCalculationResult {
  rentingCosts: YearlyRentingCosts[];
}

export const calculateRentingYearlyData = (
  renting: RentingInputs,
  loanTerm: number
): RentingCalculationResult => {
  const rentingCosts: YearlyRentingCosts[] = [];
  let monthlyRent = renting.monthlyRent;

  // Year 0: initial snapshot
  rentingCosts.push({
    year: 0,
    totalRent: 0,
    monthlyData: [],
  });

  for (let year = 1; year <= loanTerm; year++) {
    const monthlyData: MonthlyRentingCosts[] = [];
    let yearlyRent = 0;

    for (let month = 1; month <= 12; month++) {
      yearlyRent += monthlyRent;
      monthlyData.push({ month, rent: monthlyRent });
    }

    rentingCosts.push({
      year,
      totalRent: yearlyRent,
      monthlyData,
    });

    monthlyRent *= 1 + renting.annualRentIncrease / 100;
  }

  return { rentingCosts };
};
