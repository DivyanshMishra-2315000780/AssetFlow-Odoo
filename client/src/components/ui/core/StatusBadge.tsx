import cn from "clsx";

type StatusVariant = "success" | "warning" | "danger" | "info" | "default";

const variantMap: Record<string, StatusVariant> = {
  // Asset statuses
  Available: "success",
  "In Use": "info",
  Maintenance: "warning",
  Retired: "default",
  // Employee statuses
  Active: "success",
  Inactive: "default",
  // Generic
  Pending: "warning",
  Approved: "success",
  Rejected: "danger",
  Overdue: "danger",
  Open: "info",
  Closed: "default",
  Completed: "success",
};

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  danger: "bg-red-500/10 text-red-600 border-red-500/20",
  info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  default: "bg-muted text-muted-foreground border-border",
};

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  className?: string;
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolved = variant ?? variantMap[status] ?? "default";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[resolved],
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />
      {status}
    </span>
  );
}
