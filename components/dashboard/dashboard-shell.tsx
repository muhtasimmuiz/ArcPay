"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Copy,
  ExternalLink,
  Info,
  Menu,
  RefreshCw,
  Shield,
  Wallet,
  X
} from "lucide-react";

import type {
  ActivityItem,
  ActivityStatus,
  InsightItem,
  NavLink,
  SummaryStat,
  TreasurySnapshot,
  VaultItem
} from "@/components/dashboard/data";
import {
  ConfirmationModal,
  GlassCard,
  type Toast,
  ToastViewport,
  Skeleton,
  SectionLabel,
  Tooltip
} from "@/components/dashboard/ui";
import { useArcTreasury } from "@/components/dashboard/use-arc-treasury";
import { ARC_TESTNET, truncateAddress } from "@/lib/arc";

type DashboardShellProps = {
  activityItems: ActivityItem[];
  insightItems: InsightItem[];
  navLinks: NavLink[];
  pulseBars: number[];
  summaryStats: SummaryStat[];
  treasurySnapshot: TreasurySnapshot;
  vaultItems: VaultItem[];
};

const activityFilters: Array<{
  label: string;
  value: "all" | "incoming" | "outgoing" | "pending";
}> = [
  { label: "All", value: "all" },
  { label: "Incoming", value: "incoming" },
  { label: "Outgoing", value: "outgoing" },
  { label: "Pending", value: "pending" }
];

function statusTone(status: ActivityStatus) {
  switch (status) {
    case "pending":
      return "text-amber-300";
    case "completed":
      return "text-slate-300";
    case "finalized":
    case "success":
      return "text-emerald-400";
    default:
      return "text-slate-300";
  }
}

function statusLabel(status: ActivityStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function DashboardShell({
  activityItems,
  insightItems,
  navLinks,
  pulseBars,
  summaryStats,
  treasurySnapshot,
  vaultItems
}: DashboardShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "incoming" | "outgoing" | "pending"
  >("all");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  const pushToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { ...toast, id }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  };

  const treasury = useArcTreasury({
    pushToast,
    summaryStats,
    treasurySnapshot
  });

  const visibleActivity = useMemo(() => {
    const source = treasury.walletAddress ? treasury.historyItems : [];

    if (selectedFilter === "all") {
      return source;
    }

    if (selectedFilter === "incoming") {
      return source.filter((item) => item.direction === "incoming");
    }

    if (selectedFilter === "outgoing") {
      return source.filter((item) => item.direction === "outgoing");
    }

    return source.filter((item) => item.status === selectedFilter);
  }, [selectedFilter, treasury.historyItems, treasury.walletAddress]);

  const canCopy = Boolean(treasury.walletAddress);

  return (
    <main
      id="dashboard"
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.16),_transparent_28%),linear-gradient(180deg,_#091121_0%,_#050816_55%,_#040611_100%)]"
    >
      <ToastViewport
        toasts={toasts}
        onDismiss={(id) => setToasts((current) => current.filter((item) => item.id !== id))}
      />
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        isProcessing={treasury.isSending}
        recipient={treasury.sendForm.recipient}
        amount={treasury.sendForm.amount}
        balance={treasury.balanceDisplay}
        error={treasury.sendForm.error}
        onRecipientChange={(value) =>
          treasury.setSendForm((current) => ({ ...current, recipient: value, error: "" }))
        }
        onAmountChange={(value) =>
          treasury.setSendForm((current) => ({ ...current, amount: value, error: "" }))
        }
        onCancel={() => {
          if (!treasury.isSending) {
            setIsConfirmationOpen(false);
            treasury.setSendForm((current) => ({ ...current, error: "" }));
          }
        }}
        onConfirm={async () => {
          const wasSuccessful = await treasury.sendUsdc();
          if (wasSuccessful) {
            setIsConfirmationOpen(false);
          }
        }}
      />

      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-slate-200 transition hover:border-slate-700 lg:hidden"
                onClick={() => setIsMobileNavOpen((current) => !current)}
                aria-expanded={isMobileNavOpen}
                aria-controls="mobile-nav"
                aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
              >
                {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div>
                <p className="font-display text-2xl font-semibold tracking-tight text-cyan-400">
                  ArcPay Treasury
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                  Sovereign capital command
                </p>
              </div>
            </div>

            <nav className="hidden items-center gap-2 overflow-x-auto rounded-full border border-slate-800/80 bg-slate-900/60 p-1 lg:flex">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    link.active
                      ? "bg-cyan-500/15 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-sky-500 to-cyan-500 p-1 text-white shadow-lg shadow-cyan-500/20">
                <button
                  type="button"
                  onClick={treasury.connectWallet}
                  disabled={treasury.isConnecting}
                  className="inline-flex items-center gap-2 rounded-[14px] px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-75"
                >
                  {treasury.isConnecting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">
                    {treasury.walletAddress ? treasurySnapshot.walletLabel : "Connect Wallet"}
                  </span>
                  <span className="rounded-full bg-white/15 px-2 py-1 text-xs font-medium text-cyan-50">
                    {treasury.walletButtonLabel}
                  </span>
                </button>
                <Tooltip label="Copy connected wallet address">
                  <button
                    type="button"
                    onClick={treasury.copyWallet}
                    disabled={!canCopy}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Copy wallet address"
                  >
                    {treasury.copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>

          {isMobileNavOpen ? (
            <div id="mobile-nav" className="border-t border-slate-800/80 px-4 py-4 sm:px-6 lg:hidden">
              <div className="grid gap-2">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      link.active ? "bg-cyan-500/15 text-cyan-300" : "bg-slate-900/60 text-slate-300"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </header>

        <div className="grid flex-1 grid-cols-1 gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[270px_minmax(0,1fr)_340px] lg:px-8 lg:py-8">
          <aside className="flex h-full flex-col gap-5 lg:sticky lg:top-28 lg:self-start">
            <GlassCard className="overflow-hidden p-5">
              <div className="relative">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl" />
                <div className="relative flex items-start gap-4">
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-slate-100">The Sovereign Vault</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Institutional-grade treasury controls with ARC-native settlement.
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="flex-1 p-3">
              <div className="space-y-2">
                {vaultItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition ${
                        item.active
                          ? "bg-slate-800/80 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.14)]"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                      }`}
                    >
                      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        <span className="block text-sm font-medium">{item.label}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{item.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 lg:mt-auto">
                <a
                  href={`${ARC_TESTNET.blockExplorerUrl}/address/${treasury.walletAddress ?? ARC_TESTNET.usdc.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/30 hover:text-cyan-200"
                >
                  View Audit Logs
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </GlassCard>
          </aside>

          <section className="flex flex-col gap-6">
            <GlassCard className="relative overflow-hidden p-5 sm:p-7 xl:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="relative flex flex-col gap-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <SectionLabel>Total USDC Balance</SectionLabel>
                      <Tooltip label="Live balance fetched directly from the Arc Testnet USDC contract">
                        <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-800 hover:text-slate-200">
                          <Info className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </div>

                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      {treasury.isBalanceLoading ? (
                        <>
                          <Skeleton className="h-14 w-56 sm:h-16 sm:w-72" />
                          <Skeleton className="mb-2 h-6 w-20" />
                        </>
                      ) : (
                        <>
                          <span className="font-display text-4xl font-semibold tracking-tight text-cyan-400 sm:text-5xl xl:text-6xl">
                            {treasury.walletAddress ? treasury.currentBalanceLabel : "--"}
                          </span>
                          <span className="pb-2 text-lg font-semibold text-slate-300">{treasurySnapshot.tokenSymbol}</span>
                        </>
                      )}
                    </div>

                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {treasury.walletAddress ? "Synced from Arc Testnet" : "Connect MetaMask to load live treasury data"}
                    </div>
                  </div>

                  <span className="inline-flex w-fit items-center rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                    {ARC_TESTNET.chainName.toUpperCase()}
                  </span>
                </div>

                {treasury.txState ? (
                  <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                      treasury.txState.status === "success"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                        : treasury.txState.status === "failed"
                          ? "border-red-500/20 bg-red-500/10 text-red-300"
                          : "border-amber-500/20 bg-amber-500/10 text-amber-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold uppercase tracking-[0.18em]">{treasury.txState.status}</span>
                      {treasury.txState.hash.startsWith("0x") ? (
                        <a
                          href={`${ARC_TESTNET.blockExplorerUrl}/tx/${treasury.txState.hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 underline underline-offset-4"
                        >
                          {truncateAddress(treasury.txState.hash, 8, 6)}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                    <p className="mt-1">{treasury.txState.description}</p>
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-3">
                  {treasury.dynamicSummaryStats.map((stat) => (
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
                    onClick={() => {
                      if (!treasury.walletAddress) {
                        void treasury.connectWallet();
                        return;
                      }
                      setIsConfirmationOpen(true);
                    }}
                    disabled={treasury.isSending || treasury.isConnecting}
                    className="group flex items-center justify-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-base font-semibold text-emerald-300 transition hover:-translate-y-0.5 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <ArrowUpRight className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    {treasury.isSending ? "Submitting..." : "Send"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!treasury.walletAddress) {
                        void treasury.connectWallet();
                        return;
                      }
                      void treasury.receiveUsdc();
                    }}
                    disabled={treasury.isReceivePending || treasury.isConnecting}
                    className="group flex items-center justify-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-4 text-base font-semibold text-cyan-300 transition hover:-translate-y-0.5 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    <ArrowDownLeft className="h-5 w-5 transition group-hover:-translate-x-0.5 group-hover:translate-y-0.5" />
                    {treasury.isReceivePending ? "Copying..." : "Receive"}
                  </button>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-display text-[1.65rem] font-semibold text-slate-100 sm:text-2xl">Recent Activity</h3>
                  <p className="mt-1 text-sm text-slate-400">Recent USDC transfers fetched from live Arc Testnet Transfer events.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {activityFilters.map((filter) => (
                    <button
                      key={filter.label}
                      type="button"
                      onClick={() => setSelectedFilter(filter.value)}
                      disabled={treasury.isActivityLoading}
                      className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                        selectedFilter === filter.value ? "bg-cyan-500/15 text-cyan-300" : "bg-slate-900/70 text-slate-400 hover:text-slate-200"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div id="history" className="mt-6 space-y-3">
                {treasury.isActivityLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4">
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
                ) : visibleActivity.length === 0 ? (
                  <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
                    {treasury.walletAddress ? "No recent USDC transfer history was found for this wallet." : "Connect MetaMask to load real Arc Testnet transaction history."}
                  </div>
                ) : (
                  visibleActivity.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 transition hover:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`rounded-2xl p-3 ${item.positive ? "bg-emerald-500/10 text-emerald-300" : "bg-slate-800 text-slate-300"}`}>
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
                          <p className={`text-base font-semibold ${item.positive ? "text-emerald-400" : "text-slate-200"}`}>{item.amount}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{item.chain}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>
          </section>

          <aside className="flex flex-col gap-6">
            <GlassCard className="p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-cyan-400" />
                <h3 className="font-display text-[1.65rem] font-semibold text-slate-100 sm:text-2xl">Treasury Insights</h3>
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
                    <p className="mt-2 text-sm font-semibold text-emerald-400">{treasury.txState?.status === "pending" ? "Finalizing" : "Healthy"}</p>
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

            <div className="relative overflow-hidden rounded-[28px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(8,15,32,0.95),rgba(7,17,37,0.92))] p-5 shadow-glow sm:p-6">
              <div className="absolute inset-x-0 bottom-0 h-28 bg-[radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.18),transparent_38%),linear-gradient(135deg,transparent_35%,rgba(34,211,238,0.08)_55%,transparent_75%)]" />
              <div className="absolute -right-10 top-8 h-24 w-24 rounded-full bg-cyan-500/15 blur-3xl motion-safe:animate-float-slow" />
              <div className="relative">
                <span className="inline-flex rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">LIVE</span>
                <h3 className="mt-4 max-w-[14ch] font-display text-3xl font-semibold leading-tight text-white">Advanced Vault Liquidity Pools</h3>
                <p className="mt-3 max-w-[28ch] text-sm leading-6 text-slate-300">Use the Arc explorer and live treasury feed to verify payout flows and reserve movement in real time.</p>
                <a href={ARC_TESTNET.blockExplorerUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
                  Explore Vaults
                  <ArrowRight className="h-4 w-4" />
                </a>
                <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/50 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
                  <p className="text-sm text-slate-300">Arc explorer online with <span className="text-white">live transaction visibility</span></p>
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-500" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
