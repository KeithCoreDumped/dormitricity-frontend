'use client';

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

interface SeriesPageHeaderProps {
    timeRange: string;
    setTimeRange: (range: string) => void;
    title: string;
}

export function SeriesPageHeader({ timeRange, setTimeRange, title }: SeriesPageHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight mb-4 sm:mb-0">{title}</h1>
            <div className="flex gap-2">
                <Button
                    variant={timeRange === "24h" ? "default" : "outline"}
                    onClick={() => setTimeRange("24h")}
                >
                    {t('series.24h_button')}
                </Button>
                <Button
                    variant={timeRange === "7d" ? "default" : "outline"}
                    onClick={() => setTimeRange("7d")}
                >
                    {t('series.7d_button')}
                </Button>
                <Button
                    variant={timeRange === "30d" ? "default" : "outline"}
                    onClick={() => setTimeRange("30d")}
                >
                    {t('series.30d_button')}
                </Button>
            </div>
        </div>
    );
}
