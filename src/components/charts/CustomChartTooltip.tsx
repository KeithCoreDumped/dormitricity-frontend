'use client';

import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

interface CustomChartTooltipProps {
    active?: boolean;
    payload?: Array<{ payload: { ts: number, pt: number }; value: number }>;
    label?: string;
    unit: string;
    seriesLabel: string;
}

export const CustomChartTooltip = ({ active, payload, label, unit, seriesLabel }: CustomChartTooltipProps) => {
    const { i18n } = useTranslation();

    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border bg-background p-2 shadow-sm">
                <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                        <span className="text-[0.7rem] uppercase text-muted-foreground">
                            {seriesLabel}
                        </span>
                        <span className="font-bold text-muted-foreground">
                            {payload[0].value?.toFixed(2)} {unit}
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[0.7rem] uppercase text-muted-foreground">
                            Time
                        </span>
                        <span className="font-bold">
                            {dayjs(label).locale(i18n.language).format("YYYY-MM-DD HH:mm:ss")}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};
