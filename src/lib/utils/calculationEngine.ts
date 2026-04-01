import {
  ComparisonResults,
  FormData,
  YearlyComparison,
  YearlyBuyingResult,
  YearlyRentingResult,
  MonthlyBuyingDataPoint,
  MonthlyRentingDataPoint,
} from "../types";
import { calculateDownPayment } from "../defaults";
import { calculateInvestmentReturnForMonth, calculateCapitalGainsTax } from "./investmentUtils";
import { calculateBuyingYearlyData } from "./buyingCalculator";
import { calculateRentingYearlyData } from "./rentingCalculator";
import { calculateMortgageInterestTaxSavings } from "./taxUtils";

export const calculateComparison = (formData: FormData): ComparisonResults => {
  const { general, buying, renting, investment } = formData;
  const timeHorizonYears = buying.loanTerm;
  const timeHorizonMonths = timeHorizonYears * 12;

  // --- Sub-calculators produce cost-only data ---
  const { buyingCosts } = calculateBuyingYearlyData(buying);
  const { rentingCosts } = calculateRentingYearlyData(renting, buying.loanTerm);

  const downPaymentAmount = calculateDownPayment(buying.housePrice, buying.downPaymentPercent);
  const closingCosts = buying.housePrice * (buying.closingCostPercent / 100);

  // --- Initialize investment pools ---
  let buyingInvestmentValue: number;
  let rentingInvestmentValue: number;

  if (general.useIncomeAndSavings) {
    buyingInvestmentValue = Math.max(0, general.currentSavings - downPaymentAmount - closingCosts);
    rentingInvestmentValue = general.currentSavings;
  } else {
    buyingInvestmentValue = 0;
    rentingInvestmentValue = downPaymentAmount + closingCosts;
  }

  // Track cumulative state
  let cumulativeBuyingEarnings = 0;
  let cumulativeRentingEarnings = 0;
  let cumulativeBuyingContributions = buyingInvestmentValue;
  let cumulativeRentingContributions = rentingInvestmentValue;

  // --- Income tracking ---
  const hasIncome = general.useIncomeAndSavings && general.annualIncome && general.annualIncome > 0;
  let currentIncome = hasIncome ? general.annualIncome! : 0;
  const incomeGrowthRate = (hasIncome && general.incomeIncrease) ? (general.annualIncomeGrowthRate / 100) : 0;

  // --- Build Year 0 ---
  const buyingResults: YearlyBuyingResult[] = [{
    year: 0,
    yearlyIncome: hasIncome ? currentIncome : undefined,
    mortgagePayment: 0,
    principalPaid: 0,
    interestPaid: 0,
    loanBalance: buyingCosts[0].loanBalance,
    propertyTaxes: 0,
    homeInsurance: 0,
    maintenanceCosts: 0,
    homeValue: buyingCosts[0].homeValue,
    homeEquity: buyingCosts[0].homeEquity,
    totalYearlyExpenses: 0,
    amountInvested: 0,
    balanceBeforeEarnings: buyingInvestmentValue,
    investmentEarnings: 0,
    investmentsWithEarnings: buyingInvestmentValue,
    capitalGainsTaxPaid: 0,
    taxDeductionSavings: 0,
    totalWealthBuying: buyingCosts[0].homeEquity + buyingInvestmentValue,
    monthlyData: [],
  }];

  const rentingResults: YearlyRentingResult[] = [{
    year: 0,
    yearlyIncome: hasIncome ? currentIncome : undefined,
    totalRent: 0,
    totalYearlyExpenses: 0,
    amountInvested: 0,
    balanceBeforeEarnings: rentingInvestmentValue,
    investmentEarnings: 0,
    investmentsWithEarnings: rentingInvestmentValue,
    capitalGainsTaxPaid: 0,
    totalWealthRenting: rentingInvestmentValue,
    monthlyData: [],
  }];

  const yearlyComparisons: YearlyComparison[] = [{
    year: 0,
    buyingWealth: buyingResults[0].totalWealthBuying,
    rentingWealth: rentingResults[0].totalWealthRenting,
    difference: buyingResults[0].totalWealthBuying - rentingResults[0].totalWealthRenting,
    cumulativeBuyingCosts: 0,
    cumulativeRentingCosts: 0,
  }];

  // --- Single forward pass: Years 1-N ---
  let cumulativeBuyingCostsTotal = 0;
  let cumulativeRentingCostsTotal = 0;
  let prevYearTaxSavings = 0; // Tax savings from prior year, invested monthly in current year
  const otherMonthlyExpenses = (general.useIncomeAndSavings && general.monthlyExpenses) ? general.monthlyExpenses : 0;

  for (let year = 1; year <= timeHorizonYears; year++) {
    if (year > 1 && hasIncome) {
      currentIncome *= (1 + incomeGrowthRate);
    }

    const yearBuyingCosts = buyingCosts[year];
    const yearRentingCosts = rentingCosts[year];

    // Spread prior year's tax savings across 12 months (as if W-4 adjusted)
    const monthlyTaxSavingsContribution = prevYearTaxSavings / 12;

    const monthlyBuyingData: MonthlyBuyingDataPoint[] = [];
    const monthlyRentingData: MonthlyRentingDataPoint[] = [];
    let yearlyBuyingInvestmentEarnings = 0;
    let yearlyRentingInvestmentEarnings = 0;

    // Monthly income available for investment (if using income mode)
    const monthlyIncomeAvailable = hasIncome ? (currentIncome / 12) - otherMonthlyExpenses : 0;

    // Monthly loop within this year
    for (let month = 0; month < 12; month++) {
      const buyingMonthCosts = yearBuyingCosts.monthlyData[month];
      const rentingMonthCosts = yearRentingCosts.monthlyData[month];

      // Step 1: Calculate this month's new contributions
      let buyingMonthContribution = 0;
      let rentingMonthContribution = 0;

      // Tax savings from prior year (spread monthly)
      if (monthlyTaxSavingsContribution > 0) {
        buyingMonthContribution += monthlyTaxSavingsContribution;
      }

      const buyingMonthlyExpense = buyingMonthCosts.monthlyExpenses;
      const rentingMonthlyExpense = rentingMonthCosts.rent;

      if (hasIncome) {
        // Income mode: invest leftover income after housing + other expenses
        buyingMonthContribution += Math.max(0, monthlyIncomeAvailable - buyingMonthlyExpense);
        rentingMonthContribution += Math.max(0, monthlyIncomeAvailable - rentingMonthlyExpense);
      } else {
        // No income mode: only the cheaper side invests the cost differential
        const savings = Math.abs(buyingMonthlyExpense - rentingMonthlyExpense);
        if (buyingMonthlyExpense < rentingMonthlyExpense) {
          buyingMonthContribution += savings;
        } else {
          rentingMonthContribution += savings;
        }
      }

      // Step 2: Add contributions to get balance before earnings
      buyingInvestmentValue += buyingMonthContribution;
      rentingInvestmentValue += rentingMonthContribution;

      const buyingBalanceBeforeEarnings = buyingInvestmentValue;
      const rentingBalanceBeforeEarnings = rentingInvestmentValue;

      // Step 3: Calculate returns on balance (after contributions)
      const buyingReturn = calculateInvestmentReturnForMonth(buyingInvestmentValue, investment.annualReturn);
      buyingInvestmentValue += buyingReturn;
      cumulativeBuyingEarnings += buyingReturn;
      yearlyBuyingInvestmentEarnings += buyingReturn;

      const rentingReturn = calculateInvestmentReturnForMonth(rentingInvestmentValue, investment.annualReturn);
      rentingInvestmentValue += rentingReturn;
      cumulativeRentingEarnings += rentingReturn;
      yearlyRentingInvestmentEarnings += rentingReturn;

      // Step 4: Build complete monthly data points
      monthlyBuyingData.push({
        ...buyingMonthCosts,
        amountInvested: buyingMonthContribution,
        balanceBeforeEarnings: buyingBalanceBeforeEarnings,
        investmentEarnings: buyingReturn,
        investmentsWithEarnings: buyingInvestmentValue,
        totalWealthBuying: buyingMonthCosts.homeEquity + buyingInvestmentValue,
      });

      monthlyRentingData.push({
        month: rentingMonthCosts.month,
        rent: rentingMonthCosts.rent,
        monthlyExpenses: rentingMonthCosts.rent,
        amountInvested: rentingMonthContribution,
        balanceBeforeEarnings: rentingBalanceBeforeEarnings,
        investmentEarnings: rentingReturn,
        investmentsWithEarnings: rentingInvestmentValue,
        totalWealthRenting: rentingInvestmentValue,
      });
    }

    // Calculate this year's tax deduction savings (invested next year)
    const taxDeductionSavings = calculateMortgageInterestTaxSavings(
      yearBuyingCosts.interestPaid,
      yearBuyingCosts.propertyTaxes,
      buying.marginalTaxRate,
      general.filingStatus
    );
    prevYearTaxSavings = taxDeductionSavings;

    const lastBuyingMonth = monthlyBuyingData[11];
    const lastRentingMonth = monthlyRentingData[11];

    let buyingWealth = lastBuyingMonth.totalWealthBuying;
    let rentingWealth = lastRentingMonth.totalWealthRenting;

    // Capital gains tax in final year
    let buyingCapGainsTax = 0;
    let rentingCapGainsTax = 0;
    if (year === timeHorizonYears) {
      buyingCapGainsTax = calculateCapitalGainsTax(cumulativeBuyingEarnings, investment.capitalGainsTaxRate);
      rentingCapGainsTax = calculateCapitalGainsTax(cumulativeRentingEarnings, investment.capitalGainsTaxRate);
      buyingWealth -= buyingCapGainsTax;
      rentingWealth -= rentingCapGainsTax;

      // Apply selling costs to buyer's home equity
      const sellingCosts = lastBuyingMonth.homeValue * (buying.sellingCostPercent / 100);
      buyingWealth -= sellingCosts;
    }

    cumulativeBuyingCostsTotal += yearBuyingCosts.mortgagePayment + yearBuyingCosts.propertyTaxes + yearBuyingCosts.homeInsurance + yearBuyingCosts.maintenanceCosts;
    cumulativeRentingCostsTotal += yearRentingCosts.totalRent;

    buyingResults.push({
      year,
      yearlyIncome: hasIncome ? currentIncome : undefined,
      mortgagePayment: yearBuyingCosts.mortgagePayment,
      principalPaid: yearBuyingCosts.principalPaid,
      interestPaid: yearBuyingCosts.interestPaid,
      loanBalance: yearBuyingCosts.loanBalance,
      propertyTaxes: yearBuyingCosts.propertyTaxes,
      homeInsurance: yearBuyingCosts.homeInsurance,
      maintenanceCosts: yearBuyingCosts.maintenanceCosts,
      homeValue: yearBuyingCosts.homeValue,
      homeEquity: yearBuyingCosts.homeEquity,
      totalYearlyExpenses: yearBuyingCosts.totalYearlyExpenses,
      amountInvested: monthlyBuyingData.reduce((sum, m) => sum + m.amountInvested, 0),
      balanceBeforeEarnings: lastBuyingMonth.balanceBeforeEarnings,
      investmentEarnings: yearlyBuyingInvestmentEarnings,
      investmentsWithEarnings: lastBuyingMonth.investmentsWithEarnings,
      capitalGainsTaxPaid: buyingCapGainsTax,
      taxDeductionSavings,
      totalWealthBuying: buyingWealth,
      monthlyData: monthlyBuyingData,
    });

    rentingResults.push({
      year,
      yearlyIncome: hasIncome ? currentIncome : undefined,
      totalRent: yearRentingCosts.totalRent,
      totalYearlyExpenses: yearRentingCosts.totalRent,
      amountInvested: monthlyRentingData.reduce((sum, m) => sum + m.amountInvested, 0),
      balanceBeforeEarnings: lastRentingMonth.balanceBeforeEarnings,
      investmentEarnings: yearlyRentingInvestmentEarnings,
      investmentsWithEarnings: lastRentingMonth.investmentsWithEarnings,
      capitalGainsTaxPaid: rentingCapGainsTax,
      totalWealthRenting: rentingWealth,
      monthlyData: monthlyRentingData,
    });

    yearlyComparisons.push({
      year,
      buyingWealth,
      rentingWealth,
      difference: buyingWealth - rentingWealth,
      cumulativeBuyingCosts: cumulativeBuyingCostsTotal,
      cumulativeRentingCosts: cumulativeRentingCostsTotal,
    });
  }

  // --- Summary ---
  const finalComparison = yearlyComparisons[timeHorizonYears];
  const betterOption = finalComparison.difference > 0 ? "buying" : finalComparison.difference < 0 ? "renting" : "equal";

  return {
    yearlyComparisons,
    buyingResults,
    rentingResults,
    finalInvestmentAmount: rentingResults[timeHorizonYears].amountInvested,
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
