import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: string;
  wallet_address: string;
  username: string | null;
  profile_picture_url: string | null;
  total_bets: number;
  total_winnings: number;
  created_at: string;
  updated_at: string;
}

export interface BettingMarket {
  id: string;
  title: string;
  category: string;
  description: string | null;
  event_date: string | null;
  status: string;
  outcome: string | null;
  image_url: string | null;
  market_type: string;
  yes_odds: number;
  no_odds: number;
  total_volume: number;
  liquidity: number;
  created_at: string;
}

export interface MarketOption {
  id: string;
  market_id: string;
  option_name: string;
  odds: number;
  total_pool: number;
  created_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  market_id: string;
  option_id: string;
  amount: number;
  potential_payout: number;
  status: string;
  transaction_signature: string | null;
  is_parlay: boolean;
  parlay_group_id: string | null;
  created_at: string;
  settled_at: string | null;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  signature: string;
  status: string;
  created_at: string;
}
