import { createPublicClient, createWalletClient, http, formatEther, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineChain } from 'viem';

// Define the Morph Hoodi Testnet chain parameters for Viem
export const morphHoodi = defineChain({
  id: 2910,
  name: 'Morph Hoodi Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-hoodi.morph.network'] },
    public: { http: ['https://rpc-hoodi.morph.network'] },
  },
  blockExplorers: {
    default: { name: 'Morph Hoodi Explorer', url: 'https://explorer-hoodi.morph.network' },
  },
});

// Create Public Client to read data from Morph Hoodi RPC
export const publicClient = createPublicClient({
  chain: morphHoodi,
  transport: http(),
});

export function getPublicClient(customRpcUrl?: string) {
  return createPublicClient({
    chain: morphHoodi,
    transport: http(customRpcUrl || undefined),
  });
}

// Helper to get account from private key safely
export function getAccountFromKey(privateKey: string) {
  try {
    const cleanKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    // Must be 32 bytes / 64 hex chars + 0x prefix
    if (cleanKey.length !== 66) {
      return null;
    }
    return privateKeyToAccount(cleanKey as `0x${string}`);
  } catch {
    return null;
  }
}

// Helper to get wallet client for a given private key
export function getWalletClient(privateKey: string, customRpcUrl?: string) {
  const account = getAccountFromKey(privateKey);
  if (!account) return null;

  return createWalletClient({
    account,
    chain: morphHoodi,
    transport: http(customRpcUrl || undefined),
  });
}

// Generate a random EVM address (e.g. for mock vendors)
export function generateRandomAddress(): string {
  const chars = '0123456789abcdef';
  let addr = '0x';
  for (let i = 0; i < 40; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

// Generate a mock EVM transaction hash
export function generateMockTxHash(): string {
  const chars = '0123456789abcdef';
  let tx = '0x';
  for (let i = 0; i < 64; i++) {
    tx += chars[Math.floor(Math.random() * chars.length)];
  }
  return tx;
}

// Fetch on-chain balance of an address on Morph Hoodi testnet
export async function getMorphBalance(address: string, customRpcUrl?: string): Promise<string> {
  try {
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return '0.00';
    }
    const client = getPublicClient(customRpcUrl);
    const balance = await client.getBalance({
      address: address as `0x${string}`,
    });
    return formatEther(balance);
  } catch (error) {
    console.warn("Failed to fetch Morph on-chain balance:", error);
    return '0.00';
  }
}

// Broadcast a transaction from our private key to a recipient
export async function sendMorphTransaction(
  privateKey: string,
  toAddress: string,
  amountEth: string,
  customRpcUrl?: string,
  gasMultiplier?: number
): Promise<{ hash: string; success: boolean; error?: string }> {
  try {
    const account = getAccountFromKey(privateKey);
    if (!account) {
      return { hash: '', success: false, error: 'Invalid private key format.' };
    }

    const walletClient = getWalletClient(privateKey, customRpcUrl);
    if (!walletClient) {
      return { hash: '', success: false, error: 'Failed to initialize wallet client.' };
    }

    const client = getPublicClient(customRpcUrl);

    let gas: bigint | undefined;
    if (gasMultiplier && gasMultiplier !== 1) {
      try {
        const estimatedGas = await client.estimateGas({
          account,
          to: toAddress as `0x${string}`,
          value: parseEther(amountEth),
        });
        gas = (estimatedGas * BigInt(Math.round(gasMultiplier * 100))) / BigInt(100);
      } catch (err) {
        console.warn("Gas estimation failed, relying on wallet default:", err);
      }
    }

    // Send transaction (Native ETH transfer)
    const hash = await walletClient.sendTransaction({
      to: toAddress as `0x${string}`,
      value: parseEther(amountEth),
      ...(gas ? { gas } : {}),
    });

    // Wait for the transaction to be mined (receipt)
    await client.waitForTransactionReceipt({ hash });

    return { hash, success: true };
  } catch (error: unknown) {
    console.error("Morph transaction failed:", error);
    const errMessage = error instanceof Error ? error.message : 'Transaction rejected or insufficient funds for gas.';
    return {
      hash: '',
      success: false,
      error: errMessage
    };
  }
}
