"use client";

import { Droplets, PlusCircle, X } from "lucide-react";

type LiquiditySectionProps = {
  amount: string;
  allocation: string;
  isOpen: boolean;
  poolType: "balanced" | "stable" | "dynamic";
  walletAddress: string | null;
  onAmountChange: (value: string) => void;
  onAllocationChange: (value: string) => void;
  onClose: () => void;
  onOpenConnect: () => void;
  onPoolTypeChange: (value: "balanced" | "stable" | "dynamic") => void;
  onSubmit: () => void;
};

const poolOptions: Array<{
  value: "balanced" | "stable" | "dynamic";
  label: string;
  description: string;
}> = [
  {
    value: "balanced",
    label: "Balanced Pool",
    description: "Split treasury liquidity across steady yield and flexible access."
  },
  {
    value: "stable",
    label: "Stable Reserve",
    description: "Favor low-volatility deployment for predictable redemption."
  },
  {
    value: "dynamic",
    label: "Dynamic Yield",
    description: "Target higher utilization with active treasury rotation."
  }
];

export function LiquiditySection({
  amount,
  allocation,
  isOpen,
  poolType,
  walletAddress,
  onAmountChange,
  onAllocationChange,
  onClose,
  onOpenConnect,
  onPoolTypeChange,
  onSubmit
}: LiquiditySectionProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 px-4 backdrop-blur-md">
      <div className="w-full max-w-5xl rounded-[32px] border border-slate-800 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(15,23,42,0.96))] p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              Liquidity Management
            </p>
            <h3 className="mt-3 font-display text-[1.65rem] font-semibold text-slate-100 sm:text-2xl">
              Add Treasury Liquidity
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Stage liquidity capital for the selected pool profile and keep treasury deployment
              organized from one professional workflow.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-3 text-cyan-300 sm:inline-flex sm:items-center sm:gap-3">
              <Droplets className="h-5 w-5" />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80">
                  Deployment mode
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-50">Treasury-managed liquidity</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-slate-300 transition hover:border-slate-700 hover:text-white"
              aria-label="Close liquidity section"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {poolOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPoolTypeChange(option.value)}
              className={`rounded-2xl border px-4 py-4 text-left transition ${
                poolType === option.value
                  ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-200"
                  : "border-slate-800/80 bg-slate-950/45 text-slate-300 hover:border-slate-700"
              }`}
            >
              <p className="text-sm font-semibold">{option.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{option.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Liquidity amount (USDC)</span>
            <input
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="250.00"
              inputMode="decimal"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-slate-900"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Allocation notes</span>
            <input
              value={allocation}
              onChange={(event) => onAllocationChange(event.target.value)}
              placeholder="Quarterly operating reserve deployment"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-slate-900"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/45 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-100">
              {walletAddress ? "Ready to stage liquidity deployment." : "Connect a wallet to add liquidity."}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              This section prepares a treasury liquidity action flow for future pool execution.
            </p>
          </div>

          {walletAddress ? (
            <button
              type="button"
              onClick={onSubmit}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/25 bg-[linear-gradient(180deg,rgba(16,185,129,0.24),rgba(5,150,105,0.14))] px-5 py-3 text-sm font-semibold text-emerald-200 shadow-action transition hover:-translate-y-0.5 hover:border-emerald-300/40 hover:text-white"
            >
              <PlusCircle className="h-4 w-4" />
              Add Liquidity
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenConnect}
              className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:-translate-y-0.5 hover:border-cyan-300/40 hover:text-white"
            >
              Connect wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
