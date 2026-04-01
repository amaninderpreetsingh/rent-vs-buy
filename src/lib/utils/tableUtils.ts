import { MonthlyTableData, YearlyTableData } from "../types/tableTypes";

export const generateMonthlyData = (year: number, rowData: YearlyTableData): MonthlyTableData[] => {
  const monthlyData: MonthlyTableData[] = [];
  const monthlyIncome = rowData.yearlyIncome ? rowData.yearlyIncome / 12 : undefined;

  for (let month = 1; month <= 12; month++) {
    if (!rowData.monthlyData || !rowData.monthlyData[month - 1]) {
      continue;
    }

    const mp = rowData.monthlyData[month - 1];

    monthlyData.push({
      month,
      yearlyIncome: monthlyIncome,
      totalYearlyExpenses: mp.monthlyExpenses || 0,
      mortgagePayment: mp.mortgagePayment || 0,
      principalPaid: mp.principalPayment || 0,
      interestPaid: mp.interestPayment || 0,
      propertyTaxes: mp.propertyTaxes || 0,
      homeInsurance: mp.homeInsurance || 0,
      maintenanceCosts: mp.maintenanceCosts || 0,
      monthlyExpenses: mp.monthlyExpenses || 0,
      totalRent: mp.rent || 0,
      homeValue: mp.homeValue || 0,
      homeEquity: mp.homeEquity || 0,
      loanBalance: mp.loanBalance || 0,
      amountInvested: mp.amountInvested || 0,
      balanceBeforeEarnings: mp.balanceBeforeEarnings || 0,
      investmentEarnings: mp.investmentEarnings || 0,
      capitalGainsTaxPaid: mp.capitalGainsTax || 0,
      taxDeductionSavings: 0,
      totalWealthBuying: mp.totalWealthBuying || 0,
      totalWealthRenting: mp.totalWealthRenting || 0,
      investmentsWithEarnings: mp.investmentsWithEarnings || 0,
    });
  }

  return monthlyData;
};

export const getTooltipContent = (key: string): string => {
  switch (key) {
    case 'yearlyIncome':
      return "Annual income, potentially with yearly increases applied.";
    case 'mortgagePayment':
      return "Total of principal and interest payments for the year.";
    case 'principalPaid':
      return "Amount paid toward reducing the loan principal this year.";
    case 'interestPaid':
      return "Interest portion of mortgage payments this year.";
    case 'propertyTaxes':
      return "Annual property taxes based on home value.";
    case 'homeInsurance':
      return "Annual home insurance cost based on home value.";
    case 'maintenanceCosts':
      return "Annual home maintenance costs.";
    case 'monthlyExpenses':
      return "Monthly housing expenses for this scenario.";
    case 'totalYearlyExpenses':
      return "Total yearly housing expenses including mortgage, taxes, insurance, and maintenance.";
    case 'totalRent':
      return "Annual rent payments.";
    case 'homeValue':
      return "Current home value after appreciation.";
    case 'homeEquity':
      return "Home value minus remaining loan balance.";
    case 'loanBalance':
      return "Remaining mortgage balance at the end of this year.";
    case 'amountInvested':
      return "New money added to investments this period.";
    case 'balanceBeforeEarnings':
      return "Investment balance after contributions but before earnings. This is what returns are calculated on.";
    case 'investmentEarnings':
      return "Investment returns for this period.";
    case 'investmentsWithEarnings':
      return "Total portfolio value after earnings.";
    case 'capitalGainsTaxPaid':
      return "Capital gains tax on investment earnings.";
    case 'taxDeductionSavings':
      return "Tax savings from mortgage interest and property tax deductions above the standard deduction.";
    case 'totalWealthRenting':
      return "Total wealth including investments.";
    case 'totalWealthBuying':
      return "Total wealth including home equity and investments.";
    case 'difference':
      return "Difference between buying and renting wealth (positive means buying is better).";
    case 'betterOption':
      return "Which option provides better financial outcome at this point.";
    case 'month':
      return "Month number within the year.";
    default:
      return `Value for ${key}`;
  }
};

export const getMonthlyTooltipContent = (key: string): string => {
  switch (key) {
    case 'yearlyIncome':
      return "Annual income divided by 12.";
    case 'totalYearlyExpenses':
      return "Monthly housing expenses for this month.";
    case 'mortgagePayment':
      return "Monthly mortgage payment (principal + interest).";
    case 'principalPaid':
      return "Amount paid toward reducing the loan principal this month.";
    case 'interestPaid':
      return "Interest portion of the mortgage payment this month.";
    case 'propertyTaxes':
      return "Monthly property tax payment.";
    case 'homeInsurance':
      return "Monthly home insurance payment.";
    case 'maintenanceCosts':
      return "Monthly home maintenance costs.";
    case 'monthlyExpenses':
      return "Total monthly expenses for this scenario.";
    case 'homeValue':
      return "Estimated home value for this month.";
    case 'homeEquity':
      return "Home value minus remaining loan balance.";
    case 'loanBalance':
      return "Remaining mortgage balance.";
    case 'amountInvested':
      return "New money added to investments this month.";
    case 'balanceBeforeEarnings':
      return "Investment balance after this month's contribution, before earnings are applied. Returns are calculated on this amount.";
    case 'investmentEarnings':
      return "Investment returns for this month.";
    case 'investmentsWithEarnings':
      return "Portfolio value at end of month (balance + earnings).";
    case 'capitalGainsTaxPaid':
      return "Capital gains tax paid. This is only applied at the end of the year (month 12).";
    default:
      return "Value for month " + key;
  }
};
