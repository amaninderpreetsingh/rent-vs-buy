import {
  BuyingInputs,
  MonthlyBuyingCosts,
  YearlyBuyingCosts,
} from "../types";
import { calculateDownPayment } from "../defaults";
import { getAppreciationRate } from "./propertyUtils";
import {
  calculateMonthlyMortgagePayment,
  calculateMortgageAmortizationForMonth,
} from "./mortgageUtils";
import {
  calculateMonthlyPropertyTaxes,
  calculateMonthlyHomeInsurance,
  calculateMonthlyMaintenanceCosts,
} from "./propertyCostUtils";

interface BuyingCalculationResult {
  buyingCosts: YearlyBuyingCosts[];
}

export const calculateBuyingYearlyData = (buying: BuyingInputs): BuyingCalculationResult => {
  const appreciationRate = getAppreciationRate(buying) / 100;
  const downPaymentAmount = calculateDownPayment(buying.housePrice, buying.downPaymentPercent);
  const loanAmount = buying.housePrice - downPaymentAmount;
  const initialHomeValue = buying.housePrice;

  // Hoist constants out of loops
  const monthlyAppreciationRate = Math.pow(1 + appreciationRate, 1 / 12) - 1;
  const monthlyPayment = calculateMonthlyMortgagePayment(loanAmount, buying.interestRate, buying.loanTerm);

  const buyingCosts: YearlyBuyingCosts[] = [];
  let currentHomeValue = initialHomeValue;

  // Year 0: initial snapshot (single data point, not 12 fake months)
  buyingCosts.push({
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
    totalYearlyExpenses: 0,
    monthlyData: [],
  });

  for (let year = 1; year <= buying.loanTerm; year++) {
    const monthlyData: MonthlyBuyingCosts[] = [];
    let yearlyPrincipalPaid = 0;
    let yearlyInterestPaid = 0;
    let yearlyPropertyTaxes = 0;
    let yearlyHomeInsurance = 0;
    let yearlyMaintenanceCosts = 0;
    let yearlyExpenses = 0;

    for (let month = 1; month <= 12; month++) {
      const globalMonthNumber = (year - 1) * 12 + month;

      currentHomeValue *= (1 + monthlyAppreciationRate);

      const { principalPayment, interestPayment, remainingBalance } =
        calculateMortgageAmortizationForMonth(
          loanAmount, buying.interestRate, buying.loanTerm, globalMonthNumber, monthlyPayment
        );

      const monthlyPropertyTaxes = calculateMonthlyPropertyTaxes(currentHomeValue, buying.propertyTaxRate);
      const monthlyHomeInsurance = calculateMonthlyHomeInsurance(currentHomeValue, buying.homeInsuranceRate);
      const monthlyMaintenanceCosts = calculateMonthlyMaintenanceCosts(
        currentHomeValue, buying.maintenanceCosts, buying.usePercentageForMaintenance
      );

      const mortgagePayment = principalPayment + interestPayment;
      const monthlyExpenses = mortgagePayment + monthlyPropertyTaxes + monthlyHomeInsurance + monthlyMaintenanceCosts;

      yearlyPrincipalPaid += principalPayment;
      yearlyInterestPaid += interestPayment;
      yearlyPropertyTaxes += monthlyPropertyTaxes;
      yearlyHomeInsurance += monthlyHomeInsurance;
      yearlyMaintenanceCosts += monthlyMaintenanceCosts;
      yearlyExpenses += monthlyExpenses;

      monthlyData.push({
        month,
        homeValue: currentHomeValue,
        homeEquity: currentHomeValue - remainingBalance,
        loanBalance: remainingBalance,
        mortgagePayment,
        principalPayment,
        interestPayment,
        propertyTaxes: monthlyPropertyTaxes,
        homeInsurance: monthlyHomeInsurance,
        maintenanceCosts: monthlyMaintenanceCosts,
        monthlyExpenses,
      });
    }

    const lastMonth = monthlyData[11];
    buyingCosts.push({
      year,
      principalPaid: yearlyPrincipalPaid,
      interestPaid: yearlyInterestPaid,
      loanBalance: lastMonth.loanBalance,
      propertyTaxes: yearlyPropertyTaxes,
      homeInsurance: yearlyHomeInsurance,
      maintenanceCosts: yearlyMaintenanceCosts,
      homeValue: currentHomeValue,
      homeEquity: lastMonth.homeEquity,
      mortgagePayment: yearlyPrincipalPaid + yearlyInterestPaid,
      totalYearlyExpenses: yearlyExpenses,
      monthlyData,
    });
  }

  return { buyingCosts };
};
