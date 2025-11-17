import { useState } from 'react';
import { Calendar, TrendingUp, Eye, Tv } from 'lucide-react';
import { MarketWithOptions } from '../hooks/useBettingMarkets';
import { BinaryBet } from './BinaryBet';
import { useWallet } from '../contexts/WalletContext';
import { useUser } from '../hooks/useUser';

interface LiveStreamMarketCardProps {
  market: MarketWithOptions;
}

export const LiveStreamMarketCard = ({ market }: LiveStreamMarketCardProps) => {
  const [showStream, setShowStream] = useState(false);
  const { publicKey } = useWallet();
  const { user } = useUser(publicKey);

  const eventDate = market.event_date ? new Date(market.event_date) : null;
  const yesOption = market.options.find(opt =>
    opt.option_name.toLowerCase().includes('yes') ||
    opt.option_name === market.player_one
  ) || market.options[0];
  const noOption = market.options.find(opt =>
    opt.option_name.toLowerCase().includes('no') ||
    opt.option_name === market.player_two
  ) || market.options[1];

  return (
    <div className="bg-black border-2 border-cyan-600/50 transition-all group relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-cyan-500 to-red-500 animate-pulse" />

      <div
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: market.image_url ? `url(${market.image_url})` : 'none' }}
      />

      <div className="relative p-6 retro-scanline">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="inline-block bg-red-600 border border-red-400 text-white text-xs font-mono font-bold px-3 py-1 tracking-wider uppercase animate-pulse">
                LIVE
              </div>
              <div className="inline-block bg-gray-900 border border-cyan-700 text-cyan-400 text-xs font-mono font-bold px-3 py-1 tracking-wider uppercase">
                [{market.category}]
              </div>
            </div>
            <h3 className="text-lg font-mono font-bold text-white group-hover:text-cyan-300 transition-colors uppercase tracking-tight">
              {market.title}
            </h3>
          </div>
          <TrendingUp className="text-cyan-600" size={20} />
        </div>

        {market.description && (
          <p className="text-gray-400 text-sm font-mono mb-4 leading-relaxed">
            {market.description}
          </p>
        )}

        <div className="flex items-center gap-4 mb-4">
          {eventDate && (
            <div className="flex items-center gap-2 text-gray-500 text-xs font-mono border-l-2 border-cyan-800 pl-3">
              <Calendar size={14} />
              <span>{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}

          {market.viewer_count !== undefined && market.viewer_count > 0 && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono border-l-2 border-cyan-800 pl-3">
              <Eye size={14} />
              <span>{market.viewer_count.toLocaleString()} watching</span>
            </div>
          )}

          {market.twitch_channel_name && (
            <div className="flex items-center gap-2 text-purple-400 text-xs font-mono border-l-2 border-purple-800 pl-3">
              <Tv size={14} />
              <span>{market.twitch_channel_name}</span>
            </div>
          )}
        </div>

        {market.stream_embed_url && (
          <button
            onClick={() => setShowStream(!showStream)}
            className="w-full bg-gray-900 hover:bg-gray-800 border border-cyan-600 hover:border-cyan-400 p-3 mb-4 transition-all font-mono text-sm text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wide"
          >
            {showStream ? '▼ HIDE STREAM' : '▶ WATCH LIVE STREAM'}
          </button>
        )}

        {showStream && market.stream_embed_url && (
          <div className="mb-4 border-2 border-cyan-600">
            <iframe
              src={market.stream_embed_url}
              height="400"
              width="100%"
              allowFullScreen
              className="w-full"
              title={`${market.twitch_channel_name} Twitch Stream`}
            />
          </div>
        )}

        <BinaryBet
          marketId={market.id}
          yesOptionId={yesOption.id}
          noOptionId={noOption.id}
          yesOdds={market.yes_odds}
          noOdds={market.no_odds}
          eventName={market.title}
          userId={user?.id || null}
        />
      </div>
    </div>
  );
};
