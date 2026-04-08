"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bolt,
  FileText,
  Menu,
  Shield,
  Sparkles,
  Verified,
  X
} from "lucide-react";
import { summaryStats, treasurySnapshot } from "@/components/dashboard/data";
import { statusBadgeTone, statusLabel } from "@/components/dashboard/helpers";
import { useArcTreasury } from "@/components/dashboard/use-arc-treasury";

const navItems = [
  { href: "#ecosystem", label: "Ecosystem" },
  { href: "#governance", label: "Governance" },
  { href: "#security", label: "Security" },
  { href: "#docs", label: "Docs" }
];

const auditFeed = [
  {
    hash: "0x7a...4e2d",
    label: "Treasury Allocation: Phase 2 Liquidity",
    time: "1.4s ago",
    opacity: "opacity-100"
  },
  {
    hash: "0x3b...9f1a",
    label: "Governance Vote: ARC-04 Upgrade Proposal",
    time: "4.2s ago",
    opacity: "opacity-80"
  },
  {
    hash: "0x9c...118b",
    label: "Asset Mint: Sovereign Vault Collateralization",
    time: "8.9s ago",
    opacity: "opacity-60"
  }
];

const featureCards = [
  {
    title: "Sovereign Vault",
    description:
      "Multi-layer security architecture for digital assets, featuring hardened treasury controls and transparent governance oversight.",
    footer: "Certified Secure",
    icon: Shield
  },
  {
    title: "Sub-Second Finality",
    description:
      "Experience near-instant onchain settlements with Arc's fast confirmation model, designed for institutional treasury operations.",
    footer: "900ms Average",
    icon: Bolt,
    raised: true
  },
  {
    title: "Gas Anchoring",
    description:
      "Fixed execution expectations with USD-pegged gas behavior, improving treasury forecasting and operational confidence.",
    footer: "Predictable Execution",
    icon: Sparkles
  }
];

export default function HomePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const treasury = useArcTreasury({
    pushToast: () => {},
    summaryStats,
    treasurySnapshot
  });

  const homeAuditFeed = useMemo(() => {
    if (treasury.walletAddress && treasury.historyItems.length > 0) {
      return treasury.historyItems.slice(0, 3).map((item) => ({
        id: item.id,
        hash: item.address,
        label: item.title,
        time: item.timestamp,
        status: item.status
      }));
    }

    return auditFeed.map((item) => ({
      id: item.hash,
      hash: item.hash,
      label: item.label,
      time: item.time,
      status: "success" as const
    }));
  }, [treasury.historyItems, treasury.walletAddress]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0b1323] text-slate-100">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-cyan-950/40 backdrop-blur-xl shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 py-4 md:px-10">
          <div>
            <div className="font-display text-xl font-bold tracking-tight text-white uppercase sm:text-2xl">
              ArcPay Treasury
            </div>
            <p className="mt-1 hidden text-[11px] uppercase tracking-[0.28em] text-slate-500 sm:block">
              Sovereign Capital Command
            </p>
          </div>

          <div className="hidden items-center gap-10 md:flex">
            {navItems.map((item, index) => (
              <a
                key={item.href}
                className={
                  index === 0
                    ? "border-b-2 border-cyan-400 pb-1 font-bold text-cyan-400"
                    : "text-slate-300 transition-colors hover:text-white"
                }
                href={item.href}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <Link
              href="/whitepaper"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:text-white"
            >
              <FileText className="h-4 w-4" />
              Read Whitepaper
            </Link>
            <Link
              href="/app"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-300 px-6 py-2.5 font-bold text-slate-950 shadow-[0_18px_40px_rgba(34,211,238,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(34,211,238,0.34)] active:scale-[0.98]"
            >
              Launch App
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            type="button"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            className="inline-flex rounded-xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10 md:hidden"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isMobileMenuOpen ? (
          <div className="border-t border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur-xl md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link
                href="/whitepaper"
                className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Read Whitepaper
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-300 via-cyan-400 to-teal-300 px-4 py-3 text-sm font-bold text-slate-950"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Launch App
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : null}
      </nav>

      <div className="pt-24">
        <section
          id="ecosystem"
          className="relative flex min-h-[920px] items-center overflow-hidden px-4 py-16 sm:px-6 md:px-20"
        >
          <div className="absolute left-1/2 top-12 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-400/12 blur-[120px]" />
          <div className="mx-auto grid w-full max-w-7xl items-center gap-16 md:grid-cols-2">
            <div className="relative z-10">
              <div className="inline-flex items-center rounded-full border border-cyan-300/15 bg-cyan-300/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">
                Institutional-grade treasury on Arc
              </div>

              <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tighter sm:text-6xl md:text-7xl xl:text-8xl">
                Manage Your Assets with{" "}
                <span className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-cyan-500 bg-clip-text text-transparent">
                  Absolute Precision.
                </span>
              </h1>

              <p className="mb-12 mt-8 max-w-xl text-lg font-light leading-relaxed text-slate-300 sm:text-xl md:text-2xl">
                The first institutional-grade treasury platform on Arc Chain. Experience
                sub-second finality, predictable gas fees, and cleaner operational control.
              </p>

              <div className="flex flex-wrap gap-4 sm:gap-6">
                <Link
                  href="/app"
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-200 via-cyan-400 to-teal-300 px-7 py-4 text-base font-bold text-slate-950 shadow-[0_24px_56px_rgba(34,211,238,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_66px_rgba(34,211,238,0.38)] active:scale-[0.98] sm:px-8 sm:text-lg"
                >
                  Launch App
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/whitepaper"
                  className="rounded-xl border border-white/10 bg-[rgba(45,53,70,0.4)] px-7 py-4 text-base font-semibold text-white backdrop-blur-xl transition-all duration-300 hover:border-cyan-300/20 hover:bg-white/10 hover:text-cyan-100 sm:px-8 sm:text-lg"
                >
                  Read Whitepaper
                </Link>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="absolute -inset-10 rounded-full bg-cyan-400/20 blur-[120px]" />
              <div className="relative aspect-square rounded-[1.75rem] border border-cyan-200/15 bg-[rgba(45,53,70,0.4)] p-8 shadow-[0_0_0_1px_rgba(138,235,255,0.15),0_30px_70px_rgba(0,0,0,0.35)] backdrop-blur-[20px] transition-transform duration-700 hover:rotate-0 md:rotate-3">
                <img
                  className="h-full w-full rounded-2xl object-cover shadow-inner"
                  alt="A floating ArcPay vault concept"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrkllDlZHsW5TcxeyfZWRMWCt91nGbIGonZZOcSOtS7pla8s1dCWZ_XfcZlpau3Atdp3RaSut2C3M01Hw7EQ1xBtxepCBWN_b5m7E5RkIBtWOnBzHGhbIJSVHiMHL-CJ_Y7pCdZXabQbv8x6-KOspCKlduPJIkQy0mqQr6DloP-pblSGlzKYZ8oR9olyuyZYA1Wwm_RHHZmyzleTuEWDcs2PfaKNxGeelCYJAOklp7JRSGaK18w7_ehkdXIINP4LDCfjizWvdk8Hwm"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="governance" className="bg-slate-900/40 py-24 sm:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 md:grid-cols-2 md:gap-24 md:px-20">
            <div className="order-2 md:order-1">
              <div className="rounded-[1.5rem] border border-cyan-200/15 bg-[rgba(45,53,70,0.4)] p-1 shadow-[0_0_0_1px_rgba(138,235,255,0.15)] backdrop-blur-[20px]">
                <img
                  className="h-auto w-full rounded-[calc(1.5rem-2px)]"
                  alt="ArcPay network pulse interface"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCR70WrVZUJ5dxHHqqqIJaCuhXdRB5N6WmLl7bXIEQOHNiz4BjrqOTP8bW9GuJ9y5SYukvjLt547aiMMdPhufJxkY_1YtwkR0u5bTXUmnH7IRZZUJVct5nATiJk0jHzWfLrfs0ah0TtN2YoX1VfTcyFutvHh6IfMq55dxhXKVgcrFfDQceVZWKK3cD2mo8K0TF1dC_n03N0t-4dbKWTX8EIYgGEWTurU3MfNmVsTFOzkq1wdO6u6y6tZbJHpV5rj8e4CoCS53WWGKj-"
                />
              </div>
            </div>

            <div className="order-1 md:order-2">
              <p className="font-mono text-sm uppercase tracking-[0.3em] text-cyan-300">
                Built for Builders
              </p>
              <h2 className="mt-4 font-display text-4xl font-bold leading-tight md:text-5xl">
                Trusted by Institutions. Engineered for Decentralization.
              </h2>
              <div className="mt-8 space-y-8 text-lg leading-relaxed text-slate-300">
                <p>
                  ArcPay Treasury solves Web3 volatility through our proprietary
                  dollar-based gas anchoring system. No more unpredictable transaction costs
                  during market spikes.
                </p>
                <p>
                  By leveraging sub-second finality on Arc Chain, your institution can settle
                  assets instantly with the same security as legacy banking, but at a fraction of
                  the cost.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="security" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-20">
            <div className="mb-20 text-center sm:mb-24">
              <h2 className="font-display text-4xl font-bold md:text-6xl">
                Institutional Power Tools
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400">
                Harness the next generation of financial infrastructure with our specialized
                treasury suite.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {featureCards.map(({ title, description, footer, icon: Icon, raised }) => (
                <div
                  key={title}
                  className={`flex flex-col items-start rounded-[1.5rem] border border-cyan-200/10 bg-[rgba(45,53,70,0.4)] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.18)] backdrop-blur-[20px] transition-all duration-500 hover:-translate-y-1 hover:bg-slate-800/60 hover:shadow-[0_26px_60px_rgba(0,0,0,0.26)] sm:p-10 ${
                    raised ? "md:translate-y-12" : ""
                  }`}
                >
                  <div className="mb-8 rounded-2xl bg-cyan-400/10 p-4 text-cyan-300">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-display text-2xl font-bold">{title}</h3>
                  <p className="mb-8 mt-4 leading-relaxed text-slate-400">{description}</p>
                  <div className="mt-auto w-full border-t border-white/5 pt-4">
                    <span className="text-sm font-bold uppercase tracking-widest text-cyan-300">
                      {footer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="docs" className="overflow-hidden bg-slate-950/50 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-20">
            <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-display text-3xl font-bold">On-Chain Audit Logs</h2>
                <p className="mt-4 text-slate-400">
                  {treasury.walletAddress
                    ? "Synced with the connected ArcPay treasury session and recent onchain transfer history."
                    : "Real-time transparency for every governance decision and treasury movement."}
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                  {treasury.walletAddress ? "Connected Feed" : "Live Feed"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {homeAuditFeed.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-cyan-200/10 bg-[rgba(45,53,70,0.4)] p-6 backdrop-blur-[20px] transition-all hover:border-cyan-300/15 hover:opacity-100 md:flex-row md:items-center"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                    <span className="font-mono text-cyan-200">{item.hash}</span>
                    <span className="text-sm text-slate-300">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-mono text-white">{item.time}</span>
                    {treasury.walletAddress ? (
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusBadgeTone(item.status)}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    ) : (
                      <Verified className="h-5 w-5 text-cyan-300" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <footer className="w-full border-t border-white/5 bg-[#0b1323] py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 md:flex-row md:px-12">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <div className="text-lg font-bold text-cyan-400">ArcPay Treasury</div>
            <p className="text-center text-sm uppercase tracking-wide text-slate-500 md:text-left">
              © 2026 ArcPay Treasury. Institutional Grade Governance.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm uppercase tracking-wide text-slate-500">
            <a className="transition-colors hover:text-cyan-300" href="#docs">
              On-Chain Audit Logs
            </a>
            <a className="transition-colors hover:text-cyan-300" href="#ecosystem">
              System Status
            </a>
            <a className="transition-colors hover:text-cyan-300" href="#security">
              Privacy
            </a>
            <a className="transition-colors hover:text-cyan-300" href="#governance">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
