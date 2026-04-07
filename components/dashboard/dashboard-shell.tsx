"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight } from "lucide-react";

import type {
  InsightItem,
  NavLink,
  SummaryStat,
  TreasurySnapshot,
  VaultItem
} from "@/components/dashboard/data";
import {
  insightItems,
  navLinks,
  pulseBars,
  summaryStats,
  treasurySnapshot,
  vaultItems
} from "@/components/dashboard/data";
import { ConfirmationModal, type Toast, ToastViewport } from "@/components/dashboard/ui";
import { ActivitySection } from "@/components/dashboard/sections/activity-section";
import { DashboardHeader } from "@/components/dashboard/sections/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/sections/dashboard-sidebar";
import { InsightsSidebar } from "@/components/dashboard/sections/insights-sidebar";
import { LiquiditySection } from "@/components/dashboard/sections/liquidity-section";
import { TreasuryOverview } from "@/components/dashboard/sections/treasury-overview";
import { VaultFocusPanel } from "@/components/dashboard/sections/vault-focus-panel";
import { useArcTreasury } from "@/components/dashboard/use-arc-treasury";

type DashboardShellProps = {
  insightItems?: InsightItem[];
  navLinks?: NavLink[];
  pulseBars?: number[];
  summaryStats?: SummaryStat[];
  treasurySnapshot?: TreasurySnapshot;
  vaultItems?: VaultItem[];
};

export function DashboardShell({
  insightItems: insightItemsProp = insightItems,
  navLinks: navLinksProp = navLinks,
  pulseBars: pulseBarsProp = pulseBars,
  summaryStats: summaryStatsProp = summaryStats,
  treasurySnapshot: treasurySnapshotProp = treasurySnapshot,
  vaultItems: vaultItemsProp = vaultItems
}: DashboardShellProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "incoming" | "outgoing" | "pending"
  >("all");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState<VaultItem["id"]>("predictable-gas");
  const [isLiquiditySectionOpen, setIsLiquiditySectionOpen] = useState(false);
  const [liquidityAmount, setLiquidityAmount] = useState("");
  const [liquidityAllocation, setLiquidityAllocation] = useState("");
  const [liquidityPoolType, setLiquidityPoolType] = useState<"balanced" | "stable" | "dynamic">(
    "balanced"
  );

  const pushToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { ...toast, id }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3200);
  };

  const treasury = useArcTreasury({
    pushToast,
    summaryStats: summaryStatsProp,
    treasurySnapshot: treasurySnapshotProp
  });

  const visibleActivity = useMemo(() => {
    const source = treasury.walletAddress ? treasury.historyItems : [];
    const pendingActivity =
      treasury.txState && treasury.walletAddress
        ? [
            {
              id: treasury.txState.hash,
              direction: "outgoing" as const,
              title:
                treasury.txState.status === "failed"
                  ? `Failed transfer to ${treasury.txState.recipient.slice(0, 8)}...${treasury.txState.recipient.slice(-6)}`
                  : `Outgoing to ${treasury.txState.recipient.slice(0, 8)}...${treasury.txState.recipient.slice(-6)}`,
              address: treasury.txState.recipient,
              timestamp: "Just now",
              amount: `-$${treasury.txState.amount} ${treasurySnapshotProp.tokenSymbol}`,
              status: treasury.txState.status,
              positive: false,
              chain: treasurySnapshotProp.network,
              icon: treasury.txState.status === "failed" ? AlertTriangle : ArrowUpRight
            }
          ]
        : [];
    const merged = [...pendingActivity, ...source].filter(
      (item, index, items) => items.findIndex((candidate) => candidate.id === item.id) === index
    );

    if (selectedFilter === "all") {
      return merged;
    }

    if (selectedFilter === "incoming") {
      return merged.filter((item) => item.direction === "incoming");
    }

    if (selectedFilter === "outgoing") {
      return merged.filter((item) => item.direction === "outgoing");
    }

    return merged.filter((item) => item.status === selectedFilter);
  }, [selectedFilter, treasury.historyItems, treasury.txState, treasury.walletAddress, treasurySnapshotProp.network, treasurySnapshotProp.tokenSymbol]);

  function openSendFlow() {
    if (!treasury.walletAddress) {
      void treasury.connectWallet();
      return;
    }

    setIsConfirmationOpen(true);
  }

  function triggerReceive() {
    if (!treasury.walletAddress) {
      void treasury.connectWallet();
      return;
    }

    void treasury.receiveUsdc();
  }

  function scrollToSection(id: string) {
    if (typeof document === "undefined") {
      return;
    }

    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleVaultAction(id: VaultItem["id"]) {
    if (id === "predictable-gas") {
      scrollToSection("payments");
      openSendFlow();
      return;
    }

    if (id === "instant-liquidity") {
      setIsLiquiditySectionOpen(true);
      return;
    }

    scrollToSection("dashboard");
  }

  function handleLiquiditySubmit() {
    if (!treasury.walletAddress) {
      void treasury.connectWallet();
      return;
    }

    pushToast({
      tone: "success",
      title: "Liquidity workflow opened",
      description: "Treasury liquidity has been staged for review. Pool execution can be wired next."
    });
  }

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
        gasEstimate={treasury.gasEstimate}
        isEstimatingGas={treasury.isEstimatingGas}
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
        <DashboardHeader
          canCopy={Boolean(treasury.walletAddress)}
          copied={treasury.copied}
          isConnecting={treasury.isConnecting}
          isMobileNavOpen={isMobileNavOpen}
          navLinks={navLinksProp}
          onConnect={treasury.connectWallet}
          onCopy={treasury.copyWallet}
          onDisconnect={treasury.disconnectWallet}
          onToggleMobileNav={() => setIsMobileNavOpen((current) => !current)}
          treasurySnapshot={treasurySnapshotProp}
          walletAddressLabel={treasury.walletButtonLabel}
        />

        <div className="grid flex-1 grid-cols-1 gap-5 px-4 py-5 sm:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[270px_minmax(0,1fr)_340px] lg:px-8 lg:py-8">
          <DashboardSidebar
            vaultItems={vaultItemsProp}
            walletAddress={treasury.walletAddress}
            selectedVaultId={selectedVaultId}
            onSelectVault={setSelectedVaultId}
          />

          <section className="flex flex-col gap-6">
            <TreasuryOverview
              currentBalanceLabel={treasury.currentBalanceLabel}
              dynamicSummaryStats={treasury.dynamicSummaryStats}
              isBalanceLoading={treasury.isBalanceLoading}
              isConnecting={treasury.isConnecting}
              isReceivePending={treasury.isReceivePending}
              isSending={treasury.isSending}
              isWrongNetwork={treasury.isWrongNetwork}
              syncStatus={treasury.syncStatus}
              networkStatusLabel={treasury.networkStatusLabel}
              onConnect={treasury.connectWallet}
              onOpenSend={openSendFlow}
              onReceive={triggerReceive}
              treasurySnapshot={treasurySnapshotProp}
              txState={treasury.txState}
            />

            <VaultFocusPanel selectedVaultId={selectedVaultId} onAction={handleVaultAction} />

            <ActivitySection
              activityItems={visibleActivity}
              isLoading={treasury.isActivityLoading}
              isWalletConnected={Boolean(treasury.walletAddress)}
              selectedFilter={selectedFilter}
              onFilterChange={setSelectedFilter}
            />
          </section>

          <InsightsSidebar
            insightItems={insightItemsProp}
            networkStatus={treasury.txState?.status === "pending" ? "Finalizing" : "Healthy"}
            pulseBars={pulseBarsProp}
          />
        </div>
      </div>

      <LiquiditySection
        isOpen={isLiquiditySectionOpen}
        amount={liquidityAmount}
        allocation={liquidityAllocation}
        poolType={liquidityPoolType}
        walletAddress={treasury.walletAddress}
        onAmountChange={setLiquidityAmount}
        onAllocationChange={setLiquidityAllocation}
        onClose={() => setIsLiquiditySectionOpen(false)}
        onOpenConnect={treasury.connectWallet}
        onPoolTypeChange={setLiquidityPoolType}
        onSubmit={handleLiquiditySubmit}
      />
    </main>
  );
}
