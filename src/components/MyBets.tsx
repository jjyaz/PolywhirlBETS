import { ExternalLink, TrendingUp, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useMyBets } from '../hooks/useMyBets';
import { formatSol } from '../lib/solana';

export const MyBets = () => {
  const { bets, loading, error } = useMyBets();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'won':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'lost':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'text-green-400';
      case 'lost':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Loading your bets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (bets.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Bets Yet</h2>
          <p className="text-gray-400">
            Place your first bet to see it here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          My Bets
        </h1>
        <p className="text-gray-400 mt-2">
          Track all your betting activity
        </p>
      </div>

      <div className="space-y-4">
        {bets.map((bet) => (
          <div
            key={bet.id}
            className="bg-gradient-to-br from-gray-900 to-gray-800 border border-cyan-500/20 rounded-xl p-6 hover:border-cyan-500/40 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(bet.status)}
                  <h3 className="text-xl font-bold text-white">
                    {bet.market_title || 'Unknown Market'}
                  </h3>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-medium">
                    {bet.option_name || 'Unknown Option'}
                  </span>
                  <span className={`text-sm font-semibold uppercase ${getStatusColor(bet.status)}`}>
                    {bet.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Bet Amount</p>
                    <p className="text-white font-semibold">{formatSol(bet.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Potential Payout</p>
                    <p className="text-green-400 font-semibold">{formatSol(bet.potential_payout)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Placed On</p>
                    <p className="text-white font-medium">
                      {new Date(bet.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Market Status</p>
                    <p className="text-white font-medium capitalize">
                      {bet.market_status || 'active'}
                    </p>
                  </div>
                </div>
              </div>

              {bet.transaction_signature && (
                <a
                  href={`https://solscan.io/tx/${bet.transaction_signature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-cyan-500/50 rounded-lg transition-all group"
                  title="View on Solscan"
                >
                  <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
