import { createTwitchClient, TwitchStream } from '../lib/twitch';
import { supabase } from '../lib/supabase';
import { getPokemonGameIds } from './pokemonGameDiscovery';
import { detectBattleFromTitle, shouldCreateMarket } from './battleDetection';

export async function monitorPokemonStreams() {
  try {
    const twitchClient = createTwitchClient();
    const gameIds = await getPokemonGameIds();

    if (gameIds.length === 0) {
      console.log('No Pokemon game IDs found');
      return;
    }

    const streams = await twitchClient.getStreams(gameIds, undefined, 100);

    console.log(`Found ${streams.length} live Pokemon streams`);

    for (const stream of streams) {
      await processStream(stream);
    }

    await markOfflineStreams(streams);
  } catch (error) {
    console.error('Error monitoring streams:', error);
  }
}

async function processStream(stream: TwitchStream) {
  const { data: existing } = await supabase
    .from('twitch_stream_sessions')
    .select('id, title, is_live')
    .eq('stream_id', stream.id)
    .maybeSingle();

  const thumbnailUrl = stream.thumbnail_url
    .replace('{width}', '1920')
    .replace('{height}', '1080');

  if (existing) {
    if (existing.title !== stream.title || !existing.is_live) {
      await supabase
        .from('twitch_stream_sessions')
        .update({
          title: stream.title,
          viewer_count: stream.viewer_count,
          thumbnail_url: thumbnailUrl,
          is_live: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (existing.title !== stream.title) {
        console.log(`Stream title changed: ${stream.title}`);
        await checkForBattleUpdate(existing.id, stream.title);
      }
    }

    await updateMarketViewerCount(existing.id, stream.viewer_count);
  } else {
    const { data: newSession } = await supabase
      .from('twitch_stream_sessions')
      .insert({
        stream_id: stream.id,
        channel_name: stream.user_login,
        user_id: stream.user_id,
        game_id: stream.game_id,
        game_name: stream.game_name,
        title: stream.title,
        viewer_count: stream.viewer_count,
        thumbnail_url: thumbnailUrl,
        started_at: stream.started_at,
        is_live: true,
      })
      .select()
      .single();

    if (newSession) {
      console.log(`New stream detected: ${stream.user_login} - ${stream.title}`);
      await checkForBattle(newSession.id, stream);
    }
  }
}

async function checkForBattle(sessionId: string, stream: TwitchStream) {
  const detection = detectBattleFromTitle(stream.title);

  if (detection) {
    await supabase.from('battle_detection_logs').insert({
      stream_session_id: sessionId,
      raw_title: stream.title,
      detected_player_one: detection.playerOne,
      detected_player_two: detection.playerTwo,
      detection_pattern: detection.pattern,
      confidence_score: detection.confidence,
    });

    if (shouldCreateMarket(detection)) {
      await createBattleMarket(sessionId, stream, detection);
    }
  }
}

async function checkForBattleUpdate(sessionId: string, newTitle: string) {
  const { data: existingMarket } = await supabase
    .from('betting_markets')
    .select('id, player_one, player_two')
    .eq('twitch_stream_id', sessionId)
    .eq('status', 'open')
    .maybeSingle();

  if (existingMarket && existingMarket.player_one && existingMarket.player_two) {
    const { detectWinnerFromTitle } = await import('./battleDetection');
    const winnerDetection = detectWinnerFromTitle(
      newTitle,
      existingMarket.player_one,
      existingMarket.player_two
    );

    if (winnerDetection && winnerDetection.winner) {
      await supabase.from('market_auto_settlement').insert({
        market_id: existingMarket.id,
        stream_session_id: sessionId,
        stream_title: newTitle,
        parsed_winner: winnerDetection.winner,
        confidence_score: winnerDetection.confidence,
        settlement_status: winnerDetection.confidence >= 90 ? 'auto_settle' : 'needs_review',
      });

      console.log(`Winner detected: ${winnerDetection.winner} (confidence: ${winnerDetection.confidence})`);
    }
  }
}

async function createBattleMarket(
  sessionId: string,
  stream: TwitchStream,
  detection: { playerOne: string | null; playerTwo: string | null; confidence: number }
) {
  if (!detection.playerOne || !detection.playerTwo) return;

  const { data: existingMarket } = await supabase
    .from('betting_markets')
    .select('id')
    .eq('twitch_stream_id', sessionId)
    .maybeSingle();

  if (existingMarket) {
    console.log('Market already exists for this stream');
    return;
  }

  const marketTitle = `Pokemon Battle: ${detection.playerOne} vs ${detection.playerTwo}`;
  const streamEmbedUrl = `https://player.twitch.tv/?channel=${stream.user_login}&parent=${window.location.hostname}`;

  const { data: market, error: marketError } = await supabase
    .from('betting_markets')
    .insert({
      title: marketTitle,
      category: 'pokemon',
      description: `Live Pokemon battle on ${stream.user_login}'s stream`,
      event_date: new Date().toISOString(),
      status: 'open',
      market_type: 'binary',
      yes_odds: 1.5,
      no_odds: 1.5,
      total_volume: 0,
      liquidity: 100,
      image_url: stream.thumbnail_url.replace('{width}', '1920').replace('{height}', '1080'),
      twitch_stream_id: sessionId,
      twitch_channel_name: stream.user_login,
      is_live_stream: true,
      stream_embed_url: streamEmbedUrl,
      player_one: detection.playerOne,
      player_two: detection.playerTwo,
      viewer_count: stream.viewer_count,
    })
    .select()
    .single();

  if (marketError) {
    console.error('Failed to create market:', marketError);
    return;
  }

  if (market) {
    await supabase.from('market_options').insert([
      {
        market_id: market.id,
        option_name: detection.playerOne,
        odds: 1.5,
        total_pool: 0,
      },
      {
        market_id: market.id,
        option_name: detection.playerTwo,
        odds: 1.5,
        total_pool: 0,
      },
    ]);

    console.log(`Created market: ${marketTitle}`);
  }
}

async function updateMarketViewerCount(sessionId: string, viewerCount: number) {
  await supabase
    .from('betting_markets')
    .update({ viewer_count: viewerCount })
    .eq('twitch_stream_id', sessionId)
    .eq('status', 'open');
}

async function markOfflineStreams(liveStreams: TwitchStream[]) {
  const liveStreamIds = liveStreams.map(s => s.id);

  const { data: activeSessions } = await supabase
    .from('twitch_stream_sessions')
    .select('id, stream_id, title')
    .eq('is_live', true);

  if (activeSessions) {
    for (const session of activeSessions) {
      if (!liveStreamIds.includes(session.stream_id)) {
        await supabase
          .from('twitch_stream_sessions')
          .update({
            is_live: false,
            ended_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', session.id);

        console.log(`Stream went offline: ${session.stream_id}`);

        await handleStreamEnd(session.id, session.title);
      }
    }
  }
}

async function handleStreamEnd(sessionId: string, finalTitle: string) {
  const { data: market } = await supabase
    .from('betting_markets')
    .select('id, player_one, player_two, status')
    .eq('twitch_stream_id', sessionId)
    .eq('status', 'open')
    .maybeSingle();

  if (market && market.player_one && market.player_two) {
    const { detectWinnerFromTitle } = await import('./battleDetection');
    const winnerDetection = detectWinnerFromTitle(
      finalTitle,
      market.player_one,
      market.player_two
    );

    if (winnerDetection && winnerDetection.winner) {
      await supabase.from('market_auto_settlement').insert({
        market_id: market.id,
        stream_session_id: sessionId,
        stream_title: finalTitle,
        parsed_winner: winnerDetection.winner,
        confidence_score: winnerDetection.confidence,
        settlement_status: winnerDetection.confidence >= 90 ? 'auto_settle' : 'needs_review',
      });
    } else {
      await supabase.from('market_auto_settlement').insert({
        market_id: market.id,
        stream_session_id: sessionId,
        stream_title: finalTitle,
        parsed_winner: null,
        confidence_score: 0,
        settlement_status: 'needs_manual_review',
      });
    }
  }
}
