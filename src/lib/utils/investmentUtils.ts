// src/lib/utils/investmentUtils.ts

// Calculate investment return for a month
export const calculateInvestmentReturnForMonth = (
  initialAmount: number,
  annualReturnRate: number
): number => {
  const monthlyRate = Math.pow(1 + annualReturnRate / 100, 1 / 12) - 1;
  return initialAmount * monthlyRate;
};

// Calculate capital gains tax
export const calculateCapitalGainsTax = (
  rentingInvestmentGain: number,
  taxRate: number
): number => {
  return rentingInvestmentGain * (taxRate / 100);
};
