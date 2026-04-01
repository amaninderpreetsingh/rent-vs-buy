export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  isVisible?: boolean;
  isImportant?: boolean;
}

export interface MonthlyTableData {
  month: number;
  yearlyIncome?: number;
  totalYearlyExpenses?: number;
  mortgagePayment?: number;
  principalPaid?: number;
  interestPaid?: number;
  propertyTaxes?: number;
  homeInsurance?: number;
  maintenanceCosts?: number;
  monthlyExpenses: number;
  totalRent?: number;
  homeValue?: number;
  homeEquity?: number;
  loanBalance?: number;
  investmentsWithEarnings?: number;
  amountInvested: number;
  balanceBeforeEarnings?: number;
  investmentEarnings: number;
  capitalGainsTaxPaid?: number;
  taxDeductionSavings?: number;
  totalWealthBuying: number;
  totalWealthRenting: number;
}

export interface YearlyTableData {
  year: number;
  yearlyIncome?: number;
  mortgagePayment?: number;
  principalPaid?: number;
  interestPaid?: number;
  propertyTaxes?: number;
  homeInsurance?: number;
  maintenanceCosts?: number;
  totalYearlyExpenses?: number;
  totalRent?: number;
  amountInvested: number;
  balanceBeforeEarnings?: number;
  investmentEarnings: number;
  investmentsWithEarnings?: number;
  loanBalance?: number;
  homeValue?: number;
  homeEquity?: number;
  totalWealthBuying: number;
  totalWealthRenting: number;
  capitalGainsTaxPaid?: number;
  taxDeductionSavings?: number;
  monthlyData?: any[];
}

export interface ComparisonTableData extends YearlyTableData {
  buyingWealth: number;
  rentingWealth: number;
  difference: number;
  cumulativeBuyingCosts: number;
  cumulativeRentingCosts: number;
  betterOption?: React.ReactNode;
}

export interface MonthlyBreakdownTableProps {
  year: number;
  columns: TableColumn<MonthlyTableData>[];
  rowData: YearlyTableData;
}

export interface ComparisonTableTabProps {
  data: YearlyTableData[] | ComparisonTableData[];
  columns: TableColumn<YearlyTableData | ComparisonTableData>[];
  tabId: string;
  expandedRows: Record<string, boolean>;
  onToggleRow: (tabId: string, rowId: number) => void;
}

export interface ExpandableRowProps {
  rowData: any;
  isExpanded: boolean;
  onToggle: () => void;
  columns: TableColumn<any>[];
}
