import type { ConservationStatus } from "./types";

export const statusConfig: Record<
  ConservationStatus,
  { label: string; color: string; bgColor: string; borderColor: string; severity: number }
> = {
  EX: {
    label: "Extinct",
    color: "text-[oklch(0.45_0.18_20)]",
    bgColor: "bg-[oklch(0.45_0.18_20/0.15)]",
    borderColor: "border-[oklch(0.45_0.18_20/0.4)]",
    severity: 8,
  },
  EW: {
    label: "Extinct in Wild",
    color: "text-[oklch(0.55_0.20_22)]",
    bgColor: "bg-[oklch(0.55_0.20_22/0.15)]",
    borderColor: "border-[oklch(0.55_0.20_22/0.4)]",
    severity: 7,
  },
  CR: {
    label: "Critically Endangered",
    color: "text-[oklch(0.68_0.21_28)]",
    bgColor: "bg-[oklch(0.68_0.21_28/0.15)]",
    borderColor: "border-[oklch(0.68_0.21_28/0.4)]",
    severity: 6,
  },
  EN: {
    label: "Endangered",
    color: "text-[oklch(0.75_0.18_52)]",
    bgColor: "bg-[oklch(0.75_0.18_52/0.15)]",
    borderColor: "border-[oklch(0.75_0.18_52/0.4)]",
    severity: 5,
  },
  VU: {
    label: "Vulnerable",
    color: "text-[oklch(0.82_0.15_88)]",
    bgColor: "bg-[oklch(0.82_0.15_88/0.15)]",
    borderColor: "border-[oklch(0.82_0.15_88/0.4)]",
    severity: 4,
  },
  NT: {
    label: "Near Threatened",
    color: "text-[oklch(0.80_0.12_125)]",
    bgColor: "bg-[oklch(0.80_0.12_125/0.15)]",
    borderColor: "border-[oklch(0.80_0.12_125/0.4)]",
    severity: 3,
  },
  LC: {
    label: "Least Concern",
    color: "text-[oklch(0.72_0.14_152)]",
    bgColor: "bg-[oklch(0.72_0.14_152/0.15)]",
    borderColor: "border-[oklch(0.72_0.14_152/0.4)]",
    severity: 2,
  },
  DD: {
    label: "Data Deficient",
    color: "text-[oklch(0.65_0.04_260)]",
    bgColor: "bg-[oklch(0.65_0.04_260/0.15)]",
    borderColor: "border-[oklch(0.65_0.04_260/0.4)]",
    severity: 1,
  },
  NE: {
    label: "Not Evaluated",
    color: "text-muted-foreground",
    bgColor: "bg-muted/30",
    borderColor: "border-muted",
    severity: 0,
  },
};

export function getStatusConfig(status: ConservationStatus) {
  return statusConfig[status] ?? statusConfig.NE;
}

export function isThreatened(status: ConservationStatus): boolean {
  return ["EX", "EW", "CR", "EN", "VU"].includes(status);
}
