"use client";

import { CheckCircle2, TriangleAlert, X } from "lucide-react";

export type Toast = {
  id: number;
  tone: "success" | "error";
  title: string;
  description: string;
};

export function GlassCard({
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

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
      {children}
    </p>
  );
}

export function Tooltip({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="group relative inline-flex items-center">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-max max-w-[240px] -translate-x-1/2 rounded-xl border border-slate-700 bg-slate-950/95 px-3 py-2 text-center text-xs font-medium leading-5 text-slate-200 shadow-2xl group-hover:block group-focus-within:block">
        {label}
      </span>
    </span>
  );
}

export function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-800/80 ${className}`} />;
}

export function ToastViewport({
  toasts,
  onDismiss
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto rounded-2xl border border-slate-800 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 rounded-full p-1 ${
                toast.tone === "success"
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-red-500/15 text-red-300"
              }`}
            >
              {toast.tone === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <TriangleAlert className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-100">{toast.title}</p>
              <p className="mt-1 text-sm leading-5 text-slate-400">{toast.description}</p>
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-full p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-200"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConfirmationModal({
  isOpen,
  isProcessing,
  recipient,
  amount,
  balance,
  error,
  onRecipientChange,
  onAmountChange,
  onCancel,
  onConfirm
}: {
  isOpen: boolean;
  isProcessing: boolean;
  recipient: string;
  amount: string;
  balance: string;
  error: string;
  onRecipientChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-[28px] border border-slate-800 bg-slate-950/95 p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 p-3 text-amber-300">
            <TriangleAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-2xl font-semibold text-slate-100">
              Send USDC on Arc Testnet
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Confirm the destination and amount before submitting the treasury transfer.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Recipient address</span>
            <input
              value={recipient}
              onChange={(event) => onRecipientChange(event.target.value)}
              placeholder="0x..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Amount</span>
            <input
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="0.00"
              inputMode="decimal"
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40"
            />
          </label>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">Available balance</span>
              <span className="font-semibold text-slate-100">{balance} USDC</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-500">Network</span>
              <span className="font-medium text-cyan-300">Arc Testnet</span>
            </div>
          </div>

          {error ? (
            <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isProcessing ? "Processing..." : "Confirm & Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
