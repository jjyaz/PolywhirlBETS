import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../contexts/WalletContext';

export interface BetWithDetails {
  id: string;
  market_id: string;
  option_id: string;
  amount: number;
  potential_payout: number;
  status: string;
  transaction_signature: string | null;
  created_at: string;
  market_title?: string;
  option_name?: string;
  market_status?: string;
}

export const useMyBets = () => {
  const { publicKey } = useWallet();
  const [bets, setBets] = useState<BetWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBets = async () => {
      if (!publicKey) {
        setBets([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('wallet_address', publicKey.toString())
          .maybeSingle();

        if (userError) throw userError;
        if (!userData) {
          setBets([]);
          setLoading(false);
          return;
        }

        const { data: betsData, error: betsError } = await supabase
          .from('bets')
          .select(`
            id,
            market_id,
            option_id,
            amount,
            potential_payout,
            status,
            transaction_signature,
            created_at
          `)
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false });

        if (betsError) throw betsError;

        if (betsData && betsData.length > 0) {
          const marketIds = [...new Set(betsData.map(bet => bet.market_id))];
          const optionIds = [...new Set(betsData.map(bet => bet.option_id))];

          const { data: marketsData } = await supabase
            .from('betting_markets')
            .select('id, title, status')
            .in('id', marketIds);

          const { data: optionsData } = await supabase
            .from('market_options')
            .select('id, option_name')
            .in('id', optionIds);

          const marketsMap = new Map(marketsData?.map(m => [m.id, m]) || []);
          const optionsMap = new Map(optionsData?.map(o => [o.id, o]) || []);

          const enrichedBets = betsData.map(bet => ({
            ...bet,
            market_title: marketsMap.get(bet.market_id)?.title,
            option_name: optionsMap.get(bet.option_id)?.option_name,
            market_status: marketsMap.get(bet.market_id)?.status,
          }));

          setBets(enrichedBets);
        } else {
          setBets([]);
        }
      } catch (err) {
        console.error('Error fetching bets:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bets');
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [publicKey]);

  return { bets, loading, error };
};
