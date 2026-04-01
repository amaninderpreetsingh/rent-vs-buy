import { BuyingInputs, FormData, GeneralInputs, InvestmentInputs, RentingInputs } from "./types";

export const calculateDownPayment = (housePrice: number, downPaymentPercent: number): number => {
  return housePrice * (downPaymentPercent / 100);
};

export const validateDownPayment = (
  usePersonalSavings: boolean,
  currentSavings: number,
  housePrice: number,
  downPaymentPercent: number
): string | null => {
  if (!usePersonalSavings) return null;
  const downPaymentAmount = calculateDownPayment(housePrice, downPaymentPercent);
  if (currentSavings < downPaymentAmount) {
    return `Your current savings ($${currentSavings.toLocaleString()}) are less than the required down payment ($${downPaymentAmount.toLocaleString()})`;
  }
  return null;
};

export const defaultGeneral: GeneralInputs = {
  useIncomeAndSavings: false,
  annualIncome: 0,
  incomeIncrease: false,
  annualIncomeGrowthRate: 3,
  currentSavings: 0,
  monthlyExpenses: 0,
};

export const defaultBuying: BuyingInputs = {
  housePrice: 400000,
  downPaymentPercent: 20,
  interestRate: 6,
  loanTerm: 30,
  loanType: "fixed",
  propertyTaxRate: 1.2,
  homeInsuranceRate: 0.5,
  maintenanceCosts: 1,
  usePercentageForMaintenance: true,
  appreciationScenario: "medium",
  customAppreciationRate: 4,
};

export const defaultRenting: RentingInputs = {
  monthlyRent: 2000,
  annualRentIncrease: 3,
};

export const defaultInvestment: InvestmentInputs = {
  annualReturn: 10,
  capitalGainsTaxRate: 15,
};

export const defaultFormData: FormData = {
  general: defaultGeneral,
  buying: defaultBuying,
  renting: defaultRenting,
  investment: defaultInvestment,
};
