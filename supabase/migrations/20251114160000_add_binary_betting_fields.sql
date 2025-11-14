/*
  # Add Binary Betting Fields

  1. Changes to betting_markets table
    - Add `market_type` column to distinguish between binary and multi-option markets
    - Add `yes_odds` column for binary markets (percentage 0-100)
    - Add `no_odds` column for binary markets (percentage 0-100)
    - Add `total_volume` column to track total betting volume
    - Add `liquidity` column to track market liquidity

  2. Changes to market_options table
    - Add `yes_pool` column for binary option tracking
    - Add `no_pool` column for binary option tracking

  3. Notes
    - Binary markets will use yes_odds/no_odds directly
    - Multi-option markets continue using market_options table
    - Odds will be dynamically updated based on bet volumes
*/

-- Add new columns to betting_markets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'betting_markets' AND column_name = 'market_type'
  ) THEN
    ALTER TABLE betting_markets ADD COLUMN market_type text DEFAULT 'multi';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'betting_markets' AND column_name = 'yes_odds'
  ) THEN
    ALTER TABLE betting_markets ADD COLUMN yes_odds integer DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'betting_markets' AND column_name = 'no_odds'
  ) THEN
    ALTER TABLE betting_markets ADD COLUMN no_odds integer DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'betting_markets' AND column_name = 'total_volume'
  ) THEN
    ALTER TABLE betting_markets ADD COLUMN total_volume numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'betting_markets' AND column_name = 'liquidity'
  ) THEN
    ALTER TABLE betting_markets ADD COLUMN liquidity numeric DEFAULT 0;
  END IF;
END $$;

-- Add new columns to market_options
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'market_options' AND column_name = 'yes_pool'
  ) THEN
    ALTER TABLE market_options ADD COLUMN yes_pool numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'market_options' AND column_name = 'no_pool'
  ) THEN
    ALTER TABLE market_options ADD COLUMN no_pool numeric DEFAULT 0;
  END IF;
END $$;

-- Update existing binary markets (those with exactly 2 options containing Yes/No)
UPDATE betting_markets bm
SET market_type = 'binary',
    yes_odds = 57,
    no_odds = 43,
    total_volume = 100,
    liquidity = 50
WHERE bm.id IN (
  SELECT market_id
  FROM market_options
  GROUP BY market_id
  HAVING COUNT(*) = 2
);

-- Set specific odds for crypto markets
UPDATE betting_markets
SET yes_odds = 62, no_odds = 38
WHERE title LIKE '%Bitcoin%' OR title LIKE '%BTC%';

UPDATE betting_markets
SET yes_odds = 45, no_odds = 55
WHERE title LIKE '%Solana%' OR title LIKE '%SOL%';
