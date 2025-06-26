import {
  ComparisonResults,
  FormData,
  YearlyComparison,
} from "../types";
import { calculateInvestmentReturnForMonth, calculateCapitalGainsTax } from "./investmentUtils";
import { calculateBuyingYearlyData } from "./buyingCalculator";
import { calculateRentingYearlyData } from "./rentingCalculator";

export const calculateComparison = (formData: FormData): ComparisonResults => {
  const { general, buying, renting, investment } = formData;
  const timeHorizonYears = buying.loanTerm;
  const timeHorizonMonths = timeHorizonYears * 12;

  const { buyingResults } = calculateBuyingYearlyData({ buying });
  const { rentingResults } = calculateRentingYearlyData({ renting, loanTerm: buying.loanTerm });

  const downPaymentAmount = buying.housePrice * (buying.downPaymentPercent / 100);
  
  let buyingInvestmentValue = 0;
  let rentingInvestmentValue = 0;

  if (general.useIncomeAndSavings) {
    buyingInvestmentValue = Math.max(0, general.currentSavings - downPaymentAmount);
    rentingInvestmentValue = general.currentSavings;
  } else {
    buyingInvestmentValue = 0;
    rentingInvestmentValue = downPaymentAmount;
  }

  let buyingTotalContributions = buyingInvestmentValue;
  let rentingTotalContributions = rentingInvestmentValue;

  for (let month = 1; month <= timeHorizonMonths; month++) {
    const year = Math.ceil(month / 12);
    const monthIndex = (month - 1) % 12;

    if (!buyingResults[year] || !rentingResults[year]) continue;

    const buyingMonthRaw = buyingResults[year].monthlyData[monthIndex];
    const rentingMonthRaw = rentingResults[year].monthlyData[monthIndex];

    if (!buyingMonthRaw || !rentingMonthRaw) continue;

    const buyingReturn = calculateInvestmentReturnForMonth(buyingInvestmentValue, investment.annualReturn);
    buyingInvestmentValue += buyingReturn;
    
    const rentingReturn = calculateInvestmentReturnForMonth(rentingInvestmentValue, investment.annualReturn);
    rentingInvestmentValue += rentingReturn;

    const buyingMonthlyExpense = buyingMonthRaw.monthlyExpenses;
    const rentingMonthlyExpense = rentingMonthRaw.rent;
    const savings = Math.abs(buyingMonthlyExpense - rentingMonthlyExpense);

    if (buyingMonthlyExpense < rentingMonthlyExpense) {
      buyingInvestmentValue += savings;
      buyingTotalContributions += savings;
    } else {
      rentingInvestmentValue += savings;
      rentingTotalContributions += savings;
    }

    const buyingMonthFinal = buyingResults[year].monthlyData[monthIndex];
    buyingMonthFinal.amountInvested = buyingTotalContributions;
    buyingMonthFinal.investmentEarnings = buyingReturn;
    buyingMonthFinal.investmentsWithEarnings = buyingInvestmentValue;
    buyingMonthFinal.totalWealthBuying = buyingMonthFinal.homeEquity + buyingInvestmentValue;
    buyingMonthFinal.monthlyExpenses = buyingMonthlyExpense;

    const rentingMonthFinal = rentingResults[year].monthlyData[monthIndex];
    rentingMonthFinal.amountInvested = rentingTotalContributions;
    rentingMonthFinal.investmentEarnings = rentingReturn;
    rentingMonthFinal.investmentsWithEarnings = rentingInvestmentValue;
    rentingMonthFinal.totalWealthRenting = rentingInvestmentValue;
    rentingMonthFinal.monthlyExpenses = rentingMonthlyExpense;
  }

  const yearlyComparisons: YearlyComparison[] = [];

  for (let year = 0; year <= timeHorizonYears; year++) {
    if (year === 0) {
      const initialBuyingEquity = buyingResults[0].homeEquity;
      buyingResults[0].totalWealthBuying = initialBuyingEquity + buyingInvestmentValue;
      rentingResults[0].totalWealthRenting = downPaymentAmount;
      
      buyingResults[0].investmentsWithEarnings = buyingInvestmentValue;
      buyingResults[0].amountInvested = buyingInvestmentValue;
      
      rentingResults[0].investmentsWithEarnings = downPaymentAmount;
      rentingResults[0].amountInvested = downPaymentAmount;

       yearlyComparisons.push({
        year: 0,
        buyingWealth: buyingResults[0].totalWealthBuying,
        rentingWealth: rentingResults[0].totalWealthRenting,
        difference: buyingResults[0].totalWealthBuying - rentingResults[0].totalWealthRenting,
        cumulativeBuyingCosts: 0,
        cumulativeRentingCosts: 0,
      });
      continue;
    }
    
    const buyingYear = buyingResults[year];
    const rentingYear = rentingResults[year];
    
    const yearlyBuyingInvestmentEarnings = buyingYear.monthlyData.reduce((acc, month) => acc + month.investmentEarnings, 0);
    const yearlyRentingInvestmentEarnings = rentingYear.monthlyData.reduce((acc, month) => acc + month.investmentEarnings, 0);

    const lastBuyingMonthOfYear = buyingYear.monthlyData[11];
    buyingYear.investmentsWithEarnings = lastBuyingMonthOfYear.investmentsWithEarnings;
    buyingYear.investmentEarnings = yearlyBuyingInvestmentEarnings;
    buyingYear.amountInvested = lastBuyingMonthOfYear.amountInvested;
    buyingYear.totalWealthBuying = lastBuyingMonthOfYear.totalWealthBuying;

    const lastRentingMonthOfYear = rentingYear.monthlyData[11];
    rentingYear.investmentsWithEarnings = lastRentingMonthOfYear.investmentsWithEarnings;
    rentingYear.investmentEarnings = yearlyRentingInvestmentEarnings;
    rentingYear.amountInvested = lastRentingMonthOfYear.amountInvested;
    rentingYear.totalWealthRenting = lastRentingMonthOfYear.totalWealthRenting;

    if (year === timeHorizonYears) {
      const buyingTax = calculateCapitalGainsTax(buyingYear.investmentEarnings, investment.capitalGainsTaxRate);
      buyingYear.capitalGainsTaxPaid = buyingTax;
      buyingYear.totalWealthBuying -= buyingTax;

      const rentingTax = calculateCapitalGainsTax(rentingYear.investmentEarnings, investment.capitalGainsTaxRate);
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