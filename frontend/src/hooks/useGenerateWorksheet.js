'use client';

import { useState, useEffect } from 'react';
import { generateWorksheetPDF } from '@/services/worksheetApi';

export function useGenerateWorksheet() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');

  useEffect(() => {
    if (error) {
      console.error("Worksheet Generation Error:", error);
    }
  }, [error]);

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
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error, pdfUrl };
}