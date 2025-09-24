'use client';

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
import { Subscription } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Settings, LineChart } from "lucide-react";
import { formatHMS, formatDaysHours } from "@/lib/format";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NotifySetting } from "./NotifySetting";

const ChannelIcon = ({ channel, className }: { channel: string, className?: string }) => {
    const iconMap: Record<string, string> = {
        wxwork: '/wxwork.svg',
        feishu: '/feishu.svg',
        serverchan: '/serverchan.png',
        none: '/mute.svg'
    };
    const src = iconMap[channel];
    if (!src) return null;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={channel} className={`w-4 h-4 ${className}`} />;
};

type SubsCardProps = {
    sub: Subscription;
    onSubDeleted: () => void;
    onChanged: () => void;
};

export function SubsCard({ sub, onSubDeleted, onChanged }: SubsCardProps) {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const notificationStatus = useMemo(() => {
        if (sub.notify_channel === 'none') {
            return { text: 'Off', active: false };
        }
        const activeRules = [];
        if (sub.threshold_kwh > 0) {
            activeRules.push('Low Power');
        }
        if (sub.within_hours > 0) {
            activeRules.push('Depletion');
        }
        if (activeRules.length > 0) {
            return { text: "+" + activeRules.length, active: true };
        }
        return { text: 'On', active: true };
    }, [sub.notify_channel, sub.threshold_kwh, sub.within_hours]);

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

    function handleSuccess() {
        onChanged();
        setIsSettingsOpen(false);
    }

    function handleSubDeleted() {
        onSubDeleted();
        setIsSettingsOpen(false);
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>{sub.canonical_id}</CardTitle>
                        <CardDescription>
                            Last updated:{" "}
                            {new Date(sub.last_ts * 1000).toLocaleString()}
                        </CardDescription>
                    </div>
                    <Badge variant={notificationStatus.active ? "default" : "outline"} className="flex items-center gap-1.5 whitespace-nowrap">
                        <ChannelIcon channel={sub.notify_channel} />
                        <span>{notificationStatus.text}</span>
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <div className="text-4xl font-bold">{sub.last_kwh.toFixed(2)} kWh</div>

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
                <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Notify Settings</DialogTitle>
                        </DialogHeader>
                        <NotifySetting sub={sub} onSuccess={handleSuccess} onSubDeleted={handleSubDeleted} />
                    </DialogContent>
                </Dialog>
                <Button variant="outline" size="icon" asChild>
                    <Link href={`/series/${sub.hashed_dir}`}><LineChart className="h-4 w-4" /></Link>
                </Button>
            </CardFooter>
        </Card>
    );
}