import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ComparisonResults } from "@/lib/types";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, calculateAbsoluteDifference } from "@/lib/calculations";

const BUY_COLOR = "hsl(215, 65%, 46%)";
const RENT_COLOR = "hsl(162, 50%, 38%)";

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${Math.round(value / 1_000)}K`;
  return `$${value}`;
};

interface ComparisonChartProps {
  results: ComparisonResults | null;
}

const ComparisonChart = ({ results }: ComparisonChartProps) => {
  if (!results) return null;

  const chartData = results.yearlyComparisons.map(c => ({
    year: c.year,
    buying: c.buyingWealth,
    renting: c.rentingWealth
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-lg p-3 shadow-md text-sm">
          <p className="font-medium mb-1">Year {label}</p>
          <p style={{ color: BUY_COLOR }}>Buying: {formatCurrency(payload[0].value)}</p>
          <p style={{ color: RENT_COLOR }}>Renting: {formatCurrency(payload[1].value)}</p>
          <p className="text-muted-foreground text-xs mt-1">
            {formatCurrency(calculateAbsoluteDifference(payload[0].value, payload[1].value))}
            {payload[0].value > payload[1].value ? ' buying ahead' : ' renting ahead'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Wealth Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="gradBuying" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BUY_COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={BUY_COLOR} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradRenting" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={RENT_COLOR} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={RENT_COLOR} stopOpacity={0.02} />
                </linearGradient>
              </defs>
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
              <Area
                type="monotone"
                dataKey="buying"
                name="Buying"
                stroke={BUY_COLOR}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradBuying)"
              />
              <Area
                type="monotone"
                dataKey="renting"
                name="Renting"
                stroke={RENT_COLOR}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradRenting)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonChart;
