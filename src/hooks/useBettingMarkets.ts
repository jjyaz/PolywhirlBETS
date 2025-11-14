import { useState, useEffect } from 'react';
import { supabase, BettingMarket, MarketOption } from '../lib/supabase';

export interface MarketWithOptions extends BettingMarket {
  options: MarketOption[];
}

export const useBettingMarkets = () => {
  const [markets, setMarkets] = useState<MarketWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = async () => {
    try {
      setLoading(true);

      const { data: marketsData, error: marketsError } = await supabase
        .from('betting_markets')
        .select('*')
        .eq('status', 'open')
        .order('event_date', { ascending: true });

      if (marketsError) throw marketsError;

      const marketsWithOptions = await Promise.all(
        (marketsData || []).map(async (market) => {
          const { data: optionsData } = await supabase
            .from('market_options')
            .select('*')
            .eq('market_id', market.id);

          return {
            ...market,
            options: optionsData || [],
          };
        })
      );

      setMarkets(marketsWithOptions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch markets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarkets();

    const channel = supabase
      .channel('betting_markets_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'betting_markets' }, () => {
        fetchMarkets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { markets, loading, error, refetch: fetchMarkets };
};
