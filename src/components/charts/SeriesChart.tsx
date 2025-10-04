'use client';

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
import { useTranslation } from "react-i18next";
import { CustomChartTooltip } from "./CustomChartTooltip";

type SeriesChartProps = {
    data: Point[];
    label: string;
    unit: string;
    stroke: string;
};

export function SeriesChart({ data, label, unit, stroke }: SeriesChartProps) {
    const { t, i18n } = useTranslation();

    if (data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <p className="text-lg font-medium">{t('series.no_data_title')}</p>
                <p className="text-sm text-muted-foreground">
                    {t('series.no_data_subtitle')}
                </p>
            </div>
        );
    }

    const formattedData = data.map((point) => ({
        ...point,
        ts: new Date(point.ts * 1000),
    }));

    const timeDomain = [
        dayjs(formattedData[0].ts).valueOf(),
        dayjs(formattedData[formattedData.length - 1].ts).valueOf(),
    ];

    return (
        <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={formattedData}
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={true} />
                    <XAxis
                        dataKey="ts"
                        type="number"
                        scale="time"
                        domain={timeDomain}
                        tickFormatter={(ts) => dayjs(ts).locale(i18n.language).format("MM/DD HH:mm")}
                        stroke="hsl(var(--muted-foreground))"
                        tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
                        label={{
                            value: t('series.time_label'),
                            position: "insideBottom",
                            offset: -15,
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 12,
                        }}
                    />
                    <YAxis
                        domain={['dataMin', 'dataMax']}
                        tickFormatter={(value) => value.toFixed(2)}
                        stroke="hsl(var(--muted-foreground))"
                        tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                        axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
                        label={{
                            value: `${label} (${unit})`,
                            angle: -90,
                            position: "insideLeft",
                            fill: "hsl(var(--muted-foreground))",
                            fontSize: 12,
                        }}
                    />
                    <Tooltip
                        content={<CustomChartTooltip unit={unit} seriesLabel={label} />}
                        animationDuration={200}
                        animationEasing="ease-in-out"
                    />
                    <Line
                        type="monotone"
                        dataKey="pt"
                        stroke={stroke}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: stroke, stroke: "hsl(var(--background))", strokeWidth: 2 }}
                        animationDuration={500}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
