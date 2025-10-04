"use client";

/** —— 通知预览通用组件 —— **/
export function NoticePreview({
  icon = null,
  title,
  subtitle,
  children,
  accent = "indigo",
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  accent?:
    | "indigo"
    | "blue"
    | "sky"
    | "green"
    | "amber"
    | "orange"
    | "rose"
    | "violet";
}) {
  const ring = {
    indigo: "ring-indigo-200/60 dark:ring-indigo-400/30",
    blue: "ring-blue-200/60 dark:ring-blue-400/30",
    sky: "ring-sky-200/60 dark:ring-sky-400/30",
    green: "ring-green-200/60 dark:ring-green-400/30",
    amber: "ring-amber-200/60 dark:ring-amber-400/30",
    orange: "ring-orange-200/60 dark:ring-orange-400/30",
    rose: "ring-rose-200/60 dark:ring-rose-400/30",
    violet: "ring-violet-200/60 dark:ring-violet-400/30",
  }[accent];

  const bg = {
    indigo:
      "bg-indigo-50/80 dark:bg-indigo-500/10 from-indigo-50 to-white dark:from-indigo-950/30 dark:to-transparent",
    blue:
      "bg-blue-50/80 dark:bg-blue-500/10 from-blue-50 to-white dark:from-blue-950/30 dark:to-transparent",
    sky: "bg-sky-50/80 dark:bg-sky-500/10 from-sky-50 to-white dark:from-sky-950/30 dark:to-transparent",
    green:
      "bg-green-50/80 dark:bg-green-500/10 from-green-50 to-white dark:from-green-950/30 dark:to-transparent",
    amber:
      "bg-amber-50/80 dark:bg-amber-500/10 from-amber-50 to-white dark:from-amber-950/30 dark:to-transparent",
    orange:
      "bg-orange-50/80 dark:bg-orange-500/10 from-orange-50 to-white dark:from-orange-950/30 dark:to-transparent",
    rose: "bg-rose-50/80 dark:bg-rose-500/10 from-rose-50 to-white dark:from-rose-950/30 dark:to-transparent",
    violet:
      "bg-violet-50/80 dark:bg-violet-500/10 from-violet-50 to-white dark:from-violet-950/30 dark:to-transparent",
  }[accent];

  return (
    <div className={`mx-auto my-3 max-w-2xl`}>
      <div
        className={`relative overflow-hidden rounded-2xl border border-gray-200/70 dark:border-white/10 p-4 sm:p-5 shadow-sm ring-1 ${ring}`}
      >
        <div
          className={`absolute inset-0 pointer-events-none bg-gradient-to-b ${bg}`}
        />
        <div className="relative flex items-start gap-3">
          {icon ? (
            <div className="mt-0.5 shrink-0 rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 p-2 shadow-sm">
              {icon}
            </div>
          ) : null}
          <div className="min-w-0">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Dormitricity · 通知预览
            </div>
            <h3 className="text-base/tight sm:text-lg/tight font-semibold">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                {subtitle}
              </p>
            ) : null}
            {children ? <div className="mt-3">{children}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** —— 展示型代码块（带标题） —— **/
export function CodeBlock({ title, children }: { title: string; children: string }) {
  return (
    <div className="mx-auto max-w-3xl my-2 overflow-hidden rounded-xl border border-gray-200/70 dark:border-white/10">
      <div className="bg-gray-50/80 dark:bg-white/5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200/70 dark:border-white/10">
        {title}
      </div>
      <pre className="p-3 text-sm leading-relaxed overflow-x-auto bg-white dark:bg-black/40">
        <code>{children}</code>
      </pre>
    </div>
  );
}

/** —— 规则项标题（带小图标） —— **/
export function RuleTitle({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100 mt-4">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-sm">
        {icon}
      </span>
      <span>{children}</span>
    </div>
  );
}