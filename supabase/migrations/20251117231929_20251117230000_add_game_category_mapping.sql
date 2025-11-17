/*
  # Add game category mapping for Twitch bets

  1. Updates
    - Add game_category column to pokemon_game_ids table
    - Update existing Pokemon games with 'pokemon' category
    - Add new fighting/racing/strategy games with their categories
  
  2. Categories
    - pokemon: Pokemon battles
    - smash: Super Smash Bros
    - tekken: Tekken
    - street-fighter: Street Fighter
    - rocket-league: Rocket League
    - chess: Chess
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pokemon_game_ids' AND column_name = 'game_category'
  ) THEN
    ALTER TABLE pokemon_game_ids ADD COLUMN game_category text;
  END IF;
END $$;

UPDATE pokemon_game_ids SET game_category = 'pokemon' WHERE game_id IN ('498566', '515025', '497451', '1613');
UPDATE pokemon_game_ids SET game_category = 'smash' WHERE game_id IN ('516575', '16282');
UPDATE pokemon_game_ids SET game_category = 'tekken' WHERE game_id IN ('518184', '19619');
UPDATE pokemon_game_ids SET game_category = 'street-fighter' WHERE game_id IN ('510497', '488615');
UPDATE pokemon_game_ids SET game_category = 'rocket-league' WHERE game_id = '30921';
UPDATE pokemon_game_ids SET game_category = 'chess' WHERE game_id = '743';
