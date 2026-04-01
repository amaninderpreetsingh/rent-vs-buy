import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TableCellWithTooltip } from "../ui/table-cell-with-tooltip";
import { MonthlyTableData, TableColumn, YearlyTableData } from "@/lib/types/tableTypes";
import { generateMonthlyData, getMonthlyTooltipContent } from "@/lib/utils/tableUtils";
import { useState, useEffect } from "react";
import { ColumnSelector } from "../ui/column-selector";

interface MonthlyBreakdownTableProps {
  year: number;
  columns: TableColumn<any>[];
  rowData: YearlyTableData;
}

const MonthlyBreakdownTable = ({ year, columns, rowData }: MonthlyBreakdownTableProps) => {
  // State for monthly columns
  const [monthlyColumnsState, setMonthlyColumnsState] = useState<TableColumn<MonthlyTableData>[]>([]);
  
  // Generate monthly data using the utility function
  const monthlyData: MonthlyTableData[] = generateMonthlyData(year, rowData);

  // Initialize monthly columns based on parent columns
  useEffect(() => {
    // Create a "Month" column that's always visible and important
    const monthColumn: TableColumn<MonthlyTableData> = {
      key: "month",
      label: "Month",
      isVisible: true,
      isImportant: true
    };
    
    // Map parent columns to monthly columns, preserving visibility settings
    const mappedColumns = columns.slice(1).map(col => ({
      key: col.key as string,
      label: col.label,
      isVisible: col.isVisible,
      isImportant: col.isImportant
    }));
    
    setMonthlyColumnsState([monthColumn, ...mappedColumns]);
  }, [columns]);

  // Filter visible columns
  const visibleColumns = monthlyColumnsState.filter(col => col.isVisible !== false);

  return (
    <div className="py-2 w-full">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium">Monthly Breakdown for Year {year}</h4>
        <ColumnSelector 
          columns={monthlyColumnsState} 
          onChange={setMonthlyColumnsState} 
        />
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
