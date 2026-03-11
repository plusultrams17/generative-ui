"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type DataPoint = {
  label: string;
  value: number;
  color?: string;
};

type ChartRendererProps = {
  title: string;
  description?: string;
  type: "bar" | "line" | "pie" | "donut";
  data: DataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
};

const COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(0, 84%, 60%)",
  "hsl(262, 83%, 58%)",
  "hsl(190, 90%, 50%)",
  "hsl(330, 80%, 60%)",
  "hsl(60, 70%, 50%)",
];

function getColor(index: number, custom?: string) {
  return custom || COLORS[index % COLORS.length];
}

import { memo } from "react";

export const ChartRenderer = memo(function ChartRenderer({
  title,
  description,
  type,
  data,
  xAxisLabel,
  yAxisLabel,
}: ChartRendererProps) {
  const chartData = data.map((d) => ({ name: d.label, value: d.value }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === "bar" ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="name"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={
                  xAxisLabel
                    ? { value: xAxisLabel, position: "insideBottom", offset: -5, fontSize: 12 }
                    : undefined
                }
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={
                  yAxisLabel
                    ? { value: yAxisLabel, angle: -90, position: "insideLeft", fontSize: 12 }
                    : undefined
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={getColor(i, entry.color)} />
                ))}
              </Bar>
            </BarChart>
          ) : type === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="name"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={
                  xAxisLabel
                    ? { value: xAxisLabel, position: "insideBottom", offset: -5, fontSize: 12 }
                    : undefined
                }
              />
              <YAxis
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={
                  yAxisLabel
                    ? { value: yAxisLabel, angle: -90, position: "insideLeft", fontSize: 12 }
                    : undefined
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={COLORS[0]}
                strokeWidth={2}
                dot={{ fill: COLORS[0], r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={type === "donut" ? 60 : 0}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={getColor(i, entry.color)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--popover))",
                  color: "hsl(var(--popover-foreground))",
                }}
              />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});
