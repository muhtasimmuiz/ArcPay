import { ExternalLink, Shield } from "lucide-react";

import type { VaultItem } from "@/components/dashboard/data";
import { ARC_TESTNET } from "@/lib/arc";
import { GlassCard } from "@/components/dashboard/ui";

type DashboardSidebarProps = {
  vaultItems: VaultItem[];
  walletAddress: string | null;
  selectedVaultId: VaultItem["id"];
  onSelectVault: (id: VaultItem["id"]) => void;
};

export function DashboardSidebar({
  vaultItems,
  walletAddress,
  selectedVaultId,
  onSelectVault
}: DashboardSidebarProps) {
  return (
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
                onClick={() => onSelectVault(item.id)}
                aria-pressed={selectedVaultId === item.id}
                className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition ${
                  selectedVaultId === item.id
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
            href={`${ARC_TESTNET.blockExplorerUrl}/address/${walletAddress ?? ARC_TESTNET.usdc.address}`}
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
  );
}
