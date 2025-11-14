/*
  # Polywhirl Bets Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `wallet_address` (text, unique) - Solana wallet address
      - `username` (text, nullable)
      - `total_bets` (integer, default 0)
      - `total_winnings` (numeric, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `betting_markets`
      - `id` (uuid, primary key)
      - `title` (text) - e.g., "Lakers vs Warriors"
      - `category` (text) - e.g., "Gym Battles", "Evolution Parlays"
      - `description` (text)
      - `event_date` (timestamptz)
      - `status` (text) - open, closed, settled
      - `outcome` (text, nullable) - winning option
      - `created_at` (timestamptz)
      - `image_url` (text, nullable)
    
    - `market_options`
      - `id` (uuid, primary key)
      - `market_id` (uuid, foreign key)
      - `option_name` (text) - e.g., "Lakers Win", "Over 200 points"
      - `odds` (numeric) - decimal odds
      - `total_pool` (numeric, default 0) - total SOL bet on this option
      - `created_at` (timestamptz)
    
    - `bets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `market_id` (uuid, foreign key)
      - `option_id` (uuid, foreign key)
      - `amount` (numeric) - bet amount in SOL
      - `potential_payout` (numeric) - calculated payout
      - `status` (text) - pending, won, lost
      - `transaction_signature` (text) - Solana tx signature
      - `is_parlay` (boolean, default false)
      - `parlay_group_id` (uuid, nullable) - groups parlay bets
      - `created_at` (timestamptz)
      - `settled_at` (timestamptz, nullable)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (text) - deposit, withdrawal, bet, payout
      - `amount` (numeric)
      - `signature` (text) - Solana tx signature
      - `status` (text) - pending, confirmed, failed
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for betting markets and options
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  username text,
  total_bets integer DEFAULT 0,
  total_winnings numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can create user profile"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create betting_markets table
CREATE TABLE IF NOT EXISTS betting_markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  description text,
  event_date timestamptz,
  status text DEFAULT 'open',
  outcome text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE betting_markets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view betting markets"
  ON betting_markets FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create market_options table
CREATE TABLE IF NOT EXISTS market_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES betting_markets(id) ON DELETE CASCADE,
  option_name text NOT NULL,
  odds numeric NOT NULL,
  total_pool numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view market options"
  ON market_options FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create bets table
CREATE TABLE IF NOT EXISTS bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  market_id uuid REFERENCES betting_markets(id) ON DELETE CASCADE,
  option_id uuid REFERENCES market_options(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  potential_payout numeric NOT NULL,
  status text DEFAULT 'pending',
  transaction_signature text,
  is_parlay boolean DEFAULT false,
  parlay_group_id uuid,
  created_at timestamptz DEFAULT now(),
  settled_at timestamptz
);

ALTER TABLE bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bets"
  ON bets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bets"
  ON bets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric NOT NULL,
  signature text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_markets_status ON betting_markets(status);
CREATE INDEX IF NOT EXISTS idx_bets_user ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_market ON bets(market_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);