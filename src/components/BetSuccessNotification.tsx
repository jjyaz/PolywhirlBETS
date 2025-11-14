import { useEffect, useState } from 'react';

interface BetSuccessNotificationProps {
  show: boolean;
  onClose: () => void;
}

export const BetSuccessNotification = ({ show, onClose }: BetSuccessNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-gradient-to-br from-gray-900 to-black border-4 border-cyan-500 rounded-2xl p-8 text-center transform transition-all duration-300 ${
          isVisible ? 'scale-100 rotate-0' : 'scale-50 rotate-12'
        }`}
      >
        <div className="mb-4 animate-bounce">
          <img
            src="/aniiii.gif"
            alt="Bet Placed"
            className="w-32 h-32 mx-auto"
          />
        </div>
        <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-400 animate-pulse mb-2">
          BET PLACED!
        </h2>
        <div className="flex justify-center gap-1 mt-4">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};
