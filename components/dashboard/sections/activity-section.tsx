import { History } from "lucide-react";

import type { ActivityItem } from "@/components/dashboard/data";
import { activityFilters, statusBadgeTone, statusLabel, statusTone } from "@/components/dashboard/helpers";
import { GlassCard, Skeleton } from "@/components/dashboard/ui";
import { truncateAddress } from "@/lib/arc";

type ActivitySectionProps = {
  activityItems: ActivityItem[];
  isLoading: boolean;
  isWalletConnected: boolean;
  selectedFilter: "all" | "incoming" | "outgoing" | "pending";
  onFilterChange: (value: "all" | "incoming" | "outgoing" | "pending") => void;
};

export function ActivitySection({
  activityItems,
  isLoading,
  isWalletConnected,
  selectedFilter,
  onFilterChange
}: ActivitySectionProps) {
  return (
    <GlassCard className="p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-2.5 text-cyan-300">
              <History className="h-4 w-4" />
            </div>
            <h3 className="font-display text-[1.65rem] font-semibold text-slate-100 sm:text-2xl">
              Recent Activity
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Recent USDC transfers fetched from live Arc Testnet Transfer events.
          </p>
        </div>
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto whitespace-nowrap pb-1">
          {activityFilters.map((filter) => (
            <button
              key={filter.label}
              type="button"
              onClick={() => onFilterChange(filter.value)}
              disabled={isLoading}
              className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                selectedFilter === filter.value
                  ? "bg-cyan-500/15 text-cyan-300"
                  : "bg-slate-900/70 text-slate-400 hover:text-slate-200"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div id="history" className="mt-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-800/80 bg-[linear-gradient(180deg,rgba(2,6,23,0.72),rgba(15,23,42,0.60))] p-4 shadow-panel"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="space-y-2 sm:text-right">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20 sm:ml-auto" />
                </div>
              </div>
            </div>
          ))
        ) : activityItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
            {isWalletConnected
              ? "No recent USDC transfer history was found for this wallet."
              : "Connect a wallet to load real Arc Testnet transaction history."}
          </div>
        ) : (
          activityItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-[linear-gradient(180deg,rgba(2,6,23,0.76),rgba(15,23,42,0.62))] p-4 shadow-panel transition hover:-translate-y-0.5 hover:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`rounded-2xl p-3 ${
                      item.positive ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-100 sm:text-base">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{truncateAddress(item.address, 8, 6)}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.timestamp} <span className={statusTone(item.status)}>{statusLabel(item.status)}</span>
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className={`text-base font-semibold ${item.positive ? "text-emerald-400" : "text-slate-200"}`}>
                    {item.amount}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${statusBadgeTone(item.status)}`}
                  >
                    {statusLabel(item.status)}
                  </span>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{item.chain}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </GlassCard>
  );
}
