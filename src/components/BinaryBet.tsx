import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { usePlaceBet } from '../hooks/usePlaceBet';

interface BinaryBetProps {
  marketId: string;
  yesOptionId: string;
  noOptionId: string;
  yesOdds: number;
  noOdds: number;
  eventName: string;
  userId: string | null;
  onBetPlaced?: () => void;
}

export const BinaryBet = ({
  marketId,
  yesOptionId,
  noOptionId,
  yesOdds,
  noOdds,
  eventName,
  userId,
  onBetPlaced
}: BinaryBetProps) => {
  const { publicKey, balance } = useWallet();
  const { placeBet, placing, error } = usePlaceBet();
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no' | null>(null);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const min = 0.1;
    const max = Math.min(2, balance * 0.1);
    const randomAmount = Math.round((Math.random() * (max - min) + min) * 10) / 10;
    setBetAmount(Math.max(0.1, randomAmount));
  }, [balance]);

  const handlePlaceBet = async () => {
    if (!publicKey || !selectedSide || !userId) return;

    const optionId = selectedSide === 'yes' ? yesOptionId : noOptionId;
    const success = await placeBet(marketId, optionId, betAmount, userId);

    if (success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedSide(null);
      }, 2000);
      onBetPlaced?.();
    }
  };

  const potentialPayout = selectedSide === 'yes'
    ? betAmount * (100 / yesOdds)
    : betAmount * (100 / noOdds);

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-cyan-500/20 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">{eventName}</h3>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setSelectedSide('yes')}
          disabled={placing}
          className={`relative overflow-hidden py-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
            selectedSide === 'yes'
              ? 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-lg shadow-green-500/50'
              : 'bg-gradient-to-br from-green-900/50 to-green-800/50 text-green-300 hover:from-green-800/70 hover:to-green-700/70'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            <span>YES</span>
            <span className="text-2xl">{yesOdds}%</span>
          </div>
          {selectedSide === 'yes' && (
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setSelectedSide('no')}
          disabled={placing}
          className={`relative overflow-hidden py-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
            selectedSide === 'no'
              ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg shadow-red-500/50'
              : 'bg-gradient-to-br from-red-900/50 to-red-800/50 text-red-300 hover:from-red-800/70 hover:to-red-700/70'
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <TrendingDown className="w-6 h-6" />
            <span>NO</span>
            <span className="text-2xl">{noOdds}%</span>
          </div>
          {selectedSide === 'no' && (
            <div className="absolute inset-0 bg-white/10 animate-pulse" />
          )}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-400 text-sm mb-2">Bet Amount (SOL)</label>
          <input
            type="number"
            value={betAmount}
            onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
            min={0.01}
            step={0.01}
            max={balance}
            disabled={placing}
            className="w-full bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:border-cyan-500 focus:outline-none transition-colors"
            placeholder="Enter amount"
          />
          <p className="text-xs text-gray-500 mt-1">
            Suggested: {betAmount.toFixed(2)} SOL • Balance: {balance.toFixed(4)} SOL
          </p>
        </div>

        {selectedSide && (
          <div className="bg-gray-800/50 border border-cyan-500/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Potential Payout:</span>
              <span className="text-xl font-bold text-green-400">
                ◎{potentialPayout.toFixed(4)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2 text-sm">
              <span className="text-gray-500">Profit:</span>
              <span className="text-green-400">
                +◎{(potentialPayout - betAmount).toFixed(4)}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {showSuccess && (
          <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm animate-pulse">
            Bet placed successfully!
          </div>
        )}

        <button
          onClick={handlePlaceBet}
          disabled={!selectedSide || placing || betAmount <= 0 || betAmount > balance || !publicKey || !userId}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
        >
          {!publicKey ? 'Connect Wallet' : placing ? 'Placing Bet...' : 'Confirm Bet'}
        </button>
      </div>
    </div>
  );
};
