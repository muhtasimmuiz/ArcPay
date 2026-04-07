import type { ActivityStatus } from "@/components/dashboard/data";

export const activityFilters: Array<{
  label: string;
  value: "all" | "incoming" | "outgoing" | "pending";
}> = [
  { label: "All", value: "all" },
  { label: "Incoming", value: "incoming" },
  { label: "Outgoing", value: "outgoing" },
  { label: "Pending", value: "pending" }
];

export function statusTone(status: ActivityStatus) {
  switch (status) {
    case "pending":
      return "text-amber-300";
    case "failed":
      return "text-red-300";
    case "completed":
      return "text-slate-300";
    case "finalized":
    case "success":
      return "text-emerald-400";
    default:
      return "text-slate-300";
  }
}

export function statusBadgeTone(status: ActivityStatus) {
  switch (status) {
    case "success":
    case "finalized":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";
    case "pending":
      return "border-amber-400/20 bg-amber-500/10 text-amber-300";
    case "failed":
      return "border-red-400/20 bg-red-500/10 text-red-300";
    default:
      return "border-slate-700 bg-slate-900/70 text-slate-300";
  }
}

export function statusLabel(status: ActivityStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
