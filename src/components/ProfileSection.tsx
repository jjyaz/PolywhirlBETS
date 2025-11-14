import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, History, Loader2 } from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { supabase, Bet, BettingMarket, MarketOption } from '../lib/supabase';
import { formatSol } from '../lib/solana';
import { ProfileEdit } from './ProfileEdit';

interface BetWithDetails extends Bet {
  market: BettingMarket;
  option: MarketOption;
}

export const ProfileSection = () => {
  const { user, loading: userLoading, updateProfile } = useUser();
  const [bets, setBets] = useState<BetWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBets = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: betsData } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (betsData) {
        const betsWithDetails = await Promise.all(
          betsData.map(async (bet) => {
            const [{ data: market }, { data: option }] = await Promise.all([
              supabase.from('betting_markets').select('*').eq('id', bet.market_id).single(),
              supabase.from('market_options').select('*').eq('id', bet.option_id).single(),
            ]);

            return { ...bet, market, option } as BetWithDetails;
          })
        );

        setBets(betsWithDetails);
      }

      setLoading(false);
    };

    fetchBets();
  }, [user]);

  if (userLoading || loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-400 text-lg">Connect your wallet to view your profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-12">
        <ProfileEdit user={user} onUpdate={updateProfile} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-cyan-500/20 p-3 rounded-lg">
              <TrendingUp className="text-cyan-400" size={24} />
            </div>
            <span className="text-gray-400">Total Bets</span>
          </div>
          <div className="text-3xl font-black text-white">{user.total_bets}</div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Trophy className="text-green-400" size={24} />
            </div>
            <span className="text-gray-400">Total Winnings</span>
          </div>
          <div className="text-3xl font-black text-white">{formatSol(user.total_winnings)}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <History className="text-purple-400" size={24} />
            </div>
            <span className="text-gray-400">Win Rate</span>
          </div>
          <div className="text-3xl font-black text-white">
            {user.total_bets > 0 ? ((bets.filter((b) => b.status === 'won').length / user.total_bets) * 100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-white mb-6">Recent Bets</h3>

        {bets.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No bets yet. Start betting to see your history!</p>
        ) : (
          <div className="space-y-4">
            {bets.map((bet) => (
              <div
                key={bet.id}
                className="bg-black/50 border border-cyan-500/10 rounded-lg p-4 hover:border-cyan-500/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-white font-semibold">{bet.market?.title}</h4>
                    <p className="text-cyan-400 text-sm">{bet.option?.option_name}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      bet.status === 'won'
                        ? 'bg-green-500/20 text-green-400'
                        : bet.status === 'lost'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {bet.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Bet: {formatSol(bet.amount)}</span>
                  <span className="text-gray-400">
                    Potential: {formatSol(bet.potential_payout)}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(bet.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
