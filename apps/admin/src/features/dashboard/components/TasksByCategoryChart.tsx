"use client";

import type { TasksByCategoryRow } from "@repo/features/escrow/services/analytics.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@repo/ui/components/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

type TasksByCategoryChartProps = {
  data: TasksByCategoryRow[];
};

const chartConfig = {
  count: {
    label: "Tasks",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export const TasksByCategoryChart = ({ data }: TasksByCategoryChartProps) => {
  if (data.length === 0) {
    return null;
  }

  const chartData = data.map((row) => ({
    category: row.category,
    shortCategory:
      row.category.length > 18
        ? `${row.category.slice(0, 16)}…`
        : row.category,
    count: row.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks by category</CardTitle>
        <CardDescription>Fixed task menu distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[280px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{ left: 8, right: 12 }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="shortCategory"
              type="category"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              width={120}
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" fill="var(--color-count)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
