import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TableCellWithTooltip } from "../ui/table-cell-with-tooltip";
import { MonthlyTableData, TableColumn, YearlyTableData } from "@/lib/types/tableTypes";
import { generateMonthlyData, getMonthlyTooltipContent } from "@/lib/utils/tableUtils";

interface MonthlyBreakdownTableProps {
  year: number;
  columns: TableColumn<any>[];
  rowData: YearlyTableData;
}

const MonthlyBreakdownTable = ({ year, columns, rowData }: MonthlyBreakdownTableProps) => {
  const monthlyData: MonthlyTableData[] = generateMonthlyData(year, rowData);

  // Derive monthly columns directly from parent columns (no local state)
  const monthColumn: TableColumn<MonthlyTableData> = {
    key: "month",
    label: "Month",
    isVisible: true,
    isImportant: true
  };

  // Remap yearly labels to monthly equivalents
  const monthlyLabelMap: Record<string, string> = {
    "Annual Income": "Monthly Income",
    "Yearly Costs": "Monthly Costs",
    "Yearly Rent": "Monthly Rent",
    "Mortgage Payment": "Mortgage Payment",
    "New Contributions": "Contribution",
    "Principal Paid": "Principal",
    "Interest Paid": "Interest",
  };

  const visibleColumns: TableColumn<MonthlyTableData>[] = [
    monthColumn,
    ...columns.slice(1).filter(col => col.isVisible !== false).map(col => ({
      key: col.key as string,
      label: monthlyLabelMap[col.label] ?? col.label,
      isVisible: col.isVisible,
      isImportant: col.isImportant
    }))
  ];

  return (
    <div className="py-2 w-full">
      <div className="mb-2">
        <h4 className="text-sm font-medium">Monthly Breakdown for Year {year}</h4>
      </div>
      <div className="overflow-x-auto w-full max-w-8xl">
        <Table className="w-full table-auto">
          <TableHeader>
            <TableRow>
              {visibleColumns.map((col: TableColumn<MonthlyTableData>) => (
                <TableHead key={col.key as string} className="whitespace-nowrap px-1 text-xs">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {monthlyData.map((monthData) => (
              <TableRow key={monthData.month} className={monthData.month === 12 ? "bg-muted/20" : ""}>
                {visibleColumns.map((col: TableColumn<MonthlyTableData>) => {
                  const colKey = col.key as string;
                  const isHighlighted = colKey === 'capitalGainsTaxPaid' && monthData.month === 12;
                  
                  return (
                    <TableCell key={colKey} className="whitespace-nowrap px-1 text-xs">
                      <TableCellWithTooltip
                        value={monthData[colKey as keyof MonthlyTableData]}
                        tooltipContent={getMonthlyTooltipContent(colKey)}
                        className="gap-0.5"
                        isHighlighted={isHighlighted}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MonthlyBreakdownTable;
