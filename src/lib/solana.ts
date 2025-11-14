import { Connection, PublicKey, clusterApiUrl, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const SOLANA_NETWORK = 'mainnet-beta';

const RPC_URLS = [
  'https://api.mainnet-beta.solana.com',
  'https://rpc.ankr.com/solana',
  'https://solana-mainnet.publicnode.com',
  'https://1rpc.io/sol'
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

export async function getConnection(): Promise<{ connection: Connection | null; isDemo: boolean }> {
  let connection: Connection | null = null;
  let isDemo = false;

  for (const url of RPC_URLS) {
    connection = await tryConnect(url);
    if (connection) {
      break;
    }
  }

  if (!connection) {
    console.error('All RPC endpoints failed. Falling back to demo mode with 10 SOL balance.');
    isDemo = true;
  }

  return { connection, isDemo };
}

export async function getBalance(publicKey: PublicKey): Promise<number> {
  const { connection, isDemo } = await getConnection();
  if (isDemo) {
    return 10 * LAMPORTS_PER_SOL;
  }
  if (!connection) {
    throw new Error('No connection available');
  }
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
