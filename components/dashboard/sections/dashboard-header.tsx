"use client";

import { CheckCircle2, Copy, LogOut, Menu, RefreshCw, Wallet, X } from "lucide-react";

import type { NavLink, TreasurySnapshot } from "@/components/dashboard/data";
import { Tooltip } from "@/components/dashboard/ui";

type DashboardHeaderProps = {
  canCopy: boolean;
  copied: boolean;
  isConnecting: boolean;
  isMobileNavOpen: boolean;
  navLinks: NavLink[];
  selectedWalletName: string | null;
  onConnect: () => void;
  onCopy: () => void;
  onDisconnect: () => void;
  onToggleMobileNav: () => void;
  treasurySnapshot: TreasurySnapshot;
  walletAddressLabel: string;
};

export function DashboardHeader({
  canCopy,
  copied,
  isConnecting,
  isMobileNavOpen,
  navLinks,
  selectedWalletName,
  onConnect,
  onCopy,
  onDisconnect,
  onToggleMobileNav,
  treasurySnapshot,
  walletAddressLabel
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-slate-200 transition hover:border-slate-700 lg:hidden"
            onClick={onToggleMobileNav}
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
          <div className="inline-flex items-center rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-400 p-1 text-white shadow-action">
            <button
              type="button"
              onClick={onConnect}
              disabled={isConnecting}
              className="inline-flex items-center gap-2 rounded-[14px] px-3 py-2 text-sm font-semibold hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-75"
            >
              {isConnecting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {walletAddressLabel !== "Connect Wallet"
                  ? selectedWalletName
                    ? `${selectedWalletName} Wallet`
                    : treasurySnapshot.walletLabel
                  : "Connect Wallet"}
              </span>
              <span className="rounded-full bg-white/15 px-2 py-1 text-xs font-medium text-cyan-50">
                {walletAddressLabel}
              </span>
            </button>
            <Tooltip label="Copy connected wallet address">
              <button
                type="button"
                onClick={onCopy}
                disabled={!canCopy}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10 transition hover:-translate-y-0.5 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Copy wallet address"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </Tooltip>
            {canCopy ? (
              <Tooltip label="Disconnect wallet from this dashboard">
                <button
                  type="button"
                  onClick={onDisconnect}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-white/10 transition hover:-translate-y-0.5 hover:bg-white/15"
                  aria-label="Disconnect wallet"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </Tooltip>
            ) : null}
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
                onClick={onToggleMobileNav}
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
  );
}
