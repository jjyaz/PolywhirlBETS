import { useState } from 'react';
import { WalletProvider } from './contexts/WalletContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { MarketsList } from './components/MarketsList';
import { ProfileSection } from './components/ProfileSection';
import { MyBets } from './components/MyBets';
import { AdminSettlement } from './components/AdminSettlement';

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'mybets' | 'admin'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  return (
    <WalletProvider>
      <div className="min-h-screen bg-black">
        <Navbar />

        <div className="fixed top-24 right-6 z-40 flex gap-2">
          <button
            onClick={() => setCurrentView('home')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              currentView === 'home'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Markets
          </button>
          <button
            onClick={() => setCurrentView('mybets')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              currentView === 'mybets'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            My Bets
          </button>
          <button
            onClick={() => setCurrentView('admin')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              currentView === 'admin'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => setCurrentView('profile')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              currentView === 'profile'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Profile
          </button>
        </div>

        {currentView === 'home' ? (
          <>
            <Hero onCategorySelect={setSelectedCategory} />
            <MarketsList selectedCategory={selectedCategory} />
          </>
        ) : currentView === 'mybets' ? (
          <MyBets />
        ) : currentView === 'admin' ? (
          <AdminSettlement />
        ) : (
          <ProfileSection />
        )}

        <footer className="bg-gradient-to-t from-black via-cyan-950/5 to-transparent border-t border-cyan-500/10 py-8 mt-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-gray-400 text-sm font-mono tracking-wider">
              POWERED BY POLYMARKETS
            </p>
            <p className="text-gray-600 text-xs mt-2">
              Running on Mainnet
            </p>
          </div>
        </footer>
      </div>
    </WalletProvider>
  );
}

export default App;
