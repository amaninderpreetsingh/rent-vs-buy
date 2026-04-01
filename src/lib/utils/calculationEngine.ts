import {
  ComparisonResults,
  FormData,
  YearlyComparison,
} from "../types";
import { calculateDownPayment } from "../defaults";
import { calculateInvestmentReturnForMonth, calculateCapitalGainsTax } from "./investmentUtils";
import { calculateBuyingYearlyData } from "./buyingCalculator";
import { calculateRentingYearlyData } from "./rentingCalculator";

export const calculateComparison = (formData: FormData): ComparisonResults => {
  const { general, buying, renting, investment } = formData;
  const timeHorizonYears = buying.loanTerm;
  const timeHorizonMonths = timeHorizonYears * 12;

  const { buyingResults } = calculateBuyingYearlyData({ buying });
  const { rentingResults } = calculateRentingYearlyData({ renting, loanTerm: buying.loanTerm });

  const downPaymentAmount = calculateDownPayment(buying.housePrice, buying.downPaymentPercent);

  // Initialize investment pools
  let buyingInvestmentValue: number;
  let rentingInvestmentValue: number;

  if (general.useIncomeAndSavings) {
    buyingInvestmentValue = Math.max(0, general.currentSavings - downPaymentAmount);
    rentingInvestmentValue = general.currentSavings;
  } else {
    buyingInvestmentValue = 0;
    rentingInvestmentValue = downPaymentAmount;
  }

  // Save initial values for Year 0 BEFORE the monthly loop mutates them
  const initialBuyingInvestmentValue = buyingInvestmentValue;
  const initialRentingInvestmentValue = rentingInvestmentValue;

  // Track cumulative investment earnings for capital gains tax
  let cumulativeBuyingEarnings = 0;
  let cumulativeRentingEarnings = 0;

  // Track cumulative contributions (principal only, no earnings)
  let cumulativeBuyingContributions = initialBuyingInvestmentValue;
  let cumulativeRentingContributions = initialRentingInvestmentValue;

  // --- Monthly loop: accumulate investments and write to monthly data ---
  for (let month = 1; month <= timeHorizonMonths; month++) {
    const year = Math.ceil(month / 12);
    const monthIndex = (month - 1) % 12;

    if (!buyingResults[year] || !rentingResults[year]) continue;

    const buyingMonth = buyingResults[year].monthlyData[monthIndex];
    const rentingMonth = rentingResults[year].monthlyData[monthIndex];

    if (!buyingMonth || !rentingMonth) continue;

    // Calculate and apply investment returns
    const buyingReturn = calculateInvestmentReturnForMonth(buyingInvestmentValue, investment.annualReturn);
    buyingInvestmentValue += buyingReturn;
    cumulativeBuyingEarnings += buyingReturn;

    const rentingReturn = calculateInvestmentReturnForMonth(rentingInvestmentValue, investment.annualReturn);
    rentingInvestmentValue += rentingReturn;
    cumulativeRentingEarnings += rentingReturn;

    // Allocate monthly savings differential to the cheaper option's investment pool
    const buyingMonthlyExpense = buyingMonth.monthlyExpenses;
    const rentingMonthlyExpense = rentingMonth.rent;
    const savings = Math.abs(buyingMonthlyExpense - rentingMonthlyExpense);

    if (buyingMonthlyExpense < rentingMonthlyExpense) {
      buyingInvestmentValue += savings;
      cumulativeBuyingContributions += savings;
    } else {
      rentingInvestmentValue += savings;
      cumulativeRentingContributions += savings;
    }

    // Write investment data to monthly data points
    buyingMonth.investmentEarnings = buyingReturn;
    buyingMonth.investmentsWithEarnings = buyingInvestmentValue;
    buyingMonth.amountInvested = cumulativeBuyingContributions;
    buyingMonth.totalWealthBuying = buyingMonth.homeEquity + buyingInvestmentValue;
    buyingMonth.monthlyExpenses = buyingMonthlyExpense;

    rentingMonth.investmentEarnings = rentingReturn;
    rentingMonth.investmentsWithEarnings = rentingInvestmentValue;
    rentingMonth.amountInvested = cumulativeRentingContributions;
    rentingMonth.totalWealthRenting = rentingInvestmentValue;
    rentingMonth.monthlyExpenses = rentingMonthlyExpense;
  }

  // --- Build yearly comparisons ---
  const yearlyComparisons: YearlyComparison[] = [];

  // Year 0: initial state using saved initial values
  const initialBuyingEquity = buyingResults[0].homeEquity;
  buyingResults[0].totalWealthBuying = initialBuyingEquity + initialBuyingInvestmentValue;
  buyingResults[0].investmentsWithEarnings = initialBuyingInvestmentValue;
  buyingResults[0].amountInvested = initialBuyingInvestmentValue;

  rentingResults[0].totalWealthRenting = initialRentingInvestmentValue;
  rentingResults[0].investmentsWithEarnings = initialRentingInvestmentValue;
  rentingResults[0].amountInvested = initialRentingInvestmentValue;

  yearlyComparisons.push({
    year: 0,
    buyingWealth: buyingResults[0].totalWealthBuying,
    rentingWealth: rentingResults[0].totalWealthRenting,
    difference: buyingResults[0].totalWealthBuying - rentingResults[0].totalWealthRenting,
    cumulativeBuyingCosts: 0,
    cumulativeRentingCosts: 0,
  });

  // Years 1-N: aggregate from monthly data
  for (let year = 1; year <= timeHorizonYears; year++) {
    const buyingYear = buyingResults[year];
    const rentingYear = rentingResults[year];

    const yearlyBuyingInvestmentEarnings = buyingYear.monthlyData.reduce((acc, month) => acc + month.investmentEarnings, 0);
    const yearlyRentingInvestmentEarnings = rentingYear.monthlyData.reduce((acc, month) => acc + month.investmentEarnings, 0);

    const lastBuyingMonth = buyingYear.monthlyData[11];
    buyingYear.investmentsWithEarnings = lastBuyingMonth.investmentsWithEarnings;
    buyingYear.investmentEarnings = yearlyBuyingInvestmentEarnings;
    buyingYear.amountInvested = lastBuyingMonth.amountInvested;
    buyingYear.totalWealthBuying = lastBuyingMonth.totalWealthBuying;

    const lastRentingMonth = rentingYear.monthlyData[11];
    rentingYear.investmentsWithEarnings = lastRentingMonth.investmentsWithEarnings;
    rentingYear.investmentEarnings = yearlyRentingInvestmentEarnings;
    rentingYear.amountInvested = lastRentingMonth.amountInvested;
    rentingYear.totalWealthRenting = lastRentingMonth.totalWealthRenting;

    // Apply capital gains tax on cumulative earnings in the final year
    if (year === timeHorizonYears) {
      const buyingTax = calculateCapitalGainsTax(cumulativeBuyingEarnings, investment.capitalGainsTaxRate);
      buyingYear.capitalGainsTaxPaid = buyingTax;
      buyingYear.totalWealthBuying -= buyingTax;

      const rentingTax = calculateCapitalGainsTax(cumulativeRentingEarnings, investment.capitalGainsTaxRate);
      rentingYear.capitalGainsTaxPaid = rentingTax;
      rentingYear.totalWealthRenting -= rentingTax;
    }

    const prevComparison = yearlyComparisons[year - 1];
    const cumulativeBuyingCosts = prevComparison.cumulativeBuyingCosts + buyingYear.mortgagePayment + buyingYear.propertyTaxes + buyingYear.homeInsurance + buyingYear.maintenanceCosts;
    const cumulativeRentingCosts = prevComparison.cumulativeRentingCosts + rentingYear.totalRent;

    yearlyComparisons.push({
      year,
      buyingWealth: buyingYear.totalWealthBuying,
      rentingWealth: rentingYear.totalWealthRenting,
      difference: buyingYear.totalWealthBuying - rentingYear.totalWealthRenting,
      cumulativeBuyingCosts,
      cumulativeRentingCosts,
    });
  }

  // --- Summary ---
  const finalComparison = yearlyComparisons[timeHorizonYears];
  const betterOption = finalComparison.difference > 0 ? "buying" : finalComparison.difference < 0 ? "renting" : "equal";

  const finalInvestmentAmount = rentingResults[timeHorizonYears].amountInvested;

  return {
    yearlyComparisons,
    buyingResults,
    rentingResults,
    finalInvestmentAmount,
    summary: {
      finalBuyingWealth: finalComparison.buyingWealth,
      finalRentingWealth: finalComparison.rentingWealth,
      difference: Math.abs(finalComparison.difference),
      betterOption,
    },
  };
};

export const calculateAbsoluteDifference = (value1: number, value2: number): number => {
  return Math.abs(value1 - value2);
};
