import {
  RentingInputs,
  MonthlyRentingDataPoint,
  YearlyRentingResult,
} from "../types";

interface RentingCalculationInputs {
  renting: RentingInputs;
  loanTerm: number;
}

interface RentingCalculationResult {
  rentingResults: YearlyRentingResult[];
}

export const calculateRentingYearlyData = ({
  renting,
  loanTerm
}: RentingCalculationInputs): RentingCalculationResult => {
  const rentingResults: YearlyRentingResult[] = [];
  let monthlyRent = renting.monthlyRent;

  rentingResults.push({
    year: 0,
    totalRent: 0,
    totalWealthRenting: 0,
    amountInvested: 0,
    investmentEarnings: 0,
    investmentsWithEarnings: 0,
    capitalGainsTaxPaid: 0,
    monthlyData: Array(12).fill(null).map((_, i) => ({
      month: i + 1,
      rent: 0,
      amountInvested: 0,
      investmentEarnings: 0,
      investmentsWithEarnings: 0,
      totalWealthRenting: 0,
      capitalGainsTax: 0,
      monthlyExpenses: 0,
    })),
    monthlyExpenses: 0,
  });

  for (let year = 1; year <= loanTerm; year++) {
    const monthlyData: MonthlyRentingDataPoint[] = [];
    let yearlyRent = 0;

    for (let month = 1; month <= 12; month++) {
      yearlyRent += monthlyRent;
      monthlyData.push({
        month,
        rent: monthlyRent,
        amountInvested: 0,
        investmentEarnings: 0,
        investmentsWithEarnings: 0,
        totalWealthRenting: 0,
        capitalGainsTax: 0,
        monthlyExpenses: monthlyRent,
      });
    }

    rentingResults.push({
      year,
      totalRent: yearlyRent,
      totalWealthRenting: 0,
      amountInvested: 0,
      investmentEarnings: 0,
      investmentsWithEarnings: 0,
      capitalGainsTaxPaid: 0,
      monthlyData: monthlyData,
      monthlyExpenses: yearlyRent,
    });

    monthlyRent *= 1 + renting.annualRentIncrease / 100;
  }

  return {
    rentingResults,
  };
};