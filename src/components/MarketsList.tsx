import { useBettingMarkets } from '../hooks/useBettingMarkets';
import { BettingMarketCard } from './BettingMarketCard';
import { Loader2 } from 'lucide-react';

interface MarketsListProps {
  selectedCategory: string;
}

export const MarketsList = ({ selectedCategory }: MarketsListProps) => {
  const { markets, loading, error } = useBettingMarkets();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-gray-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-mono text-lg">&gt; ERROR: {error}</p>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 font-mono text-lg">&gt; NO_ACTIVE_MARKETS</p>
        <p className="text-gray-600 font-mono text-sm mt-2">CHECK_BACK_SOON_</p>
      </div>
    );
  }

  const filteredMarkets = selectedCategory === 'all'
    ? markets
    : markets.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filteredMarkets.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 font-mono text-lg">&gt; NO_MARKETS_IN_THIS_CATEGORY</p>
        <p className="text-gray-600 font-mono text-sm mt-2">TRY_ANOTHER_CATEGORY_</p>
      </div>
    );
  }

  const categories = Array.from(new Set(filteredMarkets.map((m) => m.category)));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-black">
      <div className="mb-12 border-b-2 border-gray-900 pb-6">
        <h2 className="text-3xl font-mono font-bold text-white mb-2 tracking-wider uppercase">
          {selectedCategory === 'all' ? 'Active Markets' : `${selectedCategory.toUpperCase()} Markets`}
        </h2>
        <p className="text-gray-500 font-mono text-sm">&gt; PLACE_YOUR_BETS_ON_REAL_WORLD_EVENTS</p>
      </div>

      {categories.map((category) => {
        const categoryMarkets = filteredMarkets.filter((m) => m.category === category);

        return (
          <div key={category} className="mb-12">
            <div className="flex items-center gap-4 mb-6 border-l-4 border-gray-700 pl-4">
              <h3 className="text-2xl font-mono font-bold text-white uppercase tracking-wide">{category}</h3>
              <span className="text-gray-600 font-mono text-sm border border-gray-800 px-2 py-1">[{categoryMarkets.length}]</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryMarkets.map((market) => (
                <BettingMarketCard key={market.id} market={market} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
