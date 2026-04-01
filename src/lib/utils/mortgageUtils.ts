// src/lib/utils/mortgageUtils.ts

export const calculateMonthlyMortgagePayment = (
  loanAmount: number,
  interestRate: number,
  loanTermYears: number
): number => {
  const monthlyInterestRate = interestRate / (12 * 100);
  const numberOfPayments = loanTermYears * 12;

  if (monthlyInterestRate === 0) {
    return loanAmount / numberOfPayments;
  }

  const x = Math.pow(1 + monthlyInterestRate, numberOfPayments);
  return (loanAmount * x * monthlyInterestRate) / (x - 1);
};

export const calculateMortgageAmortizationForMonth = (
  loanAmount: number,
  interestRate: number,
  loanTermYears: number,
  monthNumber: number,
  precomputedMonthlyPayment?: number
): {
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
} => {
  const monthlyInterestRate = interestRate / (12 * 100);
  const numberOfPayments = loanTermYears * 12;

  if (monthNumber > numberOfPayments) {
    return { principalPayment: 0, interestPayment: 0, remainingBalance: 0 };
  }

  const monthlyPayment = precomputedMonthlyPayment
    ?? calculateMonthlyMortgagePayment(loanAmount, interestRate, loanTermYears);

  if (monthlyInterestRate === 0) {
    const principalPayment = loanAmount / numberOfPayments;
    const remainingBalance = loanAmount - (principalPayment * monthNumber);
    return {
      principalPayment,
      interestPayment: 0,
      remainingBalance: Math.max(0, remainingBalance),
    };
  }

  const balanceBeforePayment = loanAmount *
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) -
     Math.pow(1 + monthlyInterestRate, monthNumber - 1)) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  const interestPayment = balanceBeforePayment * monthlyInterestRate;
  const principalPayment = monthlyPayment - interestPayment;
  const remainingBalance = balanceBeforePayment - principalPayment;

  return {
    principalPayment,
    interestPayment,
    remainingBalance: Math.max(0, remainingBalance),
  };
};
