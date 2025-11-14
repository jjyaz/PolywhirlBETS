import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const SOLANA_NETWORK = 'mainnet-beta';

const RPC_URLS = [
  'https://api.mainnet-beta.solana.com',
  'https://rpc.ankr.com/solana',
  'https://solana-mainnet.publicnode.com',
  'https://1rpc.io/sol'
];

export const connection = new Connection(RPC_URLS[0], 'confirmed');

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

export const getBalance = async (publicKey: PublicKey): Promise<number> => {
  try {
    console.log('Fetching balance for:', publicKey.toString());
    const balance = await connection.getBalance(publicKey);
    console.log('Balance (lamports):', balance);
    const solBalance = lamportsToSol(balance);
    console.log('Balance (SOL):', solBalance);
    return solBalance;
  } catch (error) {
    console.error('Balance fetch error:', error);
    throw error;
  }
};
