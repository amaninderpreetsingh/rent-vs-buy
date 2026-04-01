// src/lib/types.ts

export type Step = 'general' | 'buying' | 'renting' | 'investment' | 'results';

export interface GeneralInputs {
  useIncomeAndSavings: boolean;
  annualIncome?: number;
  incomeIncrease: boolean;
  annualIncomeGrowthRate: number;
  currentSavings: number; // Lives here exclusively
  monthlyExpenses?: number;
}

export interface BuyingInputs {
  housePrice: number;
  downPaymentPercent: number; // Lives here exclusively
  interestRate: number;
  loanTerm: number;
  loanType: "fixed" | "adjustable";
  propertyTaxRate: number;
  homeInsuranceRate: number;
  maintenanceCosts: number;
  usePercentageForMaintenance: boolean;
  appreciationScenario: "low" | "medium" | "high" | "custom";
  customAppreciationRate: number;
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

// Monthly Data Types
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
  amountInvested: number;
  investmentEarnings: number;
  investmentsWithEarnings: number;
  totalWealthBuying: number;
  monthlyExpenses: number;
  monthlyCosts: number;
}

export interface MonthlyRentingDataPoint {
  month: number;
  rent: number;
  amountInvested: number;
  investmentEarnings: number;
  investmentsWithEarnings: number;
  capitalGainsTax: number;
  totalWealthRenting: number;
  monthlyExpenses: number;
}

// Calculation Result Types
export interface YearlyBuyingResult {
  year: number;
  mortgagePayment: number;
  principalPaid: number;
  interestPaid: number;
  loanBalance: number;
  propertyTaxes: number;
  homeInsurance: number;
  maintenanceCosts: number;
  homeValue: number;
  homeEquity: number;
  totalWealthBuying: number;
  amountInvested: number;         
  investmentEarnings: number;     
  investmentsWithEarnings: number;
  capitalGainsTaxPaid: number; 
  monthlyData: MonthlyBuyingDataPoint[];
  monthlyExpenses: number;
  monthlyCosts: number;
}

export interface YearlyRentingResult {
  year: number;
  totalRent: number;
  amountInvested: number; 
  investmentEarnings: number;
  investmentsWithEarnings: number; 
  capitalGainsTaxPaid: number;
  totalWealthRenting: number;
  monthlyData: MonthlyRentingDataPoint[];
  monthlyExpenses: number;
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