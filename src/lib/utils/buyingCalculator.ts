import {
  BuyingInputs,
  InvestmentInputs,
  MonthlyBuyingDataPoint,
  YearlyBuyingResult,
} from "../types";
import { getAppreciationRate } from "./propertyUtils";
import {
  calculateMortgageAmortizationForMonth,
} from "./mortgageUtils";
import {
  calculateMonthlyPropertyTaxes,
  calculateMonthlyHomeInsurance,
  calculateMonthlyMaintenanceCosts,
} from "./propertyCostUtils";

interface BuyingCalculationInputs {
  buying: BuyingInputs;
}

interface BuyingCalculationResult {
  buyingResults: YearlyBuyingResult[];
}

export const calculateBuyingYearlyData = ({
  buying
}: BuyingCalculationInputs): BuyingCalculationResult => {
  const appreciationRate = getAppreciationRate(buying) / 100;

  // Initial values
  const downPaymentAmount = buying.housePrice * (buying.downPaymentPercent / 100);
  const loanAmount = buying.housePrice - downPaymentAmount;
  const initialHomeValue = buying.housePrice;

  const buyingResults: YearlyBuyingResult[] = [];
  const monthlyBuyingData: Record<number, MonthlyBuyingDataPoint[]> = {};

  // Initialize tracking variables
  let currentHomeValue = initialHomeValue;

  // --- Year 0 Setup ---
  monthlyBuyingData[0] = [];
  for (let month = 1; month <= 12; month++) {
    monthlyBuyingData[0].push({
      month,
      homeValue: initialHomeValue,
      homeEquity: downPaymentAmount,
      loanBalance: loanAmount,
      mortgagePayment: 0,
      principalPayment: 0, 
      interestPayment: 0,
      propertyTaxes: 0,
      homeInsurance: 0,
      maintenanceCosts: 0,
      // Investment fields will be populated by the engine
      amountInvested: 0,
      investmentEarnings: 0,
      investmentsWithEarnings: 0, 
      totalWealthBuying: 0,
      monthlyExpenses: 0
    });
  }

    buyingResults.push({
      year: 0,
      homeValue: initialHomeValue,
      homeEquity: downPaymentAmount,
      loanBalance: loanAmount,
      // All other values are 0 for year 0, will be calculated by engine
      mortgagePayment: 0,
      principalPaid: 0,
      interestPaid: 0,
      propertyTaxes: 0,
      homeInsurance: 0,
      maintenanceCosts: 0,
      totalWealthBuying: 0,
      amountInvested: 0,
      investmentEarnings: 0,
      investmentsWithEarnings: 0,
      capitalGainsTaxPaid: 0, 
      monthlyData: monthlyBuyingData[0],
    });
  // --- End Year 0 Setup ---

  // Calculate for each year
  for (let year = 1; year <= buying.loanTerm; year++) {
    monthlyBuyingData[year] = [];
    let yearlyPrincipalPaid = 0;
    let yearlyInterestPaid = 0;
    let yearlyPropertyTaxes = 0;
    let yearlyHomeInsurance = 0;
    let yearlyMaintenanceCosts = 0;

    // Get previous year's data to carry over values
    let currentHomeEquity = buyingResults[year - 1].homeEquity;

    for (let month = 1; month <= 12; month++) {
      const globalMonthNumber = (year - 1) * 12 + month;

      // Apply monthly home appreciation before calculating new costs
      const monthlyAppreciationRate = Math.pow(1 + appreciationRate, 1 / 12) - 1;
      currentHomeValue *= (1 + monthlyAppreciationRate);

      const { principalPayment, interestPayment, remainingBalance } =
        calculateMortgageAmortizationForMonth(
          loanAmount,
          buying.interestRate,
          buying.loanTerm,
          globalMonthNumber
        );

      const monthlyPropertyTaxes = calculateMonthlyPropertyTaxes(
        currentHomeValue,
        buying.propertyTaxRate
      );
      const monthlyHomeInsurance = calculateMonthlyHomeInsurance(
        currentHomeValue,
        buying.homeInsuranceRate
      );
      const monthlyMaintenanceCosts = calculateMonthlyMaintenanceCosts(
        currentHomeValue,
        buying.maintenanceCosts,
        buying.usePercentageForMaintenance
      );

      const mortgagePayment = principalPayment + interestPayment;

      const monthlyExpenses = 
        mortgagePayment + 
        monthlyPropertyTaxes +
        monthlyHomeInsurance +
        monthlyMaintenanceCosts;

      // Track yearly totals
      yearlyPrincipalPaid += principalPayment;
      yearlyInterestPaid += interestPayment;
      yearlyPropertyTaxes += monthlyPropertyTaxes;
      yearlyHomeInsurance += monthlyHomeInsurance;
      yearlyMaintenanceCosts += monthlyMaintenanceCosts;
      
      currentHomeEquity = currentHomeValue - remainingBalance;

      // Store monthly data point 
      monthlyBuyingData[year].push({
        month,
        homeValue: currentHomeValue,
        homeEquity: currentHomeEquity,
        loanBalance: remainingBalance,
        mortgagePayment,
        principalPayment,
        interestPayment,
        propertyTaxes: monthlyPropertyTaxes,
        homeInsurance: monthlyHomeInsurance,
        maintenanceCosts: monthlyMaintenanceCosts,
        monthlyExpenses,
        // Investment values to be populated later
        amountInvested: 0,
        investmentEarnings: 0,
        investmentsWithEarnings: 0,
        totalWealthBuying: 0,
      });
    } // End monthly loop

    // Add year results
    buyingResults.push({
      year,
      principalPaid: yearlyPrincipalPaid,
      interestPaid: yearlyInterestPaid,
      loanBalance: monthlyBuyingData[year][11].loanBalance,
      propertyTaxes: yearlyPropertyTaxes,
      homeInsurance: yearlyHomeInsurance,
      maintenanceCosts: yearlyMaintenanceCosts,
      homeValue: currentHomeValue,
      homeEquity: currentHomeEquity,
      // Investment values to be populated later
      mortgagePayment: yearlyPrincipalPaid + yearlyInterestPaid,
      totalWealthBuying: 0,
      amountInvested: 0,
      investmentEarnings: 0,
      investmentsWithEarnings: 0,
      capitalGainsTaxPaid: 0,
      monthlyData: monthlyBuyingData[year],
    });
  } // End yearly loop

  return {
    buyingResults
  };
};