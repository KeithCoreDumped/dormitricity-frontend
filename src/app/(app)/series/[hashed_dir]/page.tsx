'use client';

export const runtime = "edge";

import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import { SeriesChart } from "@/components/charts/SeriesChart";
import { notFound, useParams } from "next/navigation";
import { formatHMS, formatDaysHours } from "@/lib/format";
import { AlertTriangle } from "lucide-react";
import { type Point, kwh2kw } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { SeriesChartSkeleton } from "@/components/charts/SeriesChartSkeleton";
import { SeriesPageHeader } from "@/components/charts/SeriesPageHeader";
import { Card } from "@/components/ui/card";

type LatestData = {
    last_ts: number;
    last_kwh: number;
    last_kw: number | null;
};

function DepletionCountdown({
    depleteAtMs,
    mode,
}: {
    depleteAtMs: number | null;
    mode: "none" | "second" | "hour";
}) {
    const { t } = useTranslation();
    const [text, setText] = useState<string>("");

    useEffect(() => {
        if (!depleteAtMs || mode === "none") {
            setText("");
            return;
        }

        const tick = () => {
            const left = depleteAtMs - Date.now();
            if (left <= 0) {
                setText("");
                return;
            }
            if (mode === "second") {
                setText(`${formatHMS(left)}`);
            } else {
                setText(`${formatDaysHours(left, t)}`);
            }
        };

        tick();
        const interval = mode === "second" ? 1000 : 60 * 60 * 1000;
        const id = setInterval(tick, interval);
        return () => clearInterval(id);
    }, [depleteAtMs, mode, t]);

    return (
        <AnimatePresence>
            {text && (
                <motion.div
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                >
                    <div
                        role="alert"
                        aria-live="polite"
                        className="mx-auto mb-6 max-w-2xl rounded-lg border border-destructive/50 bg-destructive/10 p-4 shadow-sm"
                    >
                        <div className="flex items-center justify-center gap-3 text-destructive">
                            <AlertTriangle className="h-6 w-6 shrink-0" />
                            <div className="text-center">
                                <p className="font-bold text-base sm:text-lg">
                                    {t('series.depletes_in')} {text}
                                </p>
                                <p className="text-sm">{t('series.recharge_in_time')}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default function SeriesPage() {
    const { t } = useTranslation();
    const { hashed_dir } = useParams() as { hashed_dir: string };
    const [points, setPoints] = useState<Point[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState("24h");
    const [latest, setLatest] = useState<LatestData | null>(null);

    const { depleteAtMs, mode } = useMemo(() => {
        if (latest === null || latest.last_kw == null || latest.last_kw >= 0) {
            return { depleteAtMs: null, mode: "none" as const };
        }
        const hoursToZero = latest.last_kwh / -latest.last_kw;
        if (!isFinite(hoursToZero) || hoursToZero <= 0) {
            return { depleteAtMs: null, mode: "none" as const };
        }
        const depleteAtMs = (latest.last_ts + hoursToZero * 3600) * 1000;
        const delta = depleteAtMs - Date.now();
        if (delta <= 0) return { depleteAtMs: null, mode: "none" as const };

        const oneDay = 24 * 3600 * 1000;
        const threeDays = 3 * oneDay;
        if (delta <= oneDay) return { depleteAtMs, mode: "second" as const };
        if (delta <= threeDays) return { depleteAtMs, mode: "hour" as const };
        return { depleteAtMs: null, mode: "none" as const };
    }, [latest]);

    const kwhData = useMemo(() => points, [points]);
    const kwData = useMemo(() => kwh2kw(points), [points]);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const since = new Date();
                if (timeRange === "7d") since.setDate(since.getDate() - 7);
                else if (timeRange === "30d") since.setDate(since.getDate() - 30);
                else since.setHours(since.getHours() - 24);

                const data = await apiClient.get(
                    `/series/${hashed_dir}?since=${since.getTime() / 1000}&limit=5000`
                );
                setPoints(
                    data.points.map((p: { ts: number; kwh: number }) => ({ ts: p.ts, pt: p.kwh }))
                );
                setLatest(data.latest);
            } catch (err) {
                if (err instanceof Error && err.message === "NOT_FOUND_OR_EMPTY") {
                    setPoints([]);
                } else {
                    setError(t('unknown_error'));
                }
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [hashed_dir, timeRange, t]);

    if (error) return <p className="text-red-500 text-center py-10">{error}</p>;
    if (!points && !isLoading) notFound();

    const chartVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    return (
        <div className="space-y-6">
            <SeriesPageHeader 
                timeRange={timeRange} 
                setTimeRange={setTimeRange} 
                title={t('series.title')} 
            />

            <DepletionCountdown depleteAtMs={depleteAtMs} mode={mode} />

            {isLoading ? (
                <div className="space-y-6">
                    <SeriesChartSkeleton />
                    <SeriesChartSkeleton />
                </div>
            ) : (
                <motion.div 
                    className="space-y-6"
                    initial="hidden"
                    animate="visible"
                    variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
                >
                    <motion.div variants={chartVariants}>
                        <Card>
                            <SeriesChart
                                data={kwhData}
                                label={t('series.energy_label')}
                                unit="kWh"
                                stroke="var(--color-kwh)"
                            />
                        </Card>
                    </motion.div>
                    <motion.div variants={chartVariants}>
                        <Card>
                            <SeriesChart
                                data={kwData}
                                label={t('series.power_label')}
                                unit="kW"
                                stroke="var(--color-kw)"
                            />
                        </Card>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
