import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Point = {
    ts: number;
    pt: number;
};

export type EnergyPowerSeries = {
    energy: Point[];
    power: Point[];
};

function chargeValue(val: number): number {
    // const charge_values = [25, 50, 75, 100, 150, 200];
    if (val > 225) return val;
    else if (val > 175) return 200;
    else if (val > 125) return 150;
    else if (val > 87.5) return 100;
    else if (val > 62.5) return 75;
    else if (val > 37.5) return 50;
    else if (val > 12.5) return 25;
    else return 0;
}

function removeCharges(recent: Point[]): Point[] {
    // remove charge events from recent points
    if (!recent.length) return [];

    let current = recent[0]!.pt;
    let total_charge = 0;
    const res = [recent[0]!];

    for (const { ts, pt } of recent.slice(1)) {
        const diff = pt - current;
        current = pt;
        total_charge += chargeValue(diff);
        res.push({ ts, pt: pt - total_charge });
    }
    return res;
}

function normalizeHistory(history: Point[]): Point[] {
    if (!Array.isArray(history)) return [];

    return [...removeCharges(history)]
        .sort((a, b) => a.ts - b.ts)
        .filter((point, index, arr) => index === 0 || point.ts !== arr[index - 1]!.ts);
}

function buildEnergyGrid(history: Point[], stepSec: number): { gridTs: number[]; gridValues: number[] } | null {
    const sorted = normalizeHistory(history);
    if (sorted.length < 2) return null;

    const firstTs = sorted[0]!.ts;
    const lastTs = sorted[sorted.length - 1]!.ts;
    const gridStart = Math.ceil(firstTs / stepSec) * stepSec;
    const gridEnd = Math.floor(lastTs / stepSec) * stepSec;
    if (gridEnd - gridStart < stepSec) return null;

    let j = 0;
    const gridTs: number[] = [];
    const gridValues: number[] = [];

    for (let t = gridStart; t <= gridEnd; t += stepSec) {
        while (j < sorted.length && sorted[j]!.ts < t) {
            j++;
        }

        if (j === 0) {
            gridTs.push(t);
            gridValues.push(sorted[0]!.pt);
            continue;
        }
        if (j >= sorted.length) {
            gridTs.push(t);
            gridValues.push(sorted[sorted.length - 1]!.pt);
            continue;
        }

        const p1 = sorted[j - 1]!;
        const p2 = sorted[j]!;
        const dt = p2.ts - p1.ts;
        const alpha = dt <= 0 ? 0 : (t - p1.ts) / dt;
        const interpolated = p1.pt + alpha * (p2.pt - p1.pt);

        gridTs.push(t);
        gridValues.push(interpolated);
    }

    if (gridTs.length < 2) return null;
    return { gridTs, gridValues };
}

export function computeEnergyPowerSeries(history: Point[], stepSec = 15 * 60): EnergyPowerSeries {
    const grid = buildEnergyGrid(history, stepSec);
    if (!grid) return { energy: [], power: [] };

    const energy = grid.gridTs.map((ts, index) => ({
        ts,
        pt: grid.gridValues[index]!,
    }));

    const power: Point[] = [];
    for (let i = 1; i < grid.gridTs.length; i++) {
        const dkwh = grid.gridValues[i]! - grid.gridValues[i - 1]!;
        const kw = (dkwh / stepSec) * 3600;
        power.push({ ts: grid.gridTs[i]!, pt: -kw });
    }

    return { energy, power };
}

export function kwh2kw(history: Point[], stepSec = 15 * 60): Point[] {
    return computeEnergyPowerSeries(history, stepSec).power;
}
