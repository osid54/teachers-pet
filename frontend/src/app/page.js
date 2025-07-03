'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function HomePage() {
  const [backendMessage, setBackendMessage] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/')
      .then(response => {
        setBackendMessage(response.data);
      })
      .catch(err => {
        console.error("Error fetching from backend:", err);
        setBackendMessage('Failed to connect to backend.');
      });
  }, []);

  const handleGenerateWorksheet = async () => {
    setLoading(true);
    setError(null);
    setPdfUrl('');

    const worksheetData = {
      subject: 'Arithmetic',
      topic: 'Addition',
      pageCount: 1,
      includeAnswerKey: true,
      modifiers: {
        maxNumber: 10,
        allowNegatives: false,
        decimals: 2
      }
    };

    try {
      const response = await axios.post(
        'http://localhost:5000/generate-worksheet',
        worksheetData,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPdfUrl(url);
      window.open(url, '_blank');

    } catch (err) {
      console.error("Error generating worksheet:", err);
      setError("Failed to generate worksheet. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Worksheet Generator</h1>
      <p>Backend Status: {backendMessage}</p>

      <button
        onClick={handleGenerateWorksheet}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: loading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        {loading ? 'Generating...' : 'Generate Sample Worksheet'}
      </button>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {pdfUrl && !loading && (
        <p>
          Worksheet generated! Check the new tab or download.
        </p>
      )}
    </div>
  );
}

export default HomePage;