import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const SOLANA_NETWORK = 'mainnet-beta';

const RPC_URLS = [
  'https://api.mainnet-beta.solana.com',
  'https://rpc.ankr.com/solana',
  'https://solana-mainnet.publicnode.com',
  'https://1rpc.io/sol',
  'https://solana-rpc.publicnode.com',
  'https://rpc.hellomoon.io/solana-mainnet',
  'https://solana-mainnet.rpc.extrnode.com'
];

function timeout(ms: number) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('RPC timeout')), ms));
}

async function tryConnect(url: string): Promise<Connection | null> {
  console.log(`Trying RPC endpoint: ${url}`);
  const connection = new Connection(url, 'confirmed');
  try {
    await Promise.race([timeout(8000), connection.getVersion()]);
    console.log(`Successfully connected to ${url}`);
    return connection;
  } catch (error) {
    console.error(`Failed to connect to ${url}: ${(error as Error).message}`);
    return null;
  }
}

export async function getConnection(): Promise<Connection> {
  for (const url of RPC_URLS) {
    const connection = await tryConnect(url);
    if (connection) {
      return connection;
    }
  }

  throw new Error('All RPC endpoints failed. Unable to connect to Solana network.');
}

export async function getBalance(publicKey: PublicKey): Promise<number> {
  const connection = await getConnection();
  return connection.getBalance(publicKey);
}

export const PLATFORM_WALLET = new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin');

export const lamportsToSol = (lamports: number): number => {
  return lamports / LAMPORTS_PER_SOL;
};

export const solToLamports = (sol: number): number => {
  return Math.floor(sol * LAMPORTS_PER_SOL);
};

export const formatSol = (amount: number): string => {
  return `◎${amount.toFixed(4)}`;
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

export { LAMPORTS_PER_SOL };
