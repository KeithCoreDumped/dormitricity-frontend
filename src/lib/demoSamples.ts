import { NotifyChannel, Subscription } from "@/lib/types";
import { Point } from "@/lib/utils";
import { demoDataset, testSubs } from "./demoDataset";

const HISTORY_LIMIT = 500;
const SUBS_LIMIT = 3;

export function buildDemoHistory(limit = HISTORY_LIMIT): Point[] {
  const { startTs, intervalSec, values } = demoDataset;
  return values.slice(0, limit).map((kwh, index) => ({
    ts: startTs + index * intervalSec,
    pt: kwh,
  }));
}

export function buildDemoSubscriptions(limit = SUBS_LIMIT): Subscription[] {
  return testSubs.slice(0, limit).map((sub) => ({
    hashed_dir: sub.hashed_dir,
    canonical_id: sub.canonical_id,
    last_ts: sub.last_ts,
    last_kwh: sub.last_kwh,
    last_kw: sub.last_kw,
    notify_channel: sub.notify_channel as NotifyChannel,
    notify_token: sub.notify_token,
    threshold_kwh: sub.threshold_kwh,
    within_hours: sub.within_hours,
    cooldown_sec: sub.cooldown_sec,
  }));
}
