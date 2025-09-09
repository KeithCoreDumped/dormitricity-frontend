import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Point = {
    ts: number;
    pt: number;
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

export function kwh2kw(history: Point[], stepSec = 15 * 60): Point[] {
  if (!Array.isArray(history) || history.length < 2) return [];

  // 1) 按时间升序去重（若存在相同 ts，保留最后一个）
  const sorted = [...removeCharges(history)]
    .sort((a, b) => a.ts - b.ts)
    .filter((p, i, arr) => i === 0 || p.ts !== arr[i - 1].ts);

  if (sorted.length < 2) return [];

  // 2) 计算网格范围（对齐到 stepSec 的整数倍）
  const firstTs = sorted[0].ts;
  const lastTs  = sorted[sorted.length - 1].ts;

  const gridStart = Math.ceil(firstTs / stepSec) * stepSec; // 向上对齐
  const gridEnd   = Math.floor(lastTs / stepSec) * stepSec; // 向下对齐
  if (gridEnd - gridStart < stepSec) return [];

  // 3) 线性插值函数：给定任意 ts（范围内），求插值后的 kwh
  // 使用双指针一次线性扫描，整体 O(n + m)
  let j = 0; // 指向当前右端点的候选
  const interpAt = (t: number): number => {
    // 推进 j，使得 sorted[j-1].ts <= t <= sorted[j].ts
    while (j < sorted.length && sorted[j].ts < t) j++;
    // 边界保护（理论上 t 已在 [firstTs, lastTs] 且对齐，不会走到这里）
    if (j === 0) return sorted[0].pt;
    if (j >= sorted.length) return sorted[sorted.length - 1].pt;

    const p1 = sorted[j - 1];
    const p2 = sorted[j];
    const dt = p2.ts - p1.ts;
    if (dt <= 0) return p2.pt; // 避免除 0，退化为右值

    const alpha = (t - p1.ts) / dt;
    return p1.pt + alpha * (p2.pt - p1.pt);
  };

  // 4) 生成网格点上的插值 kwh
  const gridTs: number[] = [];
  for (let t = gridStart; t <= gridEnd; t += stepSec) gridTs.push(t);
  if (gridTs.length < 2) return [];

  const gridKwh = gridTs.map((t) => interpAt(t));

  // 5) 区间差分 → 平均功率（kW）
  const out: Point[] = [];
  for (let i = 1; i < gridTs.length; i++) {
    const dt = stepSec; // 恒定步长
    const dkwh = gridKwh[i] - gridKwh[i - 1];
    const kw = (dkwh / dt) * 3600; // kWh/s → kW
    out.push({ ts: gridTs[i], pt: -kw });
  }
  return out;
}
