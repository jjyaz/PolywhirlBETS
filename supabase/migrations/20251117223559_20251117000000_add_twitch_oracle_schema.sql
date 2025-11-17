/*
  # Add Twitch Oracle Schema for Pokemon Battle Betting

  1. New Tables
    - `twitch_monitored_channels`
      - `id` (uuid, primary key)
      - `channel_name` (text, unique)
      - `game_id` (text)
      - `game_name` (text)
      - `is_active` (boolean, default true)
      - `priority_level` (integer, default 1)
      - `last_checked` (timestamptz)
      - `created_at` (timestamptz)

    - `twitch_stream_sessions`
      - `id` (uuid, primary key)
      - `stream_id` (text, unique)
      - `channel_name` (text)
      - `user_id` (text)
      - `game_id` (text)
      - `game_name` (text)
      - `title` (text)
      - `viewer_count` (integer)
      - `thumbnail_url` (text)
      - `started_at` (timestamptz)
      - `ended_at` (timestamptz, nullable)
      - `is_live` (boolean, default true)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `battle_detection_logs`
      - `id` (uuid, primary key)
      - `stream_session_id` (uuid, foreign key)
      - `raw_title` (text)
      - `detected_player_one` (text, nullable)
      - `detected_player_two` (text, nullable)
      - `detection_pattern` (text)
      - `confidence_score` (numeric)
      - `detection_timestamp` (timestamptz)

    - `market_auto_settlement`
      - `id` (uuid, primary key)
      - `market_id` (uuid, foreign key)
      - `stream_session_id` (uuid, foreign key)
      - `stream_title` (text)
      - `parsed_winner` (text, nullable)
      - `confidence_score` (numeric)
      - `settlement_status` (text)
      - `verified_by` (uuid, nullable, foreign key to users)
      - `created_at` (timestamptz)
      - `settled_at` (timestamptz, nullable)

    - `pokemon_game_ids`
      - `id` (uuid, primary key)
      - `game_id` (text, unique)
      - `game_name` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)

  2. Updates to betting_markets
    - Add Twitch-specific fields for livestream integration

  3. Security
    - Enable RLS on all new tables
    - Add policies for read access and admin write access
*/

CREATE TABLE IF NOT EXISTS twitch_monitored_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_name text UNIQUE NOT NULL,
  game_id text,
  game_name text,
  is_active boolean DEFAULT true,
  priority_level integer DEFAULT 1,
  last_checked timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS twitch_stream_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id text UNIQUE NOT NULL,
  channel_name text NOT NULL,
  user_id text NOT NULL,
  game_id text NOT NULL,
  game_name text,
  title text NOT NULL,
  viewer_count integer DEFAULT 0,
  thumbnail_url text,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  is_live boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS battle_detection_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_session_id uuid REFERENCES twitch_stream_sessions(id) ON DELETE CASCADE,
  raw_title text NOT NULL,
  detected_player_one text,
  detected_player_two text,
  detection_pattern text,
  confidence_score numeric(5,2) DEFAULT 0,
  detection_timestamp timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_auto_settlement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid REFERENCES betting_markets(id) ON DELETE CASCADE,
  stream_session_id uuid REFERENCES twitch_stream_sessions(id) ON DELETE CASCADE,
  stream_title text NOT NULL,
  parsed_winner text,
  confidence_score numeric(5,2) DEFAULT 0,
  settlement_status text DEFAULT 'pending',
  verified_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  settled_at timestamptz
);

CREATE TABLE IF NOT EXISTS pokemon_game_ids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id text UNIQUE NOT NULL,
  game_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'betting_markets' AND column_name = 'twitch_stream_id'
  ) THEN
    ALTER TABLE betting_markets ADD COLUMN twitch_stream_id uuid REFERENCES twitch_stream_sessions(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'betting_markets' AND column_name = 'twitch_channel_name'
  ) THEN
    ALTER TABLE betting_markets ADD COLUMN twitch_channel_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'betting_markets' AND column_name = 'is_live_stream'
  ) THEN
    ALTER TABLE betting_markets ADD COLUMN is_live_stream boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'betting_markets' AND column_name = 'stream_embed_url'
  ) THEN
    ALTER TABLE betting_markets ADD COLUMN stream_embed_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'betting_markets' AND column_name = 'player_one'
  ) THEN
    ALTER TABLE betting_markets ADD COLUMN player_one text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'betting_markets' AND column_name = 'player_two'
  ) THEN
    ALTER TABLE betting_markets ADD COLUMN player_two text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'betting_markets' AND column_name = 'viewer_count'
  ) THEN
    ALTER TABLE betting_markets ADD COLUMN viewer_count integer DEFAULT 0;
  END IF;
END $$;

ALTER TABLE twitch_monitored_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE twitch_stream_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_detection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_auto_settlement ENABLE ROW LEVEL SECURITY;
ALTER TABLE pokemon_game_ids ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view monitored channels"
  ON twitch_monitored_channels FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can view stream sessions"
  ON twitch_stream_sessions FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can view battle detection logs"
  ON battle_detection_logs FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can view settlement status"
  ON market_auto_settlement FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Anyone can view Pokemon game IDs"
  ON pokemon_game_ids FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_twitch_stream_sessions_channel ON twitch_stream_sessions(channel_name);
CREATE INDEX IF NOT EXISTS idx_twitch_stream_sessions_live ON twitch_stream_sessions(is_live);
CREATE INDEX IF NOT EXISTS idx_battle_detection_stream ON battle_detection_logs(stream_session_id);
CREATE INDEX IF NOT EXISTS idx_market_settlement_market ON market_auto_settlement(market_id);
CREATE INDEX IF NOT EXISTS idx_betting_markets_twitch_stream ON betting_markets(twitch_stream_id);
