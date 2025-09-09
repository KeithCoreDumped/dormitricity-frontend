// hh:mm:ss
export function formatHMS(ms: number): string {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// x days x hours
export function formatDaysHours(ms: number): string {
    const totalHours = Math.max(0, Math.floor(ms / 3600000));
    const d = Math.floor(totalHours / 24);
    const h = totalHours % 24;
    return `${d} days ${h} hours`;
}