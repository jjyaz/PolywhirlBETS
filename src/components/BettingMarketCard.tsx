import { useState } from 'react';
import { Calendar, TrendingUp } from 'lucide-react';
import { MarketWithOptions } from '../hooks/useBettingMarkets';
import { BetModal } from './BetModal';

interface BettingMarketCardProps {
  market: MarketWithOptions;
}

export const BettingMarketCard = ({ market }: BettingMarketCardProps) => {
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleBetClick = (optionId: string) => {
    setSelectedOption(optionId);
    setShowBetModal(true);
  };

  const eventDate = market.event_date ? new Date(market.event_date) : null;

  return (
    <>
      <div className="bg-black border-2 border-gray-800 hover:border-gray-600 transition-all p-6 retro-scanline group">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="inline-block bg-gray-900 border border-gray-700 text-gray-400 text-xs font-mono font-bold px-3 py-1 mb-3 tracking-wider uppercase">
              [{market.category}]
            </div>
            <h3 className="text-lg font-mono font-bold text-white group-hover:text-gray-300 transition-colors uppercase tracking-tight">
              {market.title}
            </h3>
          </div>
          <TrendingUp className="text-gray-600" size={20} />
        </div>

        {market.description && (
          <p className="text-gray-500 text-sm font-mono mb-4 leading-relaxed">{market.description}</p>
        )}

        {eventDate && (
          <div className="flex items-center gap-2 text-gray-600 text-xs font-mono mb-4 border-l-2 border-gray-800 pl-3">
            <Calendar size={14} />
            <span>{eventDate.toLocaleDateString()} • {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}

        <div className="space-y-2">
          {market.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleBetClick(option.id)}
              className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-600 p-4 transition-all group/option"
            >
              <div className="flex justify-between items-center">
                <span className="text-white font-mono font-bold text-sm group-hover/option:text-gray-300 transition-colors uppercase tracking-wide">
                  &gt; {option.option_name}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-white font-mono font-bold text-base">
                    {option.odds.toFixed(2)}x
                  </span>
                  <div className="bg-black border border-gray-700 px-3 py-1">
                    <span className="text-xs text-gray-500 font-mono">
                      ◎{option.total_pool.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {showBetModal && selectedOption && (
        <BetModal
          market={market}
          optionId={selectedOption}
          onClose={() => {
            setShowBetModal(false);
            setSelectedOption(null);
          }}
        />
      )}
    </>
  );
};
