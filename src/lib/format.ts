import { TFunction } from "i18next";

// hh:mm:ss
export function formatHMS(ms: number): string {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function formatDuration(ms: number, t: TFunction, granularity: "hour" | "minute" = "minute"): string {
    const totalMinutes = Math.max(0, Math.floor(ms / 60000));
    const totalHours = Math.floor(totalMinutes / 60);
    const d = Math.floor(totalHours / 24);
    const h = totalHours % 24;
    const m = totalMinutes % 60;

    const parts: string[] = [];
    if (d > 0) {
        parts.push(t('time.day', { count: d }));
    }
    
    if (granularity === 'hour') {
        if (d > 0 || h > 0) { // if more than a day, or some hours
            parts.push(t('time.hour', { count: h }));
        } else { // less than 1 hour
            return t('time.hour', { count: 0 });
        }
    } else { // minute granularity
        if (h > 0) {
            parts.push(t('time.hour', { count: h }));
        }
        if (m > 0 && d === 0) { // Only show minutes if less than a day
            parts.push(t('time.minute', { count: m }));
        }
    }
    
    if (parts.length === 0) {
        if (granularity === "minute") {
            const totalSeconds = Math.floor(ms / 1000);
            return t('time.second', { count: totalSeconds });
        }
        return t('time.hour', { count: 0 });
    }

    return parts.join(' ');
}

export function formatDaysHours(ms: number, t: TFunction): string {
    const totalMinutes = Math.max(0, Math.floor(ms / 60000));
    const totalHours = Math.floor(totalMinutes / 60);
    const d = Math.floor(totalHours / 24);
    const h = totalHours % 24;
    const m = totalMinutes % 60;

    const parts: string[] = [];
    if (d > 0) {
        parts.push(t('time.day', { count: d }));
    }
    if (h > 0) {
        parts.push(t('time.hour', { count: h }));
    }
    if (m > 0 && d === 0) { // Only show minutes if less than a day
        parts.push(t('time.minute', { count: m }));
    }
    
    if (parts.length === 0) {
        return t('time.hour', { count: 0 });
    }

    return parts.join(' ');
}

export function formatTimeAgo(ts: number, t: TFunction): string {
    const now = Date.now();
    const diff = now - ts * 1000; // ts is in seconds → ms

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) {
        return t('subs_card.just_now');
    }
    if (minutes < 60) {
        return t('subs_card.minutes_ago', { count: minutes });
    } else if (hours < 24) {
        return t('subs_card.hours_ago', { count: hours });
    } else if (days <= 7) { // up to 7 days
        return t('subs_card.days_ago', { count: days });
    }

    // Fallback: show exact date
    return new Date(ts * 1000).toLocaleDateString();
}