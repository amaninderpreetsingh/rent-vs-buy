import { useState } from "react";
import { Table, TableBody, TableHeader, TableRow, TableHead } from "../ui/table";
import ExpandableRow from "./ExpandableRow";
import { ComparisonTableData, TableColumn, YearlyTableData } from "@/lib/types/tableTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown, ChevronUp } from "lucide-react";

const MILESTONE_YEARS = new Set([1, 5, 10, 15, 20, 25, 30, 35, 40]);

interface ComparisonTableTabProps {
  data: any[];
  columns: TableColumn<any>[];
  tabId: string;
  expandedRows: Record<string, boolean>;
  onToggleRow: (tabId: string, rowId: number) => void;
  className?: string;
}

const ComparisonTableTab = ({
  data,
  columns,
  tabId,
  expandedRows,
  onToggleRow,
  className = ""
}: ComparisonTableTabProps) => {
  const isMobile = useIsMobile();
  const [showAllYears, setShowAllYears] = useState(false);

  // On mobile, show only milestone years + the last year unless toggled
  const lastYear = data.length > 0 ? data[data.length - 1].year : 0;
  const displayData = (isMobile && !showAllYears && data.length > 10)
    ? data.filter(row => MILESTONE_YEARS.has(row.year) || row.year === lastYear)
    : data;

  const isCondensed = isMobile && !showAllYears && data.length > 10;
  const hiddenCount = data.length - displayData.length;

  return (
    <div className={`rounded-md border overflow-x-auto ${className}`}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => (
              <TableHead key={col.key as string}>{col.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((row) => (
            <ExpandableRow
              key={row.year}
              rowData={tabId === 'summary' ? {
                ...row,
                betterOption: (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    row.difference > 0
                      ? "bg-buy/10 text-buy-dark"
                      : row.difference < 0
                      ? "bg-rent/10 text-rent-dark"
                      : "bg-gray-100 text-gray-700"
                  }`}>
                    {row.difference > 0
                      ? "Buying"
                      : row.difference < 0
                      ? "Renting"
                      : "Equal"}
                  </span>
                )
              } : row}
              isExpanded={!!expandedRows[`${tabId}-${row.year}`]}
              onToggle={() => onToggleRow(tabId, row.year)}
              columns={columns}
            />
          ))}
        </TableBody>
      </Table>

      {isMobile && data.length > 10 && (
        <button
          onClick={() => setShowAllYears(!showAllYears)}
          className="w-full py-2.5 text-sm font-medium text-primary hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5 border-t"
        >
          {showAllYears ? (
            <>Show milestone years only <ChevronUp className="w-4 h-4" /></>
          ) : (
            <>Show all {data.length} years ({hiddenCount} hidden) <ChevronDown className="w-4 h-4" /></>
          )}
        </button>
      )}
    </div>
  );
};

export default ComparisonTableTab;
