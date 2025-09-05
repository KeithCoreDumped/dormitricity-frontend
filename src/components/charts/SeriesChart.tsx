'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Point = {
  ts: number;
  kwh: number;
};

type SeriesChartProps = {
  data: Point[];
};

export function SeriesChart({ data }: SeriesChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-16">
        <p>No data available for the selected time range.</p>
        <p className="text-sm text-muted-foreground">
          The backend automatically pulls kWh data every 10 mins.
        </p>
      </div>
    );
  }

  const formattedData = data.map((point) => ({
    ...point,
    ts: new Date(point.ts * 1000).toLocaleString(),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="ts" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="kwh"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}