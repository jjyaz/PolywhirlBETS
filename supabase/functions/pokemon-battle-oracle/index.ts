import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TwitchAuthResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
}

interface TwitchStreamsResponse {
  data: TwitchStream[];
  pagination?: {
    cursor?: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const twitchClientId = Deno.env.get("TWITCH_CLIENT_ID");
    const twitchClientSecret = Deno.env.get("TWITCH_CLIENT_SECRET");

    if (!twitchClientId || !twitchClientSecret) {
      throw new Error("Twitch credentials not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "monitor") {
      const tokenResponse = await fetch("https://id.twitch.tv/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: twitchClientId,
          client_secret: twitchClientSecret,
          grant_type: "client_credentials",
        }).toString(),
      });

      const tokenData: TwitchAuthResponse = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      const { data: gameIds } = await supabase
        .from("pokemon_game_ids")
        .select("game_id, game_category")
        .eq("is_active", true);

      if (!gameIds || gameIds.length === 0) {
        return new Response(
          JSON.stringify({ message: "No game IDs found" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      const gameCategoryMap = new Map<string, string>();
      gameIds.forEach((g: any) => {
        if (g.game_category) {
          gameCategoryMap.set(g.game_id, g.game_category);
        }
      });

      const gameIdParams = gameIds.map((g: any) => `game_id=${g.game_id}`).join("&");
      const streamsUrl = `https://api.twitch.tv/helix/streams?${gameIdParams}&first=100`;

      const streamsResponse = await fetch(streamsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Client-Id": twitchClientId,
        },
      });

      const streamsData: TwitchStreamsResponse = await streamsResponse.json();
      const streams = streamsData.data;

      const liveStreamIds = streams.map((s) => s.id);

      const { data: activeSessions } = await supabase
        .from("twitch_stream_sessions")
        .select("id, stream_id")
        .eq("is_live", true);

      if (activeSessions) {
        for (const session of activeSessions) {
          if (!liveStreamIds.includes(session.stream_id)) {
            await supabase
              .from("twitch_stream_sessions")
              .update({
                is_live: false,
                ended_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq("id", session.id);
          }
        }
      }

      for (const stream of streams) {
        const { data: existing } = await supabase
          .from("twitch_stream_sessions")
          .select("id")
          .eq("stream_id", stream.id)
          .maybeSingle();

        const thumbnailUrl = stream.thumbnail_url
          .replace("{width}", "1920")
          .replace("{height}", "1080");

        if (existing) {
          await supabase
            .from("twitch_stream_sessions")
            .update({
              title: stream.title,
              viewer_count: stream.viewer_count,
              thumbnail_url: thumbnailUrl,
              is_live: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("twitch_stream_sessions").insert({
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
          });
        }
      }

      return new Response(
        JSON.stringify({
          message: "Stream monitoring complete",
          streamsFound: streams.length,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (action === "settle") {
      const { data: pendingSettlements } = await supabase
        .from("market_auto_settlement")
        .select("*, betting_markets(*)")
        .eq("settlement_status", "auto_settle")
        .is("settled_at", null);

      if (!pendingSettlements || pendingSettlements.length === 0) {
        return new Response(
          JSON.stringify({ message: "No pending settlements" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }

      for (const settlement of pendingSettlements) {
        await supabase
          .from("betting_markets")
          .update({
            status: "resolved",
            outcome: settlement.parsed_winner,
          })
          .eq("id", settlement.market_id);

        await supabase
          .from("market_auto_settlement")
          .update({
            settled_at: new Date().toISOString(),
            settlement_status: "settled",
          })
          .eq("id", settlement.id);
      }

      return new Response(
        JSON.stringify({
          message: "Settlement complete",
          settled: pendingSettlements.length,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action parameter" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});