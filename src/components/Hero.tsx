import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HeroProps {
  onCategorySelect: (category: string) => void;
}

export const Hero = ({ onCategorySelect }: HeroProps) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const categories = [
    { id: 'all', name: 'ALL MARKETS', icon: '◆' },
    { id: 'sports', name: 'SPORTS', icon: '⚽' },
    { id: 'politics', name: 'POLITICS', icon: '🏛️' },
    { id: 'entertainment', name: 'ENTERTAINMENT', icon: '🎬' },
    { id: 'crypto', name: 'CRYPTO', icon: '₿' },
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect(categoryId);
    setShowCategories(false);
  };

  return (
    <div className="relative overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center">
          <img
            src="/WhatsApp Image 2025-11-14 at 2.32.28 PM copy.png"
            alt="Polywhirl Bets"
            className="w-full max-w-2xl h-auto mb-12"
          />

          <div className="w-full border-t border-b border-gray-700 py-8 mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-gray-500" />
              <span className="text-gray-400 text-sm font-mono tracking-widest uppercase">Powered by Polymarkets</span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-gray-500" />
            </div>

            <h2 className="text-2xl md:text-3xl text-center text-white font-mono tracking-tight mb-6">
              DECENTRALIZED PREDICTION MARKETS
            </h2>

            <div className="max-w-3xl mx-auto bg-gray-900 border-2 border-gray-800 p-6 mb-6">
              <p className="text-gray-300 font-mono text-sm leading-relaxed mb-4">
                &gt; Polywhirl brings a <span className="text-white font-bold">twist</span> to prediction markets by combining the speed of Solana blockchain with a retro-futuristic aesthetic that cuts through the noise of modern betting platforms.
              </p>
              <p className="text-gray-400 font-mono text-sm leading-relaxed mb-4">
                &gt; No gimmicks. No distractions. Just <span className="text-white font-bold">pure, transparent betting</span> on real-world events — from sports to politics, entertainment to crypto.
              </p>
              <p className="text-gray-500 font-mono text-sm leading-relaxed">
                &gt; Built for those who remember when interfaces were functional, transactions were instant, and outcomes were final. Welcome to the evolution of prediction markets_
              </p>
            </div>

            <p className="text-center text-gray-400 text-base font-mono">
              &gt; Sports • Politics • Entertainment • Crypto_
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center w-full max-w-2xl">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="bg-white hover:bg-gray-200 text-black px-8 py-4 font-mono font-bold text-sm tracking-widest uppercase transition-all border-2 border-white hover:scale-105 flex items-center justify-center gap-2"
            >
              ▶ Browse Markets
              {showCategories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="bg-transparent hover:bg-white/10 text-white px-8 py-4 font-mono font-bold text-sm tracking-widest uppercase transition-all border-2 border-gray-700 hover:border-white flex items-center justify-center gap-2"
            >
              ? How Does It Work
              {showInstructions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {showCategories && (
            <div className="w-full max-w-3xl mt-8 bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 overflow-hidden animate-[slideDown_0.3s_ease-out]">
              <div className="border-b border-gray-700 bg-gray-800 px-6 py-3">
                <h3 className="font-mono text-white font-bold tracking-wide">SELECT_CATEGORY.exe</h3>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="bg-black border-2 border-gray-700 hover:border-white hover:bg-gray-900 p-6 text-left transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{category.icon}</span>
                        <div>
                          <h4 className="font-mono text-white font-bold text-sm group-hover:text-gray-200">
                            {category.name}
                          </h4>
                          <p className="font-mono text-gray-500 text-xs mt-1">
                            &gt; CLICK_TO_FILTER_
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-gray-800 pt-4 mt-6">
                  <p className="font-mono text-gray-500 text-xs text-center">
                    // SELECT_A_CATEGORY_TO_VIEW_AVAILABLE_MARKETS
                  </p>
                </div>
              </div>
            </div>
          )}

          {showInstructions && (
            <div className="w-full max-w-3xl mt-8 bg-gradient-to-b from-gray-900 to-black border-2 border-gray-700 overflow-hidden animate-[slideDown_0.3s_ease-out]">
              <div className="border-b border-gray-700 bg-gray-800 px-6 py-3">
                <h3 className="font-mono text-white font-bold tracking-wide">SYSTEM_INSTRUCTIONS.txt</h3>
              </div>

              <div className="p-6 space-y-6">
                <div className="border-l-4 border-white pl-4">
                  <h4 className="font-mono text-white font-bold mb-2 text-sm">STEP 1: CONNECT_WALLET</h4>
                  <p className="font-mono text-gray-400 text-sm leading-relaxed">
                    &gt; Click "Connect Wallet" in the top right corner. Use any Solana-compatible wallet (Phantom, Solflare, etc.). Your wallet = your account. No email, no password, no nonsense.
                  </p>
                </div>

                <div className="border-l-4 border-gray-400 pl-4">
                  <h4 className="font-mono text-white font-bold mb-2 text-sm">STEP 2: BROWSE_MARKETS</h4>
                  <p className="font-mono text-gray-400 text-sm leading-relaxed">
                    &gt; Scroll through active prediction markets. Each market shows the question, current odds, total pool size, and resolution date. Pick what you know.
                  </p>
                </div>

                <div className="border-l-4 border-gray-400 pl-4">
                  <h4 className="font-mono text-white font-bold mb-2 text-sm">STEP 3: PLACE_BET</h4>
                  <p className="font-mono text-gray-400 text-sm leading-relaxed">
                    &gt; Click a market to place your bet. Choose YES or NO. Enter your amount in SOL. Confirm the transaction in your wallet. Done. Your position is now active.
                  </p>
                </div>

                <div className="border-l-4 border-gray-400 pl-4">
                  <h4 className="font-mono text-white font-bold mb-2 text-sm">STEP 4: WAIT_RESOLVE</h4>
                  <p className="font-mono text-gray-400 text-sm leading-relaxed">
                    &gt; When the event concludes, the market resolves based on real-world outcomes. If you predicted correctly, winnings are automatically available in your profile. Claim anytime.
                  </p>
                </div>

                <div className="border-l-4 border-gray-500 pl-4">
                  <h4 className="font-mono text-white font-bold mb-2 text-sm">BONUS: TRACK_PORTFOLIO</h4>
                  <p className="font-mono text-gray-400 text-sm leading-relaxed">
                    &gt; View all your active and resolved bets in the "Your Bets" section. Track performance. Learn. Adapt. Repeat_
                  </p>
                </div>

                <div className="border-t border-gray-800 pt-4 mt-6">
                  <p className="font-mono text-gray-500 text-xs text-center">
                    // NO_KYC // INSTANT_SETTLEMENT // TRANSPARENT_ODDS // BLOCKCHAIN_VERIFIED
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
    </div>
  );
};
