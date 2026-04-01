import React from "react";
import { Card, CardContent } from "../ui/card";
import { ComparisonResults } from "@/lib/types";
import { formatCurrency } from "@/lib/calculations";
import { TrendingUp, TrendingDown, Equal } from "lucide-react";

interface ResultsSummaryProps {
  results: ComparisonResults | null;
}

const ResultsSummary = ({ results }: ResultsSummaryProps) => {
  if (!results || !results.summary) return null;

  const {
    summary: { finalBuyingWealth, finalRentingWealth, difference, betterOption },
  } = results;

  const displayBuyingWealth = typeof finalBuyingWealth === 'number' ? finalBuyingWealth : 0;
  const displayRentingWealth = typeof finalRentingWealth === 'number' ? finalRentingWealth : 0;
  const displayDifference = typeof difference === 'number' ? difference : 0;

  const verdictColor = betterOption === 'buying' ? 'text-buy' : betterOption === 'renting' ? 'text-rent' : 'text-muted-foreground';
  const VerdictIcon = betterOption === 'buying' ? TrendingUp : betterOption === 'renting' ? TrendingDown : Equal;

  return (
    <div className="space-y-4">
      {/* Verdict banner */}
      <Card className="border-0 bg-foreground text-background">
        <CardContent className="py-5 px-5 sm:px-6">
          <div className="flex items-center gap-3 mb-1">
            <VerdictIcon className="h-5 w-5 shrink-0 opacity-80" />
            <p className="text-sm font-medium opacity-80">
              {betterOption === "buying"
                ? "Buying wins"
                : betterOption === "renting"
                ? "Renting wins"
                : "It's a wash"}
            </p>
          </div>
          {betterOption !== "equal" && (
            <p className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight">
              {formatCurrency(displayDifference)}
              <span className="text-sm sm:text-base font-normal opacity-60 ml-2">more wealth</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-2 gap-3">
        <Card className={betterOption === 'buying' ? 'border-buy/30 bg-buy-light' : ''}>
          <CardContent className="py-4 px-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Buying</p>
            <p className="text-lg sm:text-xl font-bold tabular-nums text-buy-dark">
              {formatCurrency(displayBuyingWealth)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">final wealth</p>
          </CardContent>
        </Card>

        <Card className={betterOption === 'renting' ? 'border-rent/30 bg-rent-light' : ''}>
          <CardContent className="py-4 px-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Renting</p>
            <p className="text-lg sm:text-xl font-bold tabular-nums text-rent-dark">
              {formatCurrency(displayRentingWealth)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">final wealth</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsSummary;
