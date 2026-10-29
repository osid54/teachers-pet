'use client';

import { useState, useEffect } from 'react';
import { generateWorksheetPDF } from '@/services/worksheetApi';

export function useGenerateWorksheet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    return () => { if (pdfUrl) window.URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  const generate = async (worksheetData) => {
    setLoading(true);
    setError(null);
    setPdfUrl('');

    try {
      const request = typeof worksheetData === 'function' ? await worksheetData() : worksheetData;
      const pdfBlob = await generateWorksheetPDF(request);
      const url = window.URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error, pdfUrl };
}