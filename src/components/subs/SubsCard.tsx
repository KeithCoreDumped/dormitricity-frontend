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
import { Subscription } from "@/lib/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Settings, LineChart } from "lucide-react";
import { formatHMS, formatDaysHours } from "@/lib/format";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { NotifySetting } from "./NotifySetting";

const ChannelIcon = ({
    channel,
    className,
}: {
    channel: string;
    className?: string;
}) => {
    const iconMap: Record<string, string> = {
        wxwork: "/wxwork.svg",
        feishu: "/feishu.svg",
        serverchan: "/serverchan.png",
        none: "/mute.svg",
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
    const { t } = useTranslation();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const notificationStatus = useMemo(() => {
        if (sub.notify_channel === "none") {
            return { text: t("subs_card.off_status"), active: false };
        }
        const activeRules = [];
        if (sub.threshold_kwh > 0) {
            activeRules.push(t("subs_card.low_power_rule"));
        }
        if (sub.within_hours > 0) {
            activeRules.push(t("subs_card.depletion_rule"));
        }
        if (activeRules.length > 0) {
            return { text: `+${activeRules.length}`, active: true };
        }
        return { text: t("subs_card.on_status"), active: true };
    }, [sub.notify_channel, sub.threshold_kwh, sub.within_hours, t]);

    const { depleteAtMs, mode }: { depleteAtMs: number | null; mode: "none" | "second" | "hour" } = useMemo(() => {
        if (!sub.last_kw || !sub.last_kwh || !sub.last_ts || sub.last_kw >= 0) {
            return { depleteAtMs: null, mode: "none" as const };
        }
        const hoursToZero = sub.last_kwh / -sub.last_kw;
        if (!isFinite(hoursToZero) || hoursToZero <= 0) {
            return { depleteAtMs: null, mode: "none" as const };
        }
        const depleteAtMs = (sub.last_ts + hoursToZero * 3600) * 1000;
        const nowMs = Date.now();
        const delta = depleteAtMs - nowMs;

        if (delta <= 0) return { depleteAtMs: null, mode: "none" as const };

        const oneDayMs = 24 * 3600 * 1000;
        const threeDaysMs = 3 * oneDayMs;

        if (delta <= oneDayMs) return { depleteAtMs, mode: "second" as const };
        if (delta <= threeDaysMs) return { depleteAtMs, mode: "hour" as const };
        return { depleteAtMs: null, mode: "none" as const };
    }, [sub.last_kw, sub.last_kwh, sub.last_ts]);

    const [countdown, setCountdown] = useState<string | null>(null);

    useEffect(() => {
        if (!depleteAtMs || mode === "none") {
            setCountdown(null);
            return;
        }

        const tick = () => {
            const left = depleteAtMs - Date.now();
            if (left <= 0) {
                setCountdown(null);
                return;
            }
            if (mode === "second") {
                setCountdown(
                    t("subs_card.before_depletion", { time: formatHMS(left) })
                );
            } else {
                setCountdown(
                    t("subs_card.depletes_in", {
                        time: formatDaysHours(left, t),
                    })
                );
            }
        };

        tick();
        const interval = mode === "second" ? 1000 : 60 * 60 * 1000;
        const id = setInterval(tick, interval);
        return () => clearInterval(id);
    }, [depleteAtMs, mode, t]);

    function handleSuccess() {
        onChanged();
        setIsSettingsOpen(false);
    }

    function handleSubDeleted() {
        onSubDeleted();
        setIsSettingsOpen(false);
    }

    function formatTime(ts: number): string {
        const diff = Date.now() - ts * 1000;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) {
            return t("subs_card.minutes_ago", {
                count: minutes,
                s: minutes !== 1 ? "s" : "", // plural form
            });
        } else if (hours < 24) {
            return t("subs_card.hours_ago", {
                count: hours,
                s: hours !== 1 ? "s" : "",
            });
        } else if (days < 7) {
            return t("subs_card.days_ago", {
                count: days,
                s: days !== 1 ? "s" : "",
            });
        }
        return new Date(ts * 1000).toLocaleDateString();
    }

    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
            <Card className="flex flex-col h-full overflow-hidden" >
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl font-bold">{sub.canonical_id}</CardTitle>
                            <CardDescription>
                                {t("subs_card.last_updated", {
                                    time: sub.last_ts
                                        ? formatTime(sub.last_ts)
                                        : t("subs_card.never_updated"),
                                })}
                            </CardDescription>
                        </div>
                        <Badge
                            variant={notificationStatus.active ? "default" : "outline"}
                            className="flex items-center gap-1.5 whitespace-nowrap shrink-0"
                        >
                            <ChannelIcon channel={sub.notify_channel} />
                            <span>{notificationStatus.text}</span>
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-center items-center text-center">
                    <div className="text-5xl font-extrabold tracking-tighter">
                        {sub.last_kwh?.toFixed(2) ?? "-"}
                        <span className="text-2xl font-medium text-muted-foreground ml-1">kWh</span>
                    </div>

                    <div className="mt-3 min-h-[2rem] text-sm text-muted-foreground flex items-center justify-center">
                        {countdown && (
                            <div className="flex items-center text-yellow-600 dark:text-yellow-400">
                                <AlertTriangle className="w-4 h-4 mr-1.5" />
                                <span className="font-medium">{countdown}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 bg-muted/30 p-3">
                    <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {t("subs_card.notify_settings_title")}
                                </DialogTitle>
                            </DialogHeader>
                            <NotifySetting
                                sub={sub}
                                onSuccess={handleSuccess}
                                onSubDeleted={handleSubDeleted}
                            />
                        </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/series/${sub.hashed_dir}`}>
                            <LineChart className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
