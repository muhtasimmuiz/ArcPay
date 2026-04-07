import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  Info
} from "lucide-react";

import type { SummaryStat, TreasurySnapshot } from "@/components/dashboard/data";
import { ARC_TESTNET, truncateAddress } from "@/lib/arc";
import { SectionLabel, Skeleton, Tooltip, GlassCard } from "@/components/dashboard/ui";

type TreasuryOverviewProps = {
  currentBalanceLabel: string;
  dynamicSummaryStats: SummaryStat[];
  isBalanceLoading: boolean;
  isConnecting: boolean;
  isReceivePending: boolean;
  isSending: boolean;
  isWrongNetwork: boolean;
  syncStatus: "idle" | "success" | "error";
  networkStatusLabel: string;
  onConnect: () => void;
  onOpenSend: () => void;
  onReceive: () => void;
  treasurySnapshot: TreasurySnapshot;
  txState: {
    hash: string;
    status: "pending" | "success" | "failed";
    description: string;
  } | null;
};

export function TreasuryOverview({
  currentBalanceLabel,
  dynamicSummaryStats,
  isBalanceLoading,
  isConnecting,
  isReceivePending,
  isSending,
  isWrongNetwork,
  syncStatus,
  networkStatusLabel,
  onConnect,
  onOpenSend,
  onReceive,
  treasurySnapshot,
  txState
}: TreasuryOverviewProps) {
  const syncBadgeClass =
    syncStatus === "success"
      ? "border-emerald-400/15 bg-emerald-500/10 text-emerald-300"
      : syncStatus === "error"
        ? "border-amber-400/20 bg-amber-500/10 text-amber-200"
        : "border-slate-700 bg-slate-900/70 text-slate-400";

  return (
    <GlassCard className="relative overflow-hidden p-5 sm:p-7 xl:p-8">
      <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative flex flex-col gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <SectionLabel>Total USDC Balance</SectionLabel>
              <Tooltip label="Live balance fetched directly from the Arc Testnet USDC contract">
                <button
                  type="button"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
                >
                  <Info className="h-4 w-4" />
                </button>
              </Tooltip>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              {isBalanceLoading ? (
                <>
                  <Skeleton className="h-14 w-56 sm:h-16 sm:w-72" />
                  <Skeleton className="mb-2 h-6 w-20" />
                </>
              ) : (
                <>
                  <span className="font-display text-4xl font-semibold tracking-tight text-cyan-400 sm:text-5xl xl:text-6xl">
                    {currentBalanceLabel}
                  </span>
                  <span className="pb-2 text-lg font-semibold text-slate-300">
                    {treasurySnapshot.tokenSymbol}
                  </span>
                </>
              )}
            </div>

            <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${syncBadgeClass}`}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              {syncStatus === "success"
                ? "Synced from Arc Testnet"
                : syncStatus === "error"
                  ? "Live sync degraded"
                  : "Connect MetaMask to load live treasury data"}
            </div>
          </div>

          <span className="inline-flex w-fit items-center rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            {ARC_TESTNET.chainName.toUpperCase()}
          </span>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
            networkStatusLabel === "Connected"
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              : networkStatusLabel === "Wrong Network"
                ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
                : "border-slate-700 bg-slate-900/70 text-slate-400"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              networkStatusLabel === "Connected"
                ? "bg-emerald-400"
                : networkStatusLabel === "Wrong Network"
                  ? "bg-amber-400"
                  : "bg-slate-500"
            }`}
          />
          {networkStatusLabel}
        </div>

        {isWrongNetwork ? (
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            <p className="font-semibold uppercase tracking-[0.18em] text-amber-300">Wrong network</p>
            <p className="mt-1">
              Switch MetaMask to Arc Testnet before sending funds or syncing live treasury activity.
            </p>
            <button
              type="button"
              onClick={onConnect}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:bg-amber-500/15"
            >
              Switch to Arc Testnet
            </button>
          </div>
        ) : null}

        {txState ? (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              txState.status === "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : txState.status === "failed"
                  ? "border-red-500/20 bg-red-500/10 text-red-300"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-300"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold uppercase tracking-[0.18em]">{txState.status}</span>
              {txState.hash.startsWith("0x") ? (
                <a
                  href={`${ARC_TESTNET.blockExplorerUrl}/tx/${txState.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 underline underline-offset-4"
                >
                  {truncateAddress(txState.hash, 8, 6)}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </div>
            <p className="mt-1">{txState.description}</p>
            {txState.status === "failed" ? (
              <button
                type="button"
                onClick={onOpenSend}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-200 transition hover:bg-red-500/15"
              >
                Retry Transaction
              </button>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-3 md:grid-cols-3">
          {dynamicSummaryStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-800/70 bg-slate-950/45 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
              <p className={`mt-3 text-lg font-semibold ${stat.tone === "positive" ? "text-emerald-400" : "text-slate-100"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div id="payments" className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={onOpenSend}
            disabled={isSending || isConnecting || isWrongNetwork}
            className="group flex items-center justify-center gap-3 rounded-2xl border border-emerald-400/25 bg-[linear-gradient(180deg,rgba(16,185,129,0.24),rgba(5,150,105,0.14))] px-5 py-4 text-base font-semibold text-emerald-200 shadow-action transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
            aria-label="Send USDC"
          >
            <ArrowUpRight className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            {isSending ? "Submitting..." : "Send"}
          </button>
          <button
            type="button"
            onClick={onReceive}
            disabled={isReceivePending || isConnecting || isWrongNetwork}
            className="group flex items-center justify-center gap-3 rounded-2xl border border-cyan-400/25 bg-[linear-gradient(180deg,rgba(6,182,212,0.24),rgba(8,145,178,0.14))] px-5 py-4 text-base font-semibold text-cyan-200 shadow-action transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
            aria-label="Receive USDC"
          >
            <ArrowDownLeft className="h-5 w-5 transition group-hover:-translate-x-0.5 group-hover:translate-y-0.5" />
            {isReceivePending ? "Copying..." : "Receive"}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
