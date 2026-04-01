// src/lib/types.ts

export type Step = 'general' | 'buying' | 'renting' | 'investment' | 'results';

export interface GeneralInputs {
  useIncomeAndSavings: boolean;
  annualIncome?: number;
  incomeIncrease: boolean;
  annualIncomeGrowthRate: number;
  currentSavings: number;
  monthlyExpenses?: number;
  filingStatus: "single" | "married";
}

export interface BuyingInputs {
  housePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTerm: number;
  propertyTaxRate: number;
  homeInsuranceRate: number;
  maintenanceCosts: number;
  usePercentageForMaintenance: boolean;
  appreciationScenario: "low" | "medium" | "high" | "custom";
  customAppreciationRate: number;
  marginalTaxRate: number;
  closingCostPercent: number;
  sellingCostPercent: number;
}

export interface RentingInputs {
  monthlyRent: number;
  annualRentIncrease: number;
}

export interface InvestmentInputs {
  annualReturn: number;
  capitalGainsTaxRate: number;
}

export interface FormData {
  general: GeneralInputs;
  buying: BuyingInputs;
  renting: RentingInputs;
  investment: InvestmentInputs;
}

// --- Internal types for sub-calculators (cost-only, no investment fields) ---

export interface MonthlyBuyingCosts {
  month: number;
  homeValue: number;
  homeEquity: number;
  loanBalance: number;
  mortgagePayment: number;
  principalPayment: number;
  interestPayment: number;
  propertyTaxes: number;
  homeInsurance: number;
  maintenanceCosts: number;
  monthlyExpenses: number;
}

export interface YearlyBuyingCosts {
  year: number;
  homeValue: number;
  homeEquity: number;
  loanBalance: number;
  mortgagePayment: number;
  principalPaid: number;
  interestPaid: number;
  propertyTaxes: number;
  homeInsurance: number;
  maintenanceCosts: number;
  totalYearlyExpenses: number;
  monthlyData: MonthlyBuyingCosts[];
}

export interface MonthlyRentingCosts {
  month: number;
  rent: number;
}

export interface YearlyRentingCosts {
  year: number;
  totalRent: number;
  monthlyData: MonthlyRentingCosts[];
}

// --- Final result types (built by the engine, consumed by UI) ---

export interface MonthlyBuyingDataPoint {
  month: number;
  homeValue: number;
  homeEquity: number;
  loanBalance: number;
  mortgagePayment: number;
  principalPayment: number;
  interestPayment: number;
  propertyTaxes: number;
  homeInsurance: number;
  maintenanceCosts: number;
  monthlyExpenses: number;
  amountInvested: number;
  balanceBeforeEarnings: number;
  investmentEarnings: number;
  investmentsWithEarnings: number;
  totalWealthBuying: number;
}

export interface MonthlyRentingDataPoint {
  month: number;
  rent: number;
  monthlyExpenses: number;
  amountInvested: number;
  balanceBeforeEarnings: number;
  investmentEarnings: number;
  investmentsWithEarnings: number;
  totalWealthRenting: number;
}

export interface YearlyBuyingResult {
  year: number;
  yearlyIncome?: number;
  mortgagePayment: number;
  principalPaid: number;
  interestPaid: number;
  loanBalance: number;
  propertyTaxes: number;
  homeInsurance: number;
  maintenanceCosts: number;
  homeValue: number;
  homeEquity: number;
  totalYearlyExpenses: number;
  amountInvested: number;
  balanceBeforeEarnings: number;
  investmentEarnings: number;
  investmentsWithEarnings: number;
  capitalGainsTaxPaid: number;
  taxDeductionSavings: number;
  totalWealthBuying: number;
  monthlyData: MonthlyBuyingDataPoint[];
}

export interface YearlyRentingResult {
  year: number;
  yearlyIncome?: number;
  totalRent: number;
  totalYearlyExpenses: number;
  amountInvested: number;
  balanceBeforeEarnings: number;
  investmentEarnings: number;
  investmentsWithEarnings: number;
  capitalGainsTaxPaid: number;
  totalWealthRenting: number;
  monthlyData: MonthlyRentingDataPoint[];
}

export interface YearlyComparison {
  year: number;
  buyingWealth: number;
  rentingWealth: number;
  difference: number;
  cumulativeBuyingCosts: number;
  cumulativeRentingCosts: number;
}

export interface ComparisonResults {
  yearlyComparisons: YearlyComparison[];
  buyingResults: YearlyBuyingResult[];
  rentingResults: YearlyRentingResult[];
  finalInvestmentAmount: number;
  summary: {
    finalBuyingWealth: number;
    finalRentingWealth: number;
    difference: number;
    betterOption: "buying" | "renting" | "equal";
  };
}
