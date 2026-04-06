import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  CalendarClock,
  ChevronRight,
  Shield,
  Wallet,
  Zap
} from "lucide-react";

const navLinks = ["Dashboard", "Payments", "History"];

const vaultItems = [
  {
    label: "Predictable Gas",
    icon: CalendarClock,
    active: true
  },
  {
    label: "Instant Liquidity",
    icon: Wallet,
    active: false
  },
  {
    label: "Vault Security",
    icon: Shield,
    active: false
  }
];

const activityItems = [
  {
    title: "Incoming from 0xb1...a3e9",
    timestamp: "2 min ago",
    amount: "+$50.00 USDC",
    status: "Success",
    positive: true,
    icon: ArrowDownLeft
  },
  {
    title: "Outgoing to 0xc2...d4f1",
    timestamp: "1 day ago",
    amount: "-$1,200.00 USDC",
    status: "Completed",
    positive: false,
    icon: ArrowUpRight
  },
  {
    title: "Incoming from Arc settlement",
    timestamp: "3 days ago",
    amount: "+$4,800.00 USDC",
    status: "Finalized",
    positive: true,
    icon: ArrowDownLeft
  }
];

const insightItems = [
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

const pulseBars = [0, 1, 2, 3, 4, 5, 6, 7];

function GlassCard({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-md shadow-glow ${className}`}
    >
      {children}
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.16),_transparent_28%),linear-gradient(180deg,_#091121_0%,_#050816_55%,_#040611_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center justify-between gap-4 lg:min-w-[240px]">
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight text-cyan-400">
                  ArcPay Treasury
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.24em] text-slate-500">
                  Sovereign capital command
                </p>
              </div>
            </div>

            <nav className="order-3 flex items-center gap-2 overflow-x-auto rounded-full border border-slate-800/80 bg-slate-900/60 p-1 lg:order-2">
              {navLinks.map((link, index) => (
                <button
                  key={link}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    index === 0
                      ? "bg-cyan-500/15 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.25)]"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                >
                  {link}
                </button>
              ))}
            </nav>

            <div className="order-2 flex justify-start lg:order-3 lg:justify-end">
              <button className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:brightness-110">
                <Wallet className="h-4 w-4" />
                Connected Wallet
                <span className="rounded-full bg-white/15 px-2 py-1 text-xs font-medium text-cyan-50">
                  0x4a...f7b3
                </span>
              </button>
            </div>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)_340px] lg:px-8 lg:py-8">
          <aside className="flex h-full flex-col gap-5">
            <GlassCard className="overflow-hidden p-5">
              <div className="relative">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl" />
                <div className="relative flex items-start gap-4">
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-slate-100">
                      The Sovereign Vault
                    </h2>
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
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                        item.active
                          ? "bg-slate-800/80 text-cyan-300 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.14)]"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-100"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 lg:mt-auto">
                <button className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-sm font-semibold text-cyan-300 transition hover:border-cyan-400/30 hover:text-cyan-200">
                  View Audit Logs
                </button>
              </div>
            </GlassCard>
          </aside>

          <section className="flex flex-col gap-6">
            <GlassCard className="relative overflow-hidden p-6 sm:p-8">
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />
              <div className="relative flex flex-col gap-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                      Total USDC Balance
                    </p>
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                      <span className="font-display text-4xl font-semibold tracking-tight text-cyan-400 sm:text-5xl xl:text-6xl">
                        $12,500.50
                      </span>
                      <span className="pb-2 text-lg font-semibold text-slate-300">USDC</span>
                    </div>
                  </div>

                  <span className="inline-flex w-fit items-center rounded-full border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                    ARC TESTNET
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <button className="group flex items-center justify-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-base font-semibold text-emerald-300 transition hover:-translate-y-0.5 hover:bg-emerald-500/15">
                    <ArrowUpRight className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    Send
                  </button>
                  <button className="group flex items-center justify-center gap-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-4 text-base font-semibold text-cyan-300 transition hover:-translate-y-0.5 hover:bg-cyan-500/15">
                    <ArrowDownLeft className="h-5 w-5 transition group-hover:-translate-x-0.5 group-hover:translate-y-0.5" />
                    Receive
                  </button>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-semibold text-slate-100">
                    Recent Activity
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Treasury movements and finality updates from the ARC network.
                  </p>
                </div>
                <button className="hidden text-sm font-semibold text-cyan-300 transition hover:text-cyan-200 sm:block">
                  View All
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {activityItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={`${item.title}-${item.timestamp}`}
                      className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-4 transition hover:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`rounded-2xl p-3 ${
                            item.positive
                              ? "bg-emerald-500/10 text-emerald-300"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-100 sm:text-base">
                            {item.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-400">
                            {item.timestamp}{" "}
                            <span className="text-emerald-400">{item.status}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p
                          className={`text-base font-semibold ${
                            item.positive ? "text-emerald-400" : "text-slate-200"
                          }`}
                        >
                          {item.amount}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          ARC-CHAIN
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </section>

          <aside className="flex flex-col gap-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 rounded-full bg-cyan-400" />
                <h3 className="font-display text-2xl font-semibold text-slate-100">
                  Treasury Insights
                </h3>
              </div>

              <div className="mt-6 space-y-5">
                {insightItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-2xl border border-cyan-400/15 bg-cyan-500/10 p-3 text-cyan-300">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-slate-100">
                            {item.title}
                          </h4>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                      Network Pulse
                    </p>
                    <p className="mt-2 text-sm font-semibold text-emerald-400">Healthy</p>
                  </div>
                  <div className="flex h-10 items-end gap-1.5">
                    {pulseBars.map((bar, index) => (
                      <span
                        key={bar}
                        className="w-3 rounded-full bg-cyan-400/80 animate-pulse-bars"
                        style={{
                          height: `${16 + (index % 4) * 6}px`,
                          animationDelay: `${index * 120}ms`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>

            <div className="relative overflow-hidden rounded-[28px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(8,15,32,0.95),rgba(7,17,37,0.92))] p-6 shadow-glow">
              <div className="absolute inset-x-0 bottom-0 h-28 bg-[radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.18),transparent_38%),linear-gradient(135deg,transparent_35%,rgba(34,211,238,0.08)_55%,transparent_75%)]" />
              <div className="absolute -right-10 top-8 h-24 w-24 rounded-full bg-cyan-500/15 blur-3xl animate-float-slow" />

              <div className="relative">
                <span className="inline-flex rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
                  NEW
                </span>

                <h3 className="mt-4 max-w-[14ch] font-display text-3xl font-semibold leading-tight text-white">
                  Advanced Vault Liquidity Pools
                </h3>

                <p className="mt-3 max-w-[28ch] text-sm leading-6 text-slate-300">
                  Deploy idle reserves into automated vault strategies while retaining treasury visibility.
                </p>

                <button className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200">
                  Explore Vaults
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="mt-8 flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/50 px-4 py-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.9)]" />
                  <p className="text-sm text-slate-300">
                    Yield engine online with <span className="text-white">4 active pools</span>
                  </p>
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
