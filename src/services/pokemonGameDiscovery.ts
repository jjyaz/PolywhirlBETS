import { createTwitchClient } from '../lib/twitch';
import { supabase } from '../lib/supabase';

const POKEMON_GAME_QUERIES = [
  'Pokemon Showdown',
  'Pokemon Scarlet',
  'Pokemon Violet',
  'Pokemon Sword',
  'Pokemon Shield',
  'Pokemon Unite',
  'Pokemon',
];

export async function discoverPokemonGames() {
  const twitchClient = createTwitchClient();
  const discoveredGames: Array<{ game_id: string; game_name: string }> = [];

  for (const query of POKEMON_GAME_QUERIES) {
    try {
      const games = await twitchClient.searchCategories(query);

      for (const game of games) {
        if (game.name.toLowerCase().includes('pokemon') ||
            game.name.toLowerCase().includes('pokémon')) {
          discoveredGames.push({
            game_id: game.id,
            game_name: game.name,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to search for ${query}:`, error);
    }
  }

  const uniqueGames = Array.from(
    new Map(discoveredGames.map(g => [g.game_id, g])).values()
  );

  for (const game of uniqueGames) {
    await supabase
      .from('pokemon_game_ids')
      .upsert(
        {
          game_id: game.game_id,
          game_name: game.game_name,
          is_active: true,
        },
        { onConflict: 'game_id' }
      );
  }

  return uniqueGames;
}

export async function getPokemonGameIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from('pokemon_game_ids')
    .select('game_id')
    .eq('is_active', true);

  if (error) {
    console.error('Failed to fetch Pokemon game IDs:', error);
    return [];
  }

  return data?.map(g => g.game_id) || [];
}

export async function initializePokemonGames() {
  const { data: existing } = await supabase
    .from('pokemon_game_ids')
    .select('game_id')
    .limit(1);

  if (!existing || existing.length === 0) {
    console.log('Discovering Pokemon games on Twitch...');
    const games = await discoverPokemonGames();
    console.log(`Discovered ${games.length} Pokemon games`);
    return games;
  }

  return existing;
}
