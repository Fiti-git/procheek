"use client";

import { cn } from "@/lib/cn";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "coral" | "success";
}) {
  const iconClass =
    tone === "coral"
      ? "bg-coral-50 text-coral-500"
      : tone === "success"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-canvas-2 text-ink-700";
  return (
    <div className="card-enterprise p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink-500 font-medium">
            {label}
          </p>
          <p className="font-display text-3xl font-semibold text-ink-900 tracking-tight mt-2">
            {value}
          </p>
          {hint && (
            <p className="text-xs text-ink-500 mt-1.5">{hint}</p>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center",
              iconClass,
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}

export default KpiCard;
