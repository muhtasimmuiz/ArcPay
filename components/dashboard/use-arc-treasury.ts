"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

type SyncStatus = "idle" | "success" | "error";

type ArcEthereumProvider = ethers.Eip1193Provider & {
  on?: (event: string, listener: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
};

const MANUAL_DISCONNECT_KEY = "arcpay:wallet:manually-disconnected";

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

function getManualDisconnectFlag() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(MANUAL_DISCONNECT_KEY) === "true";
}

function setManualDisconnectFlag(value: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    window.sessionStorage.setItem(MANUAL_DISCONNECT_KEY, "true");
    return;
  }

  window.sessionStorage.removeItem(MANUAL_DISCONNECT_KEY);
}

function normalizeWalletAddress(value: string) {
  const trimmed = value.trim();

  if (!trimmed || !ethers.isAddress(trimmed)) {
    return null;
  }

  return ethers.getAddress(trimmed);
}

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
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
  const readProviderRef = useRef(
    new ethers.JsonRpcProvider(ARC_TESTNET.rpcUrl, ARC_TESTNET.chainId)
  );
  const lastSyncErrorAtRef = useRef(0);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isActivityLoading, setIsActivityLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isReceivePending, setIsReceivePending] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [historyItems, setHistoryItems] = useState<ActivityItem[]>([]);
  const [txState, setTxState] = useState<TxState>(null);
  const [gasEstimate, setGasEstimate] = useState("--");
  const [isEstimatingGas, setIsEstimatingGas] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [hasLoadedBalance, setHasLoadedBalance] = useState(false);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const [sendForm, setSendForm] = useState<SendFormState>({
    recipient: "",
    amount: "",
    error: ""
  });

  const fetchTransferHistory = useCallback(async (provider: ethers.Provider, address: string) => {
    const checksummed = ethers.getAddress(address);
    const topicAddress = ethers.zeroPadValue(checksummed, 32);
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = Math.max(0, latestBlock - HISTORY_BLOCK_WINDOW);
    const iface = new ethers.Interface(USDC_ABI);

    // Rebuild the recent ledger directly from Transfer logs so the dashboard stays
    // consistent with onchain data even without an indexer backend.
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
      const readProvider = readProviderRef.current;
      const network = await browserProvider.getNetwork();
      setCurrentChainId(Number(network.chainId));
      setIsBalanceLoading(!hasLoadedBalance);
      setIsActivityLoading(!hasLoadedHistory);

      const browserUsdcContract = new ethers.Contract(ARC_TESTNET.usdc.address, USDC_ABI, browserProvider);
      const [balanceResult, historyResult] = await Promise.allSettled([
        withTimeout(
          browserUsdcContract.balanceOf(nextAddress) as Promise<bigint>,
          8000,
          "Arc balance lookup timed out."
        ),
        withTimeout(
          fetchTransferHistory(readProvider, nextAddress),
          10000,
          "Arc transaction history lookup timed out."
        )
      ]);

      let hasBalanceFailure = false;
      let hasHistoryFailure = false;

      if (balanceResult.status === "fulfilled") {
        setBalance(balanceResult.value);
        setSyncStatus("success");
        setHasLoadedBalance(true);
      } else {
        console.error(balanceResult.reason);
        setBalance(null);
        setSyncStatus("error");
        hasBalanceFailure = true;
      }

      if (historyResult.status === "fulfilled") {
        setHistoryItems(historyResult.value);
        setHasLoadedHistory(true);
      } else {
        console.error(historyResult.reason);
        setHistoryItems([]);
        setHasLoadedHistory(true);
        hasHistoryFailure = true;
      }

      if (hasBalanceFailure) {
        const now = Date.now();

        if (now - lastSyncErrorAtRef.current > 6000) {
          lastSyncErrorAtRef.current = now;
          pushToast({
            tone: "error",
            title: "Sync failed",
            description: "Unable to refresh the Arc Testnet balance right now. Wallet actions are still available."
          });
        }
      }

      if (!hasBalanceFailure && hasHistoryFailure) {
        setSyncStatus("success");
      }

      if (!hasLoadedBalance || balanceResult.status === "fulfilled") {
        setIsBalanceLoading(false);
      }

      if (!hasLoadedHistory || historyResult.status === "fulfilled") {
        setIsActivityLoading(false);
      }
    },
    [fetchTransferHistory, hasLoadedBalance, hasLoadedHistory, pushToast, walletAddress]
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
    setManualDisconnectFlag(false);

    try {
      await ensureArcNetwork(injected);
      const browserProvider = new ethers.BrowserProvider(injected);
      const network = await browserProvider.getNetwork();
      setCurrentChainId(Number(network.chainId));
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
        if (getManualDisconnectFlag()) {
          return;
        }

        // Restore any previously authorized wallet so returning users land on live
        // treasury data without manually reconnecting MetaMask each time.
        const accounts = (await availableProvider.request({ method: "eth_accounts" })) as string[];
        if (!accounts.length || cancelled) {
          return;
        }

        const browserProvider = new ethers.BrowserProvider(availableProvider);
        const network = await browserProvider.getNetwork();
        setCurrentChainId(Number(network.chainId));
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
        setManualDisconnectFlag(true);
        setWalletAddress(null);
        setCurrentChainId(null);
        setBalance(null);
        setHistoryItems([]);
        setTxState(null);
        setGasEstimate("--");
        setIsEstimatingGas(false);
        setSyncStatus("idle");
        setHasLoadedBalance(false);
        setHasLoadedHistory(false);
        setSendForm({
          recipient: "",
          amount: "",
          error: ""
        });
        pushToast({
          tone: "error",
          title: "Wallet disconnected",
          description: "MetaMask disconnected. Reconnect your treasury wallet to resume activity."
        });
        return;
      }

      const nextAddress = normalizeWalletAddress(nextAccounts[0]);
      if (!nextAddress) {
        return;
      }
      setWalletAddress(nextAddress);
      void refreshWalletData(nextAddress);
    };

    const handleChainChanged = (chainId: unknown) => {
      let nextChainId: number | null = null;

      if (typeof chainId === "string") {
        nextChainId = Number(BigInt(chainId));
        setCurrentChainId(nextChainId);
      }

      if (nextChainId !== null && nextChainId !== ARC_TESTNET.chainId) {
        setSendForm((current) => ({
          ...current,
          error: "Wrong network detected. Switch back to Arc Testnet before sending."
        }));
        pushToast({
          tone: "error",
          title: "Wrong network",
          description: "MetaMask is not on Arc Testnet. Treasury transfers are temporarily disabled."
        });
      }

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
  }, [pushToast, refreshWalletData, walletAddress]);

  useEffect(() => {
    if (!walletAddress || currentChainId !== ARC_TESTNET.chainId || isSending) {
      return;
    }

    // Keep treasury metrics fresh, but pause polling while a transfer is in flight to
    // avoid racing pending state updates against confirmed onchain data.
    const intervalId = window.setInterval(() => {
      void refreshWalletData(walletAddress);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [currentChainId, isSending, refreshWalletData, walletAddress]);

  useEffect(() => {
    if (!walletAddress || currentChainId !== ARC_TESTNET.chainId) {
      setGasEstimate("--");
      setIsEstimatingGas(false);
      return;
    }

    const recipient = sendForm.recipient.trim();
    const amount = sendForm.amount.trim();

    if (!recipient || !amount || !ethers.isAddress(recipient) || Number(amount) <= 0) {
      setGasEstimate("--");
      setIsEstimatingGas(false);
      return;
    }

    let cancelled = false;
    const timeoutId = window.setTimeout(async () => {
      const injected = getInjectedProvider();
      if (!injected) {
        return;
      }

      setIsEstimatingGas(true);

      try {
        const parsedAmount = ethers.parseUnits(amount, ARC_TESTNET.usdc.decimals);
        const browserProvider = new ethers.BrowserProvider(injected);
        const signer = await browserProvider.getSigner();
        const contract = new ethers.Contract(ARC_TESTNET.usdc.address, USDC_ABI, signer);
        // Arc gas is charged in stable-value terms, so we estimate using the current
        // network fee overrides to preview the real treasury cost before confirmation.
        const feeOverrides = await buildArcFeeOverrides(browserProvider);
        const gasLimit = await contract.transfer.estimateGas(recipient, parsedAmount, feeOverrides);
        const gasPrice =
          "maxFeePerGas" in feeOverrides
            ? feeOverrides.maxFeePerGas
            : "gasPrice" in feeOverrides
              ? feeOverrides.gasPrice
              : null;

        if (!cancelled && gasPrice) {
          const totalFee = gasLimit * gasPrice;
          setGasEstimate(`${ethers.formatUnits(totalFee, ARC_TESTNET.nativeCurrency.decimals)} USDC`);
        }
      } catch {
        if (!cancelled) {
          setGasEstimate("Unavailable");
        }
      } finally {
        if (!cancelled) {
          setIsEstimatingGas(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [currentChainId, sendForm.amount, sendForm.recipient, walletAddress]);

  const dynamicSummaryStats = useMemo<SummaryStat[]>(() => {
    if (!walletAddress) {
      return [
        { label: "Available treasury", value: "--" },
        { label: "Pending settlements", value: "--" },
        { label: "Yield status", value: "--" }
      ];
    }

    const available = balance === null ? "--" : `$${formatTokenAmount(balance)}`;
    const pendingAmount =
      txState?.status === "pending" ? `$${txState.amount}` : summaryStats[1]?.value ?? "$0.00";

    return [
      { label: "Available treasury", value: available },
      { label: "Pending settlements", value: pendingAmount },
      summaryStats[2] ?? { label: "Yield status", value: "--" }
    ];
  }, [balance, summaryStats, txState, walletAddress]);

  const currentBalanceLabel = !walletAddress
    ? "--"
    : balance === null
      ? "--"
      : `$${formatTokenAmount(balance)}`;

  const walletButtonLabel = walletAddress ? truncateAddress(walletAddress) : "Connect MetaMask";
  const isWrongNetwork = currentChainId !== null && currentChainId !== ARC_TESTNET.chainId;
  const networkStatusLabel = walletAddress
    ? isWrongNetwork
      ? "Wrong Network"
      : "Connected"
    : "Disconnected";

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
    const recipient = normalizeWalletAddress(sendForm.recipient);
    const amount = sendForm.amount.trim();

    if (!walletAddress) {
      setSendForm((current) => ({ ...current, error: "Connect MetaMask before sending funds." }));
      return false;
    }

    if (isSending || txState?.status === "pending") {
      setSendForm((current) => ({
        ...current,
        error: "A transfer is already pending. Wait for confirmation before sending again."
      }));
      return false;
    }

    if (isWrongNetwork) {
      setSendForm((current) => ({
        ...current,
        error: "Switch MetaMask to Arc Testnet before sending treasury funds."
      }));
      return false;
    }

    if (!recipient) {
      setSendForm((current) => ({ ...current, error: "Enter a valid recipient address." }));
      return false;
    }

    if (recipient === walletAddress) {
      setSendForm((current) => ({
        ...current,
        error: "Recipient address must be different from the connected treasury wallet."
      }));
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

      if (!receipt || receipt.status !== 1) {
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
        error instanceof Error
          ? error.message.includes("user rejected")
            ? "Transaction rejected in MetaMask."
            : error.message
          : "The transfer could not be completed.";

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

  function disconnectWallet() {
    setManualDisconnectFlag(true);
    setWalletAddress(null);
    setCurrentChainId(null);
    setBalance(null);
    setHistoryItems([]);
    setTxState(null);
    setGasEstimate("--");
    setIsEstimatingGas(false);
    setSyncStatus("idle");
    setHasLoadedBalance(false);
    setHasLoadedHistory(false);
    setSendForm({
      recipient: "",
      amount: "",
      error: ""
    });

    pushToast({
      tone: "success",
      title: "Wallet disconnected",
      description: "The connected wallet has been removed from this dashboard session."
    });
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
    gasEstimate,
    isEstimatingGas,
    isWrongNetwork,
    syncStatus,
    networkStatusLabel,
    connectWallet,
    disconnectWallet,
    copyWallet,
    receiveUsdc,
    refreshWalletData,
    sendUsdc,
    setSendForm,
    setTxState
  };
}
