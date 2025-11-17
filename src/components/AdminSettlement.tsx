import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWallet } from '../contexts/WalletContext';

interface SettlementRecord {
  id: string;
  market_id: string;
  stream_title: string;
  parsed_winner: string | null;
  confidence_score: number;
  settlement_status: string;
  created_at: string;
  betting_markets: {
    title: string;
    player_one: string | null;
    player_two: string | null;
    twitch_channel_name: string | null;
  };
}

export const AdminSettlement = () => {
  const [settlements, setSettlements] = useState<SettlementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { publicKey } = useWallet();

  useEffect(() => {
    if (publicKey) {
      fetchPendingSettlements();
    }
  }, [publicKey]);

  const fetchPendingSettlements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('market_auto_settlement')
        .select(`
          *,
          betting_markets (
            title,
            player_one,
            player_two,
            twitch_channel_name
          )
        `)
        .in('settlement_status', ['needs_review', 'needs_manual_review'])
        .is('settled_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSettlements(data || []);
    } catch (error) {
      console.error('Failed to fetch settlements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async (settlementId: string, marketId: string, winner: string) => {
    try {
      await supabase
        .from('betting_markets')
        .update({
          status: 'resolved',
          outcome: winner,
        })
        .eq('id', marketId);

      await supabase
        .from('market_auto_settlement')
        .update({
          settled_at: new Date().toISOString(),
          settlement_status: 'settled',
          parsed_winner: winner,
        })
        .eq('id', settlementId);

      fetchPendingSettlements();
    } catch (error) {
      console.error('Failed to settle market:', error);
    }
  };

  const handleReject = async (settlementId: string) => {
    try {
      await supabase
        .from('market_auto_settlement')
        .update({
          settlement_status: 'rejected',
        })
        .eq('id', settlementId);

      fetchPendingSettlements();
    } catch (error) {
      console.error('Failed to reject settlement:', error);
    }
  };

  if (!publicKey) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gray-900 border-2 border-gray-700 p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
          <h3 className="text-xl font-mono font-bold text-white mb-2">CONNECT_WALLET_REQUIRED</h3>
          <p className="text-gray-400 font-mono text-sm">
            &gt; Please connect your wallet to access the admin interface_
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-cyan-500" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-black">
      <div className="mb-12 border-b-2 border-gray-900 pb-6">
        <h2 className="text-3xl font-mono font-bold text-white mb-2 tracking-wider uppercase">
          Admin Settlement Review
        </h2>
        <p className="text-gray-500 font-mono text-sm">&gt; REVIEW_AND_SETTLE_PENDING_MARKETS</p>
      </div>

      {settlements.length === 0 ? (
        <div className="bg-gray-900 border-2 border-gray-700 p-12 text-center">
          <CheckCircle className="mx-auto mb-4 text-green-500" size={64} />
          <h3 className="text-2xl font-mono font-bold text-white mb-2">ALL_CAUGHT_UP</h3>
          <p className="text-gray-400 font-mono text-sm">
            &gt; No pending settlements require review_
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {settlements.map((settlement) => {
            const market = settlement.betting_markets;
            const confidenceColor =
              settlement.confidence_score >= 80
                ? 'text-green-400'
                : settlement.confidence_score >= 60
                ? 'text-yellow-400'
                : 'text-red-400';

            return (
              <div
                key={settlement.id}
                className="bg-gray-900 border-2 border-gray-700 hover:border-cyan-600 transition-all p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-mono font-bold text-white mb-2">
                      {market.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm font-mono text-gray-400 mb-2">
                      {market.twitch_channel_name && (
                        <span>&gt; Channel: {market.twitch_channel_name}</span>
                      )}
                      <span>&gt; {new Date(settlement.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={`text-2xl font-mono font-bold ${confidenceColor}`}>
                    {settlement.confidence_score.toFixed(0)}%
                  </div>
                </div>

                <div className="bg-black border border-gray-800 p-4 mb-4">
                  <p className="text-gray-500 font-mono text-xs mb-2">STREAM_TITLE:</p>
                  <p className="text-white font-mono text-sm">{settlement.stream_title}</p>
                </div>

                {settlement.parsed_winner && (
                  <div className="bg-cyan-900/20 border border-cyan-700 p-4 mb-4">
                    <p className="text-cyan-400 font-mono text-xs mb-2">DETECTED_WINNER:</p>
                    <p className="text-cyan-300 font-mono text-lg font-bold">
                      {settlement.parsed_winner}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {market.player_one && (
                    <button
                      onClick={() =>
                        handleSettle(settlement.id, settlement.market_id, market.player_one!)
                      }
                      className="flex-1 bg-green-600 hover:bg-green-500 border-2 border-green-400 text-white px-6 py-3 font-mono font-bold text-sm uppercase transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      {market.player_one} Wins
                    </button>
                  )}
                  {market.player_two && (
                    <button
                      onClick={() =>
                        handleSettle(settlement.id, settlement.market_id, market.player_two!)
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-500 border-2 border-blue-400 text-white px-6 py-3 font-mono font-bold text-sm uppercase transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      {market.player_two} Wins
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(settlement.id)}
                    className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 text-gray-300 px-6 py-3 font-mono font-bold text-sm uppercase transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
