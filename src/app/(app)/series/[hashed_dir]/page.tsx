"use client";

export const runtime = "edge";

import { useEffect, useState, useMemo } from "react";
import { apiClient } from "@/lib/apiClient";
import { SeriesChart } from "@/components/charts/SeriesChart";
import { Button } from "@/components/ui/button";
import { notFound, useParams } from "next/navigation";
import { formatHMS, formatDaysHours } from "@/lib/format";
import { AlertTriangle } from "lucide-react";

type Point = {
    ts: number;
    kwh: number;
};

type LatestData = {
    last_ts: number;
    last_kwh: number;
    last_kw: number | null; // 允许为 null
};

/** 仅负责倒计时的子组件：自身重渲染，不影响父组件和图表 */
function DepletionCountdown({
    depleteAtMs,
    mode,
    lastKw,
}: {
    depleteAtMs: number | null;
    mode: "none" | "second" | "hour";
    lastKw: number | null;
}) {
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
                setText(`${formatHMS(left)} before depletion.`);
            } else {
                setText(`Depletes in ${formatDaysHours(left)}.`);
            }
        };

        tick();
        const interval = mode === "second" ? 1000 : 60 * 60 * 1000;
        const id = setInterval(tick, interval);
        return () => clearInterval(id);
    }, [depleteAtMs, mode]);

    // 固定最小高度，避免无倒计时导致布局跳动
    return (
        <div className="mt-3 min-h-[56px]">
            {text && (
                <div
                    role="alert"
                    aria-live="polite"
                    className="mx-auto max-w-2xl rounded-xl border border-red-300 bg-red-50 px-4 py-3 shadow-sm"
                >
                    <div className="flex items-center justify-center gap-2 text-red-700">
                        <AlertTriangle className="h-6 w-6 shrink-0" />
                        <span className="font-semibold text-base sm:text-lg">
                            {text} Please recharge in time.
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SeriesPage() {
    const { hashed_dir } = useParams() as { hashed_dir: string };
    const [points, setPoints] = useState<Point[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState("24h");
    const [latest, setLatest] = useState<LatestData | null>(null);

    // 估算耗尽时刻与显示模式（只在 latest 变化时计算，不与倒计时的每秒更新绑定）
    const { depleteAtMs, mode } = useMemo(() => {
        if (latest === null || latest.last_kw == null || latest.last_kw >= 0) {
            return {
                depleteAtMs: null as number | null,
                mode: "none" as const,
            };
        }
        const hoursToZero = latest.last_kwh / -latest.last_kw;
        if (!isFinite(hoursToZero) || hoursToZero <= 0) {
            return { depleteAtMs: null, mode: "none" as const };
        }
        const depleteAtSec = latest.last_ts + hoursToZero * 3600;
        const ms = depleteAtSec * 1000;
        const delta = ms - Date.now();
        if (delta <= 0) return { depleteAtMs: null, mode: "none" as const };

        const oneDay = 24 * 3600 * 1000;
        const threeDays = 3 * oneDay;
        if (delta <= oneDay)
            return { depleteAtMs: ms, mode: "second" as const };
        if (delta <= threeDays)
            return { depleteAtMs: ms, mode: "hour" as const };
        return { depleteAtMs: null, mode: "none" as const };
    }, [latest]);

    // 确保传给图表的 data 引用稳定（父组件若因其它原因重渲，会减少不必要的重绘）
    const chartData = useMemo(() => points, [points]);

    useEffect(() => {
        async function fetchData() {
            setIsLoading(true);
            setError(null);
            try {
                const since = new Date();
                if (timeRange === "7d") {
                    since.setDate(since.getDate() - 7);
                } else if (timeRange === "30d") {
                    since.setDate(since.getDate() - 30);
                } else {
                    since.setHours(since.getHours() - 24);
                }

                const data = await apiClient.get(
                    `/series/${hashed_dir}?since=${
                        since.getTime() / 1000
                    }&limit=5000`
                );
                setPoints(data.points);
                setLatest(data.latest);
            } catch (err) {
                if (err instanceof Error) {
                    if (err.message === "NOT_FOUND_OR_EMPTY") {
                        setPoints([]);
                    } else {
                        setError(err.message);
                    }
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [hashed_dir, timeRange]);

    if (isLoading) return <p>Loading chart...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!points) notFound();

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Electricity Consumption</h1>
                <div className="flex gap-2">
                    <Button
                        variant={timeRange === "24h" ? "default" : "outline"}
                        onClick={() => setTimeRange("24h")}
                    >
                        24h
                    </Button>
                    <Button
                        variant={timeRange === "7d" ? "default" : "outline"}
                        onClick={() => setTimeRange("7d")}
                    >
                        7d
                    </Button>
                    <Button
                        variant={timeRange === "30d" ? "default" : "outline"}
                        onClick={() => setTimeRange("30d")}
                    >
                        30d
                    </Button>
                </div>
            </div>

            {/* Countdown */}
            <DepletionCountdown
                depleteAtMs={depleteAtMs}
                mode={mode}
                lastKw={latest?.last_kw ?? null}
            />

            <SeriesChart data={chartData} />
        </div>
    );
}
