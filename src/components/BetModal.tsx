import { useState } from 'react';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { MarketWithOptions } from '../hooks/useBettingMarkets';
import { usePlaceBet } from '../hooks/usePlaceBet';
import { useUser } from '../hooks/useUser';
import { useWallet } from '../contexts/WalletContext';
import { formatSol } from '../lib/solana';
import { BetSuccessNotification } from './BetSuccessNotification';

interface BetModalProps {
  market: MarketWithOptions;
  optionId: string;
  onClose: () => void;
}

export const BetModal = ({ market, optionId, onClose }: BetModalProps) => {
  const { connected } = useWallet();
  const { user, loading: userLoading } = useUser();
  const { placeBet, placing, error } = usePlaceBet();
  const [amount, setAmount] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedOption = market.options.find((opt) => opt.id === optionId);

  if (!selectedOption) return null;

  const potentialPayout = amount ? parseFloat(amount) * selectedOption.odds : 0;

  const handlePlaceBet = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!user) {
      alert('Loading user data, please try again in a moment');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid bet amount');
      return;
    }

    const success = await placeBet(market.id, optionId, parseFloat(amount), user.id);

    if (success) {
      setSuccess(true);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-black border-4 border-gray-700 max-w-md w-full p-8 animate-scaleIn retro-scanline">
          {!success && (
          <>
            <div className="flex justify-between items-start mb-6 border-b-2 border-gray-800 pb-4">
              <div>
                <h2 className="text-xl font-mono font-bold text-white mb-2 tracking-wider uppercase">Place Bet</h2>
                <p className="text-gray-500 text-xs font-mono">{market.title}</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-white transition-colors border border-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-gray-900 border-2 border-gray-700 p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-xs font-mono uppercase">Selection</span>
                <span className="text-white font-mono font-bold">{selectedOption.odds.toFixed(2)}x</span>
              </div>
              <p className="text-white font-mono font-bold uppercase text-sm">&gt; {selectedOption.option_name}</p>
            </div>

            <div className="mb-6">
              <label className="text-gray-500 text-xs font-mono mb-2 block uppercase tracking-wider">Amount (SOL)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-900 border-2 border-gray-700 px-4 py-3 text-white font-mono text-lg focus:border-white focus:outline-none transition-colors"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-mono font-bold">
                  ◎
                </span>
              </div>
            </div>

            <div className="bg-gray-900 border-2 border-gray-700 p-4 mb-6">
              <div className="flex justify-between mb-3 font-mono">
                <span className="text-gray-500 text-sm uppercase">Payout</span>
                <span className="text-white font-bold">{formatSol(potentialPayout)}</span>
              </div>
              <div className="flex justify-between font-mono">
                <span className="text-gray-500 text-sm uppercase">Profit</span>
                <span className="text-white font-bold">
                  {formatSol(potentialPayout - (parseFloat(amount) || 0))}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 flex items-start gap-2">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              onClick={handlePlaceBet}
              disabled={placing || !connected || userLoading || !user}
              className="w-full bg-white hover:bg-gray-200 text-black py-4 font-mono font-bold text-sm tracking-widest uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white"
            >
              {placing ? 'Placing Bet...' : !connected ? 'Connect Wallet First' : userLoading ? 'Loading...' : 'Confirm Bet'}
            </button>
          </>
          )}
        </div>
      </div>

      <BetSuccessNotification
        show={success}
        onClose={() => {
          setSuccess(false);
          onClose();
        }}
      />
    </>
  );
};
