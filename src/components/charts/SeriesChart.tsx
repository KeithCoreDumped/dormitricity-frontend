"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

import dayjs from "dayjs";
import { Point } from "@/lib/utils";

type SeriesChartProps = {
    data: Point[];
    label: string;
    unit: string;
    stroke: string;
};

export function SeriesChart({ data, label, unit, stroke }: SeriesChartProps) {
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
        ts: new Date(point.ts * 1000),
    }));

    let ticks: number[] = [];
    if (formattedData.length > 0) {
        const start = dayjs(formattedData[0].ts).startOf("day");
        const end = dayjs(formattedData[formattedData.length - 1].ts).endOf(
            "day"
        );

        const data_begin = dayjs(formattedData[0].ts).valueOf();
        const data_end = dayjs(
            formattedData[formattedData.length - 1].ts
        ).valueOf();

        let current = start;
        while (current.isBefore(end)) {
            ticks.push(current.valueOf()); // 0 点
            ticks.push(current.add(6, "hour").valueOf());
            ticks.push(current.add(12, "hour").valueOf()); // 12 点
            ticks.push(current.add(18, "hour").valueOf());
            current = current.add(1, "day");
        }

        ticks = ticks.filter((d) => data_begin <= d && data_end >= d);
    }

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart
                data={formattedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="ts"
                    type="number"
                    scale="time"
                    ticks={ticks}
                    tickFormatter={(ts) => dayjs(ts).format("MM/DD HH:mm")}
                    label={{
                        value: "Time",
                        position: "insideBottom",
                        offset: -5,
                    }}
                />
                <YAxis
                    label={{
                        value: `${label} (${unit})`,
                        angle: -90,
                        position: "insideLeft",
                    }}
                />
                <Tooltip
                    labelFormatter={(ts) =>
                        dayjs(ts).format("YYYY-MM-DD HH:mm:ss")
                    }
                    formatter={(value: number) => [
                        `${value.toFixed(2)} ${unit}`, // 显示值 + 单位
                        label, // series 名称
                    ]}
                    // isAnimationActive={false}
                    animationDuration={20}
                />
                {/* <Legend /> */}
                <Line
                    type="monotone"
                    dataKey="pt"
                    stroke={stroke}
                    strokeWidth={2}
                    dot={false} // no dots
                    activeDot={{ r: 8 }}
                    // isAnimationActive={false}
                    animationDuration={200}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
