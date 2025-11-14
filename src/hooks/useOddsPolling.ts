import { useEffect } from 'react';

const POLL_INTERVAL = 30000;

export const useOddsPolling = (refetch: () => void) => {
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Polling for odds updates...');
      refetch();
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [refetch]);
};
