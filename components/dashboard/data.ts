import {
  ArrowDownLeft,
  ArrowUpRight,
  BadgeDollarSign,
  CalendarClock,
  Shield,
  Wallet,
  Zap
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

export type NavLink = {
  label: string;
  href: string;
  active?: boolean;
};

export type VaultItem = {
  id: "predictable-gas" | "instant-liquidity" | "vault-security";
  label: string;
  description: string;
  icon: LucideIcon;
};

export type ActivityStatus = "success" | "completed" | "finalized" | "pending" | "failed";

export type ActivityItem = {
  id: string;
  direction: "incoming" | "outgoing";
  title: string;
  address: string;
  timestamp: string;
  amount: string;
  status: ActivityStatus;
  positive: boolean;
  chain: string;
  icon: LucideIcon;
};

export type InsightItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type SummaryStat = {
  label: string;
  value: string;
  tone?: "default" | "positive";
};

export type TreasurySnapshot = {
  network: string;
  balance: string;
  tokenSymbol: string;
  walletLabel: string;
  walletAddress: string;
  lastUpdated: string;
};

export const treasurySnapshot: TreasurySnapshot = {
  network: "ARC TESTNET",
  balance: "$12,500.50",
  tokenSymbol: "USDC",
  walletLabel: "Connected Wallet",
  walletAddress: "0x4a...f7b3",
  lastUpdated: "Updated 14 seconds ago"
};

export const navLinks: NavLink[] = [
  { label: "Dashboard", href: "#dashboard", active: true },
  { label: "Payments", href: "#payments" },
  { label: "History", href: "#history" }
];

export const vaultItems: VaultItem[] = [
  {
    id: "predictable-gas",
    label: "Predictable Gas",
    description: "Track stable USD-priced execution costs.",
    icon: CalendarClock
  },
  {
    id: "instant-liquidity",
    label: "Instant Liquidity",
    description: "Access reserve capital without treasury delays.",
    icon: Wallet
  },
  {
    id: "vault-security",
    label: "Vault Security",
    description: "Monitor controls, approvals, and protection layers.",
    icon: Shield
  }
];

export const summaryStats: SummaryStat[] = [
  { label: "Available treasury", value: "$11,840.20" },
  { label: "Pending settlements", value: "$660.30" },
  { label: "Yield status", value: "+2.14% APY", tone: "positive" }
];

export const activityItems: ActivityItem[] = [
  {
    id: "incoming-1",
    direction: "incoming",
    title: "Incoming from 0xb1...a3e9",
    address: "0xb1d5c9f39b2e0cf0a3e9",
    timestamp: "2 min ago",
    amount: "+$50.00 USDC",
    status: "success",
    positive: true,
    chain: "ARC-CHAIN",
    icon: ArrowDownLeft
  },
  {
    id: "outgoing-1",
    direction: "outgoing",
    title: "Outgoing to 0xc2...d4f1",
    address: "0xc2b6646a42be9ad1d4f1",
    timestamp: "1 day ago",
    amount: "-$1,200.00 USDC",
    status: "completed",
    positive: false,
    chain: "ARC-CHAIN",
    icon: ArrowUpRight
  },
  {
    id: "incoming-2",
    direction: "incoming",
    title: "Incoming from Arc settlement",
    address: "Settlement batch #2214",
    timestamp: "3 days ago",
    amount: "+$4,800.00 USDC",
    status: "finalized",
    positive: true,
    chain: "ARC-CHAIN",
    icon: ArrowDownLeft
  },
  {
    id: "outgoing-2",
    direction: "outgoing",
    title: "Outgoing to vendor treasury",
    address: "0x8e...2a91",
    timestamp: "6 days ago",
    amount: "-$325.90 USDC",
    status: "pending",
    positive: false,
    chain: "ARC-CHAIN",
    icon: ArrowUpRight
  }
];

export const insightItems: InsightItem[] = [
  {
    title: "Predictable Dollar-Based Gas Fees",
    description:
      "Execute treasury transfers with USD-denominated gas pricing to keep operating costs stable across every movement.",
    icon: BadgeDollarSign
  },
  {
    title: "Sub-Second Finality",
    description:
      "Funds settle in under a second on ARC TESTNET, giving finance teams immediate confidence and faster reconciliation.",
    icon: Zap
  }
];

export const pulseBars = [0, 1, 2, 3, 4, 5, 6, 7];
