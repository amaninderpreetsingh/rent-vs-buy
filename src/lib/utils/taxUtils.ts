// src/lib/utils/taxUtils.ts

const SALT_CAP = 10000;

// 2024 standard deductions
const STANDARD_DEDUCTION = {
  single: 14600,
  married: 29200,
} as const;

/**
 * Calculate the tax savings from mortgage interest + property tax deductions.
 * Only produces a benefit when itemized deductions exceed the standard deduction.
 */
export const calculateMortgageInterestTaxSavings = (
  yearlyInterestPaid: number,
  yearlyPropertyTaxes: number,
  marginalTaxRate: number,
  filingStatus: "single" | "married"
): number => {
  if (marginalTaxRate <= 0) return 0;

  const standardDeduction = STANDARD_DEDUCTION[filingStatus];

  // SALT deduction is capped at $10K
  const saltDeduction = Math.min(yearlyPropertyTaxes, SALT_CAP);
  const itemizedDeductions = yearlyInterestPaid + saltDeduction;

  // Only beneficial if itemized > standard deduction
  const excessOverStandard = itemizedDeductions - standardDeduction;
  if (excessOverStandard <= 0) return 0;

  return excessOverStandard * (marginalTaxRate / 100);
};
