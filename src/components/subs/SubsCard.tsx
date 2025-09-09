"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Subscription } from "@/app/(app)/subs/page";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { formatHMS, formatDaysHours } from "@/lib/format";

type SubsCardProps = {
    sub: Subscription;
    onSubDeleted: () => void;
};

export function SubsCard({ sub, onSubDeleted }: SubsCardProps) {
    async function handleDelete() {
        if (confirm("Are you sure you want to delete this subscription?")) {
            try {
                await apiClient.delete(`/subs/${sub.hashed_dir}`);
                onSubDeleted();
            } catch (err) {
                if (err instanceof Error) {
                    alert(err.message);
                } else {
                    alert("An unknown error occurred");
                }
            }
        }
    }

    // 估计耗尽时间（毫秒时间戳）与显示模式
    const { depleteAtMs, mode } = useMemo(() => {
        // 忽略 last_kw 为 null 或非负
        if (sub.last_kw == null || sub.last_kw >= 0) {
            return {
                depleteAtMs: null as number | null,
                mode: "none" as const,
            };
        }
        // 估算小时：kWh / kW
        const hoursToZero = sub.last_kwh / -sub.last_kw; // 可能为小数
        if (!isFinite(hoursToZero) || hoursToZero <= 0) {
            return { depleteAtMs: null, mode: "none" as const };
        }
        const depleteAtSec = sub.last_ts + hoursToZero * 3600;
        const depleteAtMs = depleteAtSec * 1000;
        const nowMs = Date.now();
        const delta = depleteAtMs - nowMs;

        if (delta <= 0) return { depleteAtMs: null, mode: "none" as const };

        const oneDayMs = 24 * 3600 * 1000;
        const threeDaysMs = 3 * oneDayMs;

        if (delta <= oneDayMs) return { depleteAtMs, mode: "second" as const };
        if (delta <= threeDaysMs) return { depleteAtMs, mode: "hour" as const };
        return { depleteAtMs: null, mode: "none" as const };
    }, [sub.last_kw, sub.last_kwh, sub.last_ts]);

    // countdown text
    const [countdown, setCountdown] = useState<string | null>(null);

    useEffect(() => {
        if (!depleteAtMs || mode === "none") {
            setCountdown(null);
            return;
        }

        const tick = () => {
            const now = Date.now();
            const left = depleteAtMs - now;
            if (left <= 0) {
                setCountdown(null);
                return;
            }
            if (mode === "second") {
                setCountdown(`${formatHMS(left)} before depletion`);
            } else {
                setCountdown(`Depletes in ${formatDaysHours(left)}`);
            }
        };

        tick();

        // set interval
        const interval = mode === "second" ? 1000 : 60 * 60 * 1000; // every second/every hour
        const id = setInterval(tick, interval);
        return () => clearInterval(id);
    }, [depleteAtMs, mode]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{sub.canonical_id}</CardTitle>
                <CardDescription>
                    Last updated:{" "}
                    {new Date(sub.last_ts * 1000).toLocaleString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <div className="text-4xl font-bold">{sub.last_kwh} kWh</div>
                    <Badge variant={sub.email_alert ? "default" : "outline"}>
                        {sub.email_alert ? "Alerts On" : "Alerts Off"}
                    </Badge>
                </div>

                <div className="mt-3 min-h-[1.5rem] text-sm text-muted-foreground flex items-center">
                    {countdown && (
                        <>
                            <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
                            {countdown}
                        </>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" asChild>
                    <Link href={`/series/${sub.hashed_dir}`}>View Trends</Link>
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                    Unsubscribe
                </Button>
            </CardFooter>
        </Card>
    );
}
