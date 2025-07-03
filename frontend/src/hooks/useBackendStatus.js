'use client';

import { useState, useEffect } from 'react';
import { fetchBackendStatus } from '@/services/worksheetApi';

export function useBackendStatus() {
  const [statusMessage, setStatusMessage] = useState('Connecting...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const getStatus = async () => {
      try {
        const data = await fetchBackendStatus();
        if (isMounted) {
          setStatusMessage(data.message);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setStatusMessage('Failed to connect.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    getStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  return { statusMessage, isLoading, error };
}