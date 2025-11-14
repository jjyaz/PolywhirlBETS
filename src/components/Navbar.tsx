import { Wallet, User, TrendingUp } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { shortenAddress, formatSol } from '../lib/solana';

export const Navbar = () => {
  const { connected, publicKey, balance, connecting, connect, disconnect } = useWallet();

  return (
    <nav className="bg-black border-b-2 border-gray-800 px-6 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-gray-600 flex items-center justify-center bg-black">
            <span className="text-white font-mono text-lg font-bold">PW</span>
          </div>
          <div>
            <h1 className="text-lg font-mono font-bold text-white tracking-wider">
              POLYWHIRL_BETS
            </h1>
            <p className="text-xs text-gray-500 font-mono">v1.0 • MAINNET</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-mono text-sm">
            <TrendingUp size={16} />
            <span className="hidden sm:inline">MARKETS</span>
          </button>

          {connected && (
            <button className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 font-mono text-sm">
              <User size={16} />
              <span className="hidden sm:inline">PROFILE</span>
            </button>
          )}

          {connected ? (
            <div className="flex items-center gap-2">
              <div className="bg-gray-900 border border-gray-700 px-3 py-2">
                <div className="text-xs text-gray-500 font-mono">BAL</div>
                <div className="text-white font-mono font-bold text-sm">{formatSol(balance)}</div>
              </div>
              <button
                onClick={disconnect}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white px-4 py-2 transition-all font-mono font-bold text-xs tracking-wider flex items-center gap-2"
              >
                <Wallet size={14} />
                <span className="hidden sm:inline">
                  {publicKey ? shortenAddress(publicKey.toString()) : 'DISC'}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="bg-white hover:bg-gray-200 text-black px-6 py-2 transition-all font-mono font-bold text-xs tracking-widest flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-white"
            >
              <Wallet size={16} />
              {connecting ? 'CONNECTING...' : 'CONNECT WALLET'}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
