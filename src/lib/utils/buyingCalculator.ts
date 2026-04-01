import {
  BuyingInputs,
  MonthlyBuyingDataPoint,
  YearlyBuyingResult,
} from "../types";
import { calculateDownPayment } from "../defaults";
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

  const downPaymentAmount = calculateDownPayment(buying.housePrice, buying.downPaymentPercent);
  const loanAmount = buying.housePrice - downPaymentAmount;
  const initialHomeValue = buying.housePrice;

  const buyingResults: YearlyBuyingResult[] = [];
  const monthlyBuyingData: Record<number, MonthlyBuyingDataPoint[]> = {};

  let currentHomeValue = initialHomeValue;

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
      amountInvested: 0,
      investmentEarnings: 0,
      investmentsWithEarnings: 0, 
      totalWealthBuying: 0,
      monthlyExpenses: 0,
      monthlyCosts: 0
    });
  }

    buyingResults.push({
      year: 0,
      homeValue: initialHomeValue,
      homeEquity: downPaymentAmount,
      loanBalance: loanAmount,
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
      monthlyExpenses: 0,
      monthlyCosts: 0
    });

  for (let year = 1; year <= buying.loanTerm; year++) {
    monthlyBuyingData[year] = [];
    let yearlyPrincipalPaid = 0;
    let yearlyInterestPaid = 0;
    let yearlyPropertyTaxes = 0;
    let yearlyHomeInsurance = 0;
    let yearlyMaintenanceCosts = 0;
    let yearlyMonthlyExpenses = 0;

    let currentHomeEquity = buyingResults[year - 1].homeEquity;

    for (let month = 1; month <= 12; month++) {
      const globalMonthNumber = (year - 1) * 12 + month;

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

      yearlyPrincipalPaid += principalPayment;
      yearlyInterestPaid += interestPayment;
      yearlyPropertyTaxes += monthlyPropertyTaxes;
      yearlyHomeInsurance += monthlyHomeInsurance;
      yearlyMaintenanceCosts += monthlyMaintenanceCosts;
      yearlyMonthlyExpenses += monthlyExpenses;
      
      currentHomeEquity = currentHomeValue - remainingBalance;

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
        amountInvested: 0,
        investmentEarnings: 0,
        investmentsWithEarnings: 0,
        totalWealthBuying: 0,
        monthlyCosts: monthlyExpenses
      });
    }

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
      mortgagePayment: yearlyPrincipalPaid + yearlyInterestPaid,
      totalWealthBuying: 0,
      amountInvested: 0,
      investmentEarnings: 0,
      investmentsWithEarnings: 0,
      capitalGainsTaxPaid: 0,
      monthlyData: monthlyBuyingData[year],
      monthlyExpenses: yearlyMonthlyExpenses,
      monthlyCosts: yearlyMonthlyExpenses
    });
  }

  return {
    buyingResults
  };
};