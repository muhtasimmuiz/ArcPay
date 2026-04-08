import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

type BodySection = {
  title: string;
  body: string;
};

type PointsSection = {
  title: string;
  points: Array<{
    label: string;
    text: string;
  }>;
};

const sections: Array<BodySection | PointsSection> = [
  {
    title: "Executive Summary",
    body: "ArcPay Treasury is a decentralized financial infrastructure designed for modern Web3 builders and institutions on the Arc Chain. It provides a sovereign, high-security environment for managing digital assets with unprecedented speed and cost-predictability."
  },
  {
    title: "Core Infrastructure",
    points: [
      {
        label: "The Sovereign Vault",
        text: "A multi-layered security protocol that ensures absolute protection for institutional treasuries."
      },
      {
        label: "Sub-Second Finality",
        text: "Leveraging the velocity of the Arc node network, funds settle in under 900ms, enabling real-time capital efficiency."
      },
      {
        label: "Predictable Gas Fees",
        text: "ArcPay solves Web3 volatility by anchoring all network costs to the USD value, ensuring institutional budget predictability regardless of market fluctuations."
      }
    ]
  },
  {
    title: "Key Features",
    points: [
      {
        label: "Unified Dashboard",
        text: "A professional interface providing live on-chain activity, transaction history, and asset rebalancing."
      },
      {
        label: "Instant Liquidity",
        text: "Streamlined protocols for immediate access to funds and automated yield optimization through advanced liquidity pools."
      },
      {
        label: "Transparency",
        text: 'Verifiable on-chain audit logs provide full visibility into every transaction, maintaining a "healthy" network pulse at all times.'
      }
    ]
  },
  {
    title: "Vision",
    body: "By combining institutional-grade security with the agility of decentralized finance, ArcPay Treasury empowers organizations to scale their operations on the Arc Chain with absolute precision."
  }
];

export default function WhitepaperPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-col gap-5 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-slate-950">
              ArcPay Treasury
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.28em] text-slate-500">
              Whitepaper
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back Home
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Launch App
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f5f9ff_100%)]">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
            Institutional-grade asset management
          </div>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-tight text-slate-950 sm:text-5xl md:text-6xl">
            ArcPay Treasury: Institutional-Grade Asset Management
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            A concise overview of ArcPay Treasury&apos;s security posture, execution model,
            treasury tooling, and long-term vision on the Arc Chain.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Contents
            </p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-700">
              {sections.map((section) => (
                <a
                  key={section.title}
                  href={`#${section.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className="transition hover:text-cyan-700"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </aside>

          <article className="space-y-10">
            {sections.map((section) => (
              <section
                key={section.title}
                id={section.title.toLowerCase().replace(/\s+/g, "-")}
                className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_16px_50px_rgba(15,23,42,0.06)] sm:p-9"
              >
                <h2 className="font-display text-3xl font-bold text-slate-950">{section.title}</h2>

                {"body" in section ? (
                  <p className="mt-5 text-lg leading-8 text-slate-700">{section.body}</p>
                ) : null}

                {"points" in section && section.points ? (
                  <div className="mt-6 space-y-5">
                    {section.points.map((point) => (
                      <div
                        key={point.label}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                      >
                        <h3 className="text-lg font-semibold text-slate-900">{point.label}</h3>
                        <p className="mt-2 leading-7 text-slate-700">{point.text}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </article>
        </div>
      </section>
    </main>
  );
}
