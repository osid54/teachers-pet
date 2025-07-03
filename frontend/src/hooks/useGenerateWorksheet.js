'use client';

import { useState } from 'react';
import { generateWorksheetPDF } from '@/services/worksheetApi';

export function useGenerateWorksheet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');

  const generate = async (worksheetData) => {
    setLoading(true);
    setError(null);
    setPdfUrl('');

    try {
      const pdfBlob = await generateWorksheetPDF(worksheetData);
      const url = window.URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      window.open(url, '_blank');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error, pdfUrl };
}