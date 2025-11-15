'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import dayjs from "dayjs";
import { useMemo } from "react";
import { computeEnergyPowerSeries, Point } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { CustomChartTooltip } from "./CustomChartTooltip";

type SingleSeriesChartProps = {
  variant?: "single";
  data: Point[];
  label: string;
  unit: string;
  stroke: string;
};

type DualSeriesChartProps = {
  variant: "dual";
  history: Point[];
};

type SeriesChartProps = SingleSeriesChartProps | DualSeriesChartProps;

function SingleSeriesChart({ data, label, unit, stroke }: SingleSeriesChartProps) {
  const { t, i18n } = useTranslation();

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-lg font-medium">{t("series.no_data_title")}</p>
        <p className="text-sm text-muted-foreground">
          {t("series.no_data_subtitle")}
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
          <CartesianGrid strokeDasharray="3 3" vertical />
          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={timeDomain}
            tickFormatter={(ts) =>
              dayjs(ts).locale(i18n.language).format("MM/DD HH:mm")
            }
            stroke="hsl(var(--muted-foreground))"
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
            label={{
              value: t("series.time_label"),
              position: "insideBottom",
              offset: -15,
              fill: "hsl(var(--muted-foreground))",
              fontSize: 12,
            }}
          />
          <YAxis
            domain={["dataMin", "dataMax"]}
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
            activeDot={{
              r: 6,
              fill: stroke,
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DualSeriesChart({ history }: DualSeriesChartProps) {
  const { t, i18n } = useTranslation();
  const { energy, power } = useMemo(
    () => computeEnergyPowerSeries(history),
    [history]
  );

  const chartData = useMemo(() => {
    if (energy.length <= 1 || power.length === 0) return [];
    return power.map((point, index) => {
      const energyPoint = energy[index + 1];
      return {
        ts: point.ts * 1000,
        kwh: energyPoint ? Number(energyPoint.pt.toFixed(2)) : null,
        kw: Number(point.pt.toFixed(2)),
      };
    });
  }, [energy, power]);

  if (chartData.length === 0) {
    return (
      <div className="flex h-96 w-full flex-col items-center justify-center text-center">
        <p className="text-lg font-medium">{t("series.no_data_title")}</p>
        <p className="text-sm text-muted-foreground">
          {t("series.no_data_subtitle")}
        </p>
      </div>
    );
  }

  const timeDomain: [number, number] = [
    chartData[0]!.ts,
    chartData[chartData.length - 1]!.ts,
  ];

  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical />
          <XAxis
            dataKey="ts"
            type="number"
            domain={timeDomain}
            tickFormatter={(value) =>
              dayjs(value).locale(i18n.language).format("MM/DD HH:mm")
            }
            stroke="hsl(var(--muted-foreground))"
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
            label={{
              value: t("series.time_label"),
              position: "insideBottom",
              offset: -15,
              fill: "hsl(var(--muted-foreground))",
              fontSize: 12,
            }}
          />
          <YAxis
            yAxisId="energy"
            tickFormatter={(value) => value.toFixed(1)}
            stroke="hsl(var(--muted-foreground))"
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
            label={{
              value: `${t("series.energy_label")} (kWh)`,
              angle: -90,
              position: "insideLeft",
              fill: "hsl(var(--muted-foreground))",
              fontSize: 12,
            }}
          />
          <YAxis
            yAxisId="power"
            orientation="right"
            tickFormatter={(value) => value.toFixed(2)}
            stroke="hsl(var(--muted-foreground))"
            tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
            axisLine={{ stroke: "hsl(var(--muted-foreground))" }}
            label={{
              value: `${t("series.power_label")} (kW)`,
              angle: 90,
              position: "insideRight",
              fill: "hsl(var(--muted-foreground))",
              fontSize: 12,
            }}
          />
          <Tooltip content={<DualTooltip />} />
          <Legend
            verticalAlign="top"
            height={32}
            wrapperStyle={{ color: "hsl(var(--muted-foreground))" }}
            formatter={(value) =>
              value === "kwh"
                ? `${t("series.energy_label")} (kWh)`
                : `${t("series.power_label")} (kW)`
            }
          />
          <Line
            yAxisId="energy"
            type="monotone"
            dataKey="kwh"
            stroke="var(--color-kwh)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: "var(--color-kwh)",
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
            connectNulls
          />
          <Line
            yAxisId="power"
            type="monotone"
            dataKey="kw"
            stroke="var(--color-kw)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: "var(--color-kw)",
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DualTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ dataKey?: string; value?: number }>;
  label?: number;
}) {
  const { t, i18n } = useTranslation();

  if (!active || !payload?.length || !label) {
    return null;
  }

  const energyPoint = payload.find((item) => item.dataKey === "kwh");
  const powerPoint = payload.find((item) => item.dataKey === "kw");

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="text-xs font-medium text-muted-foreground">
        {dayjs(label).locale(i18n.language).format("YYYY-MM-DD HH:mm")}
      </p>
      <div className="mt-2 space-y-1 text-sm">
        {energyPoint && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">
              {t("series.energy_label")}
            </span>
            <span className="font-semibold">
              {energyPoint.value?.toFixed(2)} kWh
            </span>
          </div>
        )}
        {powerPoint && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">
              {t("series.power_label")}
            </span>
            <span className="font-semibold">
              {powerPoint.value?.toFixed(2)} kW
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function SeriesChart(props: SeriesChartProps) {
  if (props.variant === "dual") {
    return <DualSeriesChart history={props.history} />;
  }
  const { data, label, unit, stroke } = props;
  return (
    <SingleSeriesChart data={data} label={label} unit={unit} stroke={stroke} />
  );
}
