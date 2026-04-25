import { cn } from "@/lib/utils";
import { getStatusConfig } from "@/lib/conservation";
import type { ConservationStatus } from "@/lib/types";

const dotColors: Record<ConservationStatus, string> = {
  EX: "oklch(0.45 0.18 20)",
  EW: "oklch(0.55 0.20 22)",
  CR: "oklch(0.68 0.21 28)",
  EN: "oklch(0.75 0.18 52)",
  VU: "oklch(0.82 0.15 88)",
  NT: "oklch(0.80 0.12 125)",
  LC: "oklch(0.72 0.14 152)",
  DD: "oklch(0.65 0.04 260)",
  NE: "oklch(0.60 0 0)",
};

interface StatusBadgeProps {
  status: ConservationStatus;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-semibold rounded-full border",
        size === "sm" && "px-2 py-0.5 text-[10px]",
        size === "md" && "px-3 py-1 text-xs",
        size === "lg" && "px-4 py-1.5 text-sm",
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <span
        className={cn("rounded-full shrink-0", size === "sm" ? "h-1.5 w-1.5" : "h-2 w-2")}
        style={{ backgroundColor: dotColors[status] }}
      />
      {config.label}
    </span>
  );
}
