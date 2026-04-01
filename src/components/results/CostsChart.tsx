import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ComparisonResults } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, calculateAbsoluteDifference } from "@/lib/calculations";

const BUY_COLOR = "hsl(215, 65%, 46%)";
const RENT_COLOR = "hsl(162, 50%, 38%)";

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
};

interface CostsChartProps {
  results: ComparisonResults | null;
}

const CostsChart = ({ results }: CostsChartProps) => {
  if (!results) return null;

  const chartData = results.yearlyComparisons.map(c => ({
    year: c.year,
    buyingCosts: c.cumulativeBuyingCosts,
    rentingCosts: c.cumulativeRentingCosts
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-md text-sm">
          <p className="font-medium mb-1">Year {label}</p>
          <p style={{ color: BUY_COLOR }}>Buying: {formatCurrency(payload[0].value)}</p>
          <p style={{ color: RENT_COLOR }}>Renting: {formatCurrency(payload[1].value)}</p>
          <p className="text-muted-foreground text-xs mt-1">
            Difference: {formatCurrency(calculateAbsoluteDifference(payload[0].value, payload[1].value))}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Cumulative Costs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 90%)" strokeOpacity={0.5} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={formatYAxis}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Bar dataKey="buyingCosts" name="Buying" fill={BUY_COLOR} radius={[2, 2, 0, 0]} />
              <Bar dataKey="rentingCosts" name="Renting" fill={RENT_COLOR} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostsChart;
