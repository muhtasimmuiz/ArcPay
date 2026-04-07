import { ethers } from "ethers";

function getPublicEnv(name: string, fallback: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : fallback;
}

function getPublicNumberEnv(name: string, fallback: number) {
  const value = process.env[name];
  const parsed = value ? Number(value) : Number.NaN;

  return Number.isFinite(parsed) ? parsed : fallback;
}

export const ARC_TESTNET = {
  chainId: getPublicNumberEnv("NEXT_PUBLIC_ARC_CHAIN_ID", 5042002),
  chainName: getPublicEnv("NEXT_PUBLIC_ARC_CHAIN_NAME", "Arc Testnet"),
  rpcUrl: getPublicEnv("NEXT_PUBLIC_ARC_RPC_URL", "https://rpc.testnet.arc.network"),
  blockExplorerUrl: getPublicEnv("NEXT_PUBLIC_ARC_EXPLORER_URL", "https://testnet.arcscan.app"),
  nativeCurrency: {
    name: getPublicEnv("NEXT_PUBLIC_ARC_NATIVE_CURRENCY_NAME", "USDC"),
    symbol: getPublicEnv("NEXT_PUBLIC_ARC_NATIVE_CURRENCY_SYMBOL", "USDC"),
    decimals: getPublicNumberEnv("NEXT_PUBLIC_ARC_NATIVE_CURRENCY_DECIMALS", 18)
  },
  usdc: {
    address: getPublicEnv(
      "NEXT_PUBLIC_ARC_USDC_ADDRESS",
      "0x3600000000000000000000000000000000000000"
    ),
    decimals: getPublicNumberEnv("NEXT_PUBLIC_ARC_USDC_DECIMALS", 6),
    symbol: getPublicEnv("NEXT_PUBLIC_ARC_USDC_SYMBOL", "USDC")
  }
} as const;

export const USDC_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
] as const;

export const TRANSFER_EVENT_TOPIC = ethers.id("Transfer(address,address,uint256)");
export const MIN_ARC_MAX_FEE_PER_GAS = ethers.parseUnits("160", "gwei");
export const DEFAULT_PRIORITY_FEE = ethers.parseUnits("1", "gwei");
export const HISTORY_BLOCK_WINDOW = getPublicNumberEnv("NEXT_PUBLIC_ARC_HISTORY_BLOCK_WINDOW", 50_000);

export function truncateAddress(address: string, start = 6, end = 4) {
  if (!address) {
    return "";
  }

  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatTokenAmount(value: bigint, decimals = ARC_TESTNET.usdc.decimals) {
  const formatted = Number(ethers.formatUnits(value, decimals));

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(formatted);
}

export function formatRelativeTime(timestampSeconds: number) {
  const diffSeconds = Math.max(0, Math.floor(Date.now() / 1000) - timestampSeconds);

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export async function buildArcFeeOverrides(provider: ethers.BrowserProvider) {
  const feeData = await provider.getFeeData();

  if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
    return {
      maxFeePerGas:
        feeData.maxFeePerGas > MIN_ARC_MAX_FEE_PER_GAS
          ? feeData.maxFeePerGas
          : MIN_ARC_MAX_FEE_PER_GAS,
      maxPriorityFeePerGas:
        feeData.maxPriorityFeePerGas > DEFAULT_PRIORITY_FEE
          ? feeData.maxPriorityFeePerGas
          : DEFAULT_PRIORITY_FEE
    };
  }

  if (feeData.gasPrice) {
    return {
      gasPrice: feeData.gasPrice > MIN_ARC_MAX_FEE_PER_GAS ? feeData.gasPrice : MIN_ARC_MAX_FEE_PER_GAS
    };
  }

  return {
    maxFeePerGas: MIN_ARC_MAX_FEE_PER_GAS,
    maxPriorityFeePerGas: DEFAULT_PRIORITY_FEE
  };
}
