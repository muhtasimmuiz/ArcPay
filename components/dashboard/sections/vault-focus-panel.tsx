import { ArrowRight, BadgeDollarSign, ShieldCheck, WalletCards } from "lucide-react";

import type { VaultItem } from "@/components/dashboard/data";
import { GlassCard } from "@/components/dashboard/ui";

type VaultFocusPanelProps = {
  selectedVaultId: VaultItem["id"];
  onAction: (id: VaultItem["id"]) => void;
};

const vaultContent: Record<
  VaultItem["id"],
  {
    eyebrow: string;
    title: string;
    description: string;
    bullets: string[];
    cta: string;
    metricLabel: string;
    metricValue: string;
    icon: typeof BadgeDollarSign;
    accentClass: string;
  }
> = {
  "predictable-gas": {
    eyebrow: "Treasury Control",
    title: "Predictable Gas",
    description:
      "Review stable-value transaction cost behavior before settlement so treasury teams can forecast operating spend with confidence.",
    bullets: [
      "Live gas fee estimation appears in the send confirmation flow.",
      "Wrong-network protection blocks transfers outside Arc Testnet.",
      "Treasury cost previews stay aligned with current Arc fee data."
    ],
    cta: "Review fee controls",
    metricLabel: "Current fee mode",
    metricValue: "USD-pegged routing",
    icon: BadgeDollarSign,
    accentClass: "border-cyan-400/20 bg-cyan-500/10 text-cyan-300"
  },
  "instant-liquidity": {
    eyebrow: "Treasury Mobility",
    title: "Instant Liquidity",
    description:
      "Use the treasury balance and recent settlement feed to move USDC quickly while keeping outgoing activity visible in one place.",
    bullets: [
      "Send and receive actions are available directly from the treasury overview.",
      "Recent transfer history refreshes automatically for connected wallets.",
      "Pending transactions are surfaced before additional transfers are allowed."
    ],
    cta: "Open liquidity actions",
    metricLabel: "Settlement posture",
    metricValue: "Sub-second finality",
    icon: WalletCards,
    accentClass: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
  },
  "vault-security": {
    eyebrow: "Risk Controls",
    title: "Vault Security",
    description:
      "Connected-wallet safeguards help prevent avoidable treasury errors before a transfer reaches finality on Arc Testnet.",
    bullets: [
      "Recipient addresses are normalized and validated before submission.",
      "Duplicate transfer attempts are blocked while a transaction is pending.",
      "Disconnect and wrong-network events reset risky treasury actions."
    ],
    cta: "Inspect protections",
    metricLabel: "Active posture",
    metricValue: "Guardrails enabled",
    icon: ShieldCheck,
    accentClass: "border-amber-400/20 bg-amber-500/10 text-amber-300"
  }
};

export function VaultFocusPanel({ selectedVaultId, onAction }: VaultFocusPanelProps) {
  const content = vaultContent[selectedVaultId];
  const Icon = content.icon;

  return (
    <GlassCard className="overflow-hidden p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {content.eyebrow}
          </p>
          <h3 className="mt-3 font-display text-[1.65rem] font-semibold text-slate-100 sm:text-2xl">
            {content.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">{content.description}</p>
        </div>

        <div className={`inline-flex w-fit items-center gap-3 rounded-2xl border px-4 py-3 ${content.accentClass}`}>
          <Icon className="h-5 w-5" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80">
              {content.metricLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-50">{content.metricValue}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {content.bullets.map((bullet) => (
          <div
            key={bullet}
            className="rounded-2xl border border-slate-800/80 bg-slate-950/45 px-4 py-4 text-sm leading-6 text-slate-300"
          >
            {bullet}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onAction(selectedVaultId)}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
      >
        {content.cta}
        <ArrowRight className="h-4 w-4" />
      </button>
    </GlassCard>
  );
}
