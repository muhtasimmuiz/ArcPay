"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

import type { ActivityItem, SummaryStat, TreasurySnapshot } from "@/components/dashboard/data";
import {
  ARC_TESTNET,
  buildArcFeeOverrides,
  formatRelativeTime,
  formatTokenAmount,
  HISTORY_BLOCK_WINDOW,
  TRANSFER_EVENT_TOPIC,
  truncateAddress,
  USDC_ABI
} from "@/lib/arc";
import type { Toast } from "@/components/dashboard/ui";

type TxState = {
  hash: string;
  status: "pending" | "success" | "failed";
  description: string;
  amount: string;
  recipient: string;
} | null;

type SendFormState = {
  recipient: string;
  amount: string;
  error: string;
};

type ArcEthereumProvider = ethers.Eip1193Provider & {
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: ArcEthereumProvider;
  }
}

function getInjectedProvider() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.ethereum ?? null;
}

async function ensureArcNetwork(provider: ArcEthereumProvider) {
  const chainIdHex = ethers.toQuantity(ARC_TESTNET.chainId);

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }]
    });
  } catch (error) {
    const errorCode = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;

    if (errorCode === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: ARC_TESTNET.chainName,
            rpcUrls: [ARC_TESTNET.rpcUrl],
            blockExplorerUrls: [ARC_TESTNET.blockExplorerUrl],
            nativeCurrency: ARC_TESTNET.nativeCurrency
          }
        ]
      });
      return;
    }

    throw error;
  }
}

export function useArcTreasury({
  pushToast,
  summaryStats,
  treasurySnapshot
}: {
  pushToast: (toast: Omit<Toast, "id">) => void;
  summaryStats: SummaryStat[];
  treasurySnapshot: TreasurySnapshot;
}) {
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isReceivePending, setIsReceivePending] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [historyItems, setHistoryItems] = useState<ActivityItem[]>([]);
  const [txState, setTxState] = useState<TxState>(null);
  const [sendForm, setSendForm] = useState<SendFormState>({
    recipient: "",
    amount: "",
    error: ""
  });

  const fetchTransferHistory = useCallback(async (provider: ethers.BrowserProvider, address: string) => {
    const checksummed = ethers.getAddress(address);
    const topicAddress = ethers.zeroPadValue(checksummed, 32);
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - HISTORY_BLOCK_WINDOW);
    const iface = new ethers.Interface(USDC_ABI);

    const [incomingLogs, outgoingLogs] = await Promise.all([
      provider.getLogs({
        address: ARC_TESTNET.usdc.address,
        fromBlock,
        toBlock: latestBlock,
        topics: [TRANSFER_EVENT_TOPIC, null, topicAddress]
      }),
      provider.getLogs({
        address: ARC_TESTNET.usdc.address,
        fromBlock,
        toBlock: latestBlock,
        topics: [TRANSFER_EVENT_TOPIC, topicAddress]
      })
    ]);

    const seen = new Set<string>();
    const combined = [...incomingLogs, ...outgoingLogs]
      .filter((log) => {
        const key = `${log.transactionHash}-${log.index}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      })
      .sort((left, right) => {
        if (left.blockNumber === right.blockNumber) {
          return right.index - left.index;
        }

        return right.blockNumber - left.blockNumber;
      })
      .slice(0, 10);

    return Promise.all(
      combined.map(async (log) => {
        const parsed = iface.parseLog(log);
        if (!parsed) {
          throw new Error("Unable to decode Arc USDC transfer log.");
        }
        const from = parsed.args[0] as string;
        const to = parsed.args[1] as string;
        const value = parsed.args[2] as bigint;
        const positive = ethers.getAddress(to) === checksummed;
        const block = await provider.getBlock(log.blockNumber);
        const timestamp = block?.timestamp ?? Math.floor(Date.now() / 1000);

        return {
          id: `${log.transactionHash}-${log.index}`,
          direction: positive ? "incoming" : "outgoing",
          title: positive
            ? `Incoming from ${truncateAddress(from)}`
            : `Outgoing to ${truncateAddress(to)}`,
          address: positive ? from : to,
          timestamp: formatRelativeTime(timestamp),
          amount: `${positive ? "+" : "-"}$${formatTokenAmount(value)} ${ARC_TESTNET.usdc.symbol}`,
          status: positive ? "success" : "completed",
          positive,
          chain: ARC_TESTNET.chainName.toUpperCase(),
          icon: positive ? ArrowDownLeft : ArrowUpRight
        } satisfies ActivityItem;
      })
    );
  }, []);

  const refreshWalletData = useCallback(
    async (providedAddress?: string) => {
      const injected = getInjectedProvider();
      const nextAddress = providedAddress ?? walletAddress;

      if (!injected || !nextAddress) {
        return;
      }

      const browserProvider = new ethers.BrowserProvider(injected);
      setIsBalanceLoading(true);
      setIsActivityLoading(true);

      try {
        const usdcContract = new ethers.Contract(ARC_TESTNET.usdc.address, USDC_ABI, browserProvider);
        const [nextBalance, nextHistory] = await Promise.all([
          usdcContract.balanceOf(nextAddress) as Promise<bigint>,
          fetchTransferHistory(browserProvider, nextAddress)
        ]);

        setBalance(nextBalance);
        setHistoryItems(nextHistory);
      } catch (error) {
        console.error(error);
        pushToast({
          tone: "error",
          title: "Sync failed",
          description: "Unable to refresh the Arc Testnet balance or transaction history."
        });
      } finally {
        setIsBalanceLoading(false);
        setIsActivityLoading(false);
      }
    },
    [fetchTransferHistory, pushToast, walletAddress]
  );

  const connectWallet = useCallback(async () => {
    const injected = getInjectedProvider();
    if (!injected) {
      pushToast({
        tone: "error",
        title: "MetaMask not detected",
        description: "Install MetaMask to connect your Arc Testnet treasury wallet."
      });
      return;
    }

    setIsConnecting(true);

    try {
      await ensureArcNetwork(injected);
      const browserProvider = new ethers.BrowserProvider(injected);
      const accounts = (await browserProvider.send("eth_requestAccounts", [])) as string[];

      if (!accounts.length) {
        throw new Error("No wallet accounts returned.");
      }

      const nextAddress = ethers.getAddress(accounts[0]);
      setWalletAddress(nextAddress);
      pushToast({
        tone: "success",
        title: "Wallet connected",
        description: `Connected ${truncateAddress(nextAddress)} on Arc Testnet.`
      });

      await refreshWalletData(nextAddress);
    } catch (error) {
      console.error(error);
      pushToast({
        tone: "error",
        title: "Connection failed",
        description: "The wallet connection was cancelled or the network switch did not complete."
      });
    } finally {
      setIsConnecting(false);
    }
  }, [pushToast, refreshWalletData]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  useEffect(() => {
    const injected = getInjectedProvider();
    if (!injected) {
      return;
    }
    const availableProvider = injected;

    let cancelled = false;

    async function restoreSession() {
      try {
        const accounts = (await availableProvider.request({ method: "eth_accounts" })) as string[];
        if (!accounts.length || cancelled) {
          return;
        }

        const browserProvider = new ethers.BrowserProvider(availableProvider);
        const network = await browserProvider.getNetwork();
        const nextAddress = ethers.getAddress(accounts[0]);
        setWalletAddress(nextAddress);

        if (Number(network.chainId) === ARC_TESTNET.chainId && !cancelled) {
          await refreshWalletData(nextAddress);
        }
      } catch (error) {
        console.error(error);
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [refreshWalletData]);

  useEffect(() => {
    const injected = getInjectedProvider();
    if (!injected?.on) {
      return;
    }

    const handleAccountsChanged = (accounts: unknown) => {
      const nextAccounts = Array.isArray(accounts) ? (accounts as string[]) : [];

      if (!nextAccounts.length) {
        setWalletAddress(null);
        setBalance(null);
        setHistoryItems([]);
        setTxState(null);
        return;
      }

      const nextAddress = ethers.getAddress(nextAccounts[0]);
      setWalletAddress(nextAddress);
      void refreshWalletData(nextAddress);
    };

    const handleChainChanged = () => {
      if (walletAddress) {
        void refreshWalletData(walletAddress);
      }
    };

    injected.on?.("accountsChanged", handleAccountsChanged);
    injected.on?.("chainChanged", handleChainChanged);

    return () => {
      injected.removeListener?.("accountsChanged", handleAccountsChanged);
      injected.removeListener?.("chainChanged", handleChainChanged);
    };
  }, [refreshWalletData, walletAddress]);

  const dynamicSummaryStats = useMemo<SummaryStat[]>(() => {
    const available = balance === null ? "--" : `$${formatTokenAmount(balance)}`;
    const pendingAmount =
      txState?.status === "pending" ? `$${txState.amount}` : summaryStats[1]?.value ?? "$0.00";

    return [
      { label: "Available treasury", value: available },
      { label: "Pending settlements", value: pendingAmount },
      summaryStats[2] ?? { label: "Yield status", value: "--" }
    ];
  }, [balance, summaryStats, txState]);

  const currentBalanceLabel =
    balance === null ? treasurySnapshot.balance : `$${formatTokenAmount(balance)}`;

  const walletButtonLabel = walletAddress ? truncateAddress(walletAddress) : "Connect MetaMask";

  async function copyWallet() {
    if (!walletAddress) {
      pushToast({
        tone: "error",
        title: "No wallet connected",
        description: "Connect MetaMask before copying a treasury address."
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      pushToast({
        tone: "success",
        title: "Wallet copied",
        description: "The connected wallet address has been copied to your clipboard."
      });
    } catch {
      pushToast({
        tone: "error",
        title: "Copy failed",
        description: "Clipboard access was unavailable. Please copy the address manually."
      });
    }
  }

  async function sendUsdc() {
    const recipient = sendForm.recipient.trim();
    const amount = sendForm.amount.trim();

    if (!walletAddress) {
      setSendForm((current) => ({ ...current, error: "Connect MetaMask before sending funds." }));
      return false;
    }

    if (!ethers.isAddress(recipient)) {
      setSendForm((current) => ({ ...current, error: "Enter a valid recipient address." }));
      return false;
    }

    if (!amount || Number(amount) <= 0) {
      setSendForm((current) => ({ ...current, error: "Enter a valid USDC amount." }));
      return false;
    }

    let parsedAmount: bigint;
    try {
      parsedAmount = ethers.parseUnits(amount, ARC_TESTNET.usdc.decimals);
    } catch {
      setSendForm((current) => ({ ...current, error: "The USDC amount format is invalid." }));
      return false;
    }

    if (balance !== null && parsedAmount > balance) {
      setSendForm((current) => ({ ...current, error: "Insufficient USDC balance for this transfer." }));
      return false;
    }

    const injected = getInjectedProvider();
    if (!injected) {
      setSendForm((current) => ({ ...current, error: "MetaMask is not available in this browser." }));
      return false;
    }

    setIsSending(true);
    setSendForm((current) => ({ ...current, error: "" }));

    try {
      await ensureArcNetwork(injected);
      const browserProvider = new ethers.BrowserProvider(injected);
      const signer = await browserProvider.getSigner();
      const usdcContract = new ethers.Contract(ARC_TESTNET.usdc.address, USDC_ABI, signer);
      const feeOverrides = await buildArcFeeOverrides(browserProvider);
      const tx = await usdcContract.transfer(recipient, parsedAmount, feeOverrides);

      setTxState({
        hash: tx.hash,
        status: "pending",
        description: "Treasury transfer submitted and waiting for finality.",
        amount,
        recipient
      });

      pushToast({
        tone: "success",
        title: "Transaction submitted",
        description: `Transfer broadcast: ${truncateAddress(tx.hash, 8, 6)}`
      });

      const receipt = await tx.wait();

      if (!receipt || receipt.status !== BigInt(1)) {
        throw new Error("Transaction failed onchain.");
      }

      setTxState({
        hash: tx.hash,
        status: "success",
        description: "Transfer finalized successfully on Arc Testnet.",
        amount,
        recipient
      });

      pushToast({
        tone: "success",
        title: "Transfer finalized",
        description: "The USDC treasury transfer completed successfully."
      });

      setSendForm({
        recipient: "",
        amount: "",
        error: ""
      });

      await refreshWalletData(walletAddress);
      return true;
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "The transfer could not be completed.";

      setTxState({
        hash: `failed-${Date.now()}`,
        status: "failed",
        description: message,
        amount,
        recipient
      });

      setSendForm((current) => ({ ...current, error: message }));

      pushToast({
        tone: "error",
        title: "Transfer failed",
        description: message
      });
      return false;
    } finally {
      setIsSending(false);
    }
  }

  async function receiveUsdc() {
    setIsReceivePending(true);
    try {
      await copyWallet();
    } finally {
      setIsReceivePending(false);
    }
  }

  return {
    copied,
    walletAddress,
    walletButtonLabel,
    currentBalanceLabel,
    dynamicSummaryStats,
    isConnecting,
    isBalanceLoading,
    isActivityLoading,
    isSending,
    isReceivePending,
    historyItems,
    txState,
    sendForm,
    balanceDisplay: balance === null ? "--" : formatTokenAmount(balance),
    connectWallet,
    copyWallet,
    receiveUsdc,
    refreshWalletData,
    sendUsdc,
    setSendForm,
    setTxState
  };
}
