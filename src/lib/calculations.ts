// src/lib/calculations.ts
// Central export point for all calculation utilities

export { formatCurrency, formatPercentage } from "./utils/formatters";

export {
  calculateMonthlyMortgagePayment,
  calculateMortgageAmortizationForMonth,
} from "./utils/mortgageUtils";

export {
  calculateMonthlyPropertyTaxes,
  calculateMonthlyHomeInsurance,
  calculateMonthlyMaintenanceCosts,
} from "./utils/propertyCostUtils";

export {
  calculateInvestmentReturnForMonth,
  calculateCapitalGainsTax,
} from "./utils/investmentUtils";

export {
  calculateComparison,
  calculateAbsoluteDifference
} from "./utils/calculationEngine";

export { getAppreciationRate } from "./utils/propertyUtils";

export { calculateMortgageInterestTaxSavings } from "./utils/taxUtils";
