import { MonthlyTableData, YearlyTableData } from "../types/tableTypes";

export const generateMonthlyData = (year: number, rowData: YearlyTableData): MonthlyTableData[] => {
  const monthlyData: MonthlyTableData[] = [];
  
  for (let month = 1; month <= 12; month++) {
    if (!rowData.monthlyData || !rowData.monthlyData[month-1]) {
      continue;
    }
    
    const monthlyDataPoint = rowData.monthlyData[month-1];

    monthlyData.push({
      month,
      mortgagePayment: monthlyDataPoint.mortgagePayment || 0,
      principalPaid: monthlyDataPoint.principalPayment || 0,
      interestPaid: monthlyDataPoint.interestPayment || 0,
      propertyTaxes: monthlyDataPoint.propertyTaxes || 0,
      homeInsurance: monthlyDataPoint.homeInsurance || 0,
      maintenanceCosts: monthlyDataPoint.maintenanceCosts || 0,
      monthlyExpenses: monthlyDataPoint.monthlyExpenses || 0,
      totalRent: monthlyDataPoint.rent || 0,
      homeValue: monthlyDataPoint.homeValue || 0,
      homeEquity: monthlyDataPoint.homeEquity || 0,
      loanBalance:  monthlyDataPoint.loanBalance || 0,
      amountInvested: monthlyDataPoint.amountInvested || 0,
      investmentEarnings: monthlyDataPoint.investmentEarnings || 0,
      investmentValueBeforeTax: monthlyDataPoint.investmentValueBeforeTax || 0,
      capitalGainsTaxPaid: monthlyDataPoint.capitalGainsTax || 0,
      totalWealthBuying: monthlyDataPoint.totalWealthBuying || 0,
      totalWealthRenting: monthlyDataPoint.totalWealthRenting || 0,
      investmentsWithEarnings: monthlyDataPoint.investmentsWithEarnings || 0,
    });
  }
  
  return monthlyData;
};

export const getTooltipContent = (key: string): string => {
  switch(key) {
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
    case 'monthlyCosts':
      return "The average monthly cost for buying, including mortgage, taxes, insurance, and maintenance.";
    case 'monthlyExpenses':
      return "Total yearly expenses for the scenario.";
    case 'totalRent':
      return "Annual rent payments.";
    case 'leftoverIncome':
      return "Annual income minus housing expenses.";
    case 'homeValue':
      return "Current home value after appreciation.";
    case 'homeEquity':
      return "Downpayment plus principal paid.";
    case 'loanBalance':
      return "Remaining mortgage balance at the end of this year.";
    case 'yearlySavings':
      return "Amount available for investment each month.";
    case 'amountInvested':
      return "Cumulative contributions to investments.";
    case 'investmentEarnings':
      return "Investment returns for this period.";
    case 'investmentsWithEarnings':
      return "Total market value of investments.";
    case 'investmentValueBeforeTax':
      return "Value of investments before capital gains tax.";
    case 'capitalGainsTaxPaid':
      return "Capital gains tax on investment earnings.";
    case 'totalWealthRenting':
      return "Total wealth including initial savings, downpayment and investments.";
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
  switch(key) {
    case 'yearlyIncome':
      return "Annual income divided by 12.";
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
      return "Total monthly expenses for this month for the scenario.";
    case 'homeValue':
      return "Estimated home value for this month.";
    case 'homeEquity':
      return "Downpayment plus principal paid.";
    case 'loanBalance':
      return "Remaining mortgage balance.";
    case 'leftoverIncome':
      return "Monthly income minus housing expenses.";
    case 'yearlySavings':
      return "Amount available for investment this month.";
    case 'amountInvested':
      return "Cumulative contributions to investments.";
    case 'investmentEarnings':
      return "Investment returns for this month.";
    case 'investmentsWithEarnings':
      return "Value of investments at this point in the year.";
    case 'investmentValueBeforeTax':
      return "Value of investments before capital gains tax.";
    case 'capitalGainsTaxPaid':
      return "Capital gains tax paid. This is only applied at the end of the year (month 12).";
    default:
      return "Value for month " + key;
  }
};