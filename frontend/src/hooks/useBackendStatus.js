'use client';

import { useState, useEffect } from 'react';
import { fetchBackendStatus } from '@/services/worksheetApi';

export function useBackendStatus() {
  const [statusMessage, setStatusMessage] = useState('Connecting...');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStatus = async () => {
      try {
        const data = await fetchBackendStatus();
        setStatusMessage(data.message);
      } catch (err) {
        setError(err.message);
        setStatusMessage('Failed to connect.');
      } finally {
        setIsLoading(false);
      }
    };
    getStatus();
  }, []);
  
  return { statusMessage, isLoading, error };
}