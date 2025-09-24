export type Subscription = {
  hashed_dir: string;
  canonical_id: string;
  last_ts: number;
  last_kwh: number;
  last_kw: number;

  notify_channel: NotifyChannel;
  notify_token?: string | null;
  threshold_kwh: number;
  within_hours: number;
  cooldown_sec: number;
};

export type NotifyChannel = "none" | "wxwork" | "feishu" | "serverchan";
