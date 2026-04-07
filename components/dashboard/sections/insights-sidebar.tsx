import { ArrowRight, ChevronRight } from "lucide-react";

import type { InsightItem } from "@/components/dashboard/data";
import { ARC_TESTNET } from "@/lib/arc";
import { GlassCard } from "@/components/dashboard/ui";

type InsightsSidebarProps = {
  insightItems: InsightItem[];
  networkStatus: string;
  pulseBars: number[];
};

export function InsightsSidebar({
  insightItems,
  networkStatus,
  pulseBars
}: InsightsSidebarProps) {
  return (
    <aside className="flex flex-col gap-6">
      <GlassCard className="p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-cyan-400" />
          <h3 className="font-display text-[1.65rem] font-semibold text-slate-100 sm:text-2xl">
            Treasury Insights
          </h3>
        </div>

        <div className="mt-6 space-y-5">
          {insightItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-3 text-cyan-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-slate-100">{item.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Network Pulse</p>
              <p className="mt-2 text-sm font-semibold text-emerald-400">{networkStatus}</p>
            </div>
            <div className="flex h-10 items-end gap-1.5" aria-hidden="true">
              {pulseBars.map((bar, index) => (
                <span
                  key={bar}
                  className="w-3 rounded-full bg-cyan-400/80 motion-safe:animate-pulse-bars"
                  style={{ height: `${16 + (index % 4) * 6}px`, animationDelay: `${index * 120}ms` }}
                />
              ))}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="relative overflow-hidden rounded-[28px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(8,15,32,0.95),rgba(7,17,37,0.92))] p-5 shadow-panel sm:p-6">
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.18),transparent_38%),linear-gradient(135deg,transparent_35%,rgba(34,211,238,0.08)_55%,transparent_75%)]" />
        <div className="absolute -right-10 top-8 h-24 w-24 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="relative">
          <span className="inline-flex rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
            LIVE
          </span>
          <h3 className="mt-4 max-w-[14ch] font-display text-3xl font-semibold leading-tight text-white">
            Advanced Vault Liquidity Pools
          </h3>
          <p className="mt-3 max-w-[28ch] text-sm leading-6 text-slate-300">
            Use the Arc explorer and live treasury feed to verify payout flows and reserve movement in real time.
          </p>
          <a
            href={ARC_TESTNET.blockExplorerUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            Explore Vaults
            <ArrowRight className="h-4 w-4" />
          </a>
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/50 px-4 py-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
            <p className="text-sm text-slate-300">
              Arc explorer online with <span className="text-white">live transaction visibility</span>
            </p>
            <ChevronRight className="ml-auto h-4 w-4 text-slate-500" />
          </div>
        </div>
      </div>
    </aside>
  );
}
