'use client';

import React from 'react';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import { useGenerateWorksheet } from '@/hooks/useGenerateWorksheet';
// import WorksheetForm from '@/components/worksheet/WorksheetForm'; // Future component for form inputs
// import LoadingSpinner from '@/components/LoadingSpinner'; // Future loading spinner component

export default function HomePage() {
  const { statusMessage, isLoading: statusLoading, error: statusError } = useBackendStatus();
  const { generate, loading: generateLoading, error: generateError, pdfUrl } = useGenerateWorksheet();

  const dummyWorksheetData = {
    subject: 'Arithmetic',
    topic: 'Addition',
    page_count: 1,
    include_answer_key: true,
    modifiers: {
      digits: 2,
      allowNegatives: true,
      decimals: 1
    }
  };

  const handleGenerateClick = () => {
    generate(dummyWorksheetData);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Worksheet Generator</h1>

      {statusLoading && <p>Backend Status: Connecting...</p>}
      {statusError && <p style={{ color: 'red' }}>Backend Status Error: {statusError}</p>}
      {!statusLoading && !statusError && <p>Backend Status: {statusMessage}</p>}

      {/* <WorksheetForm onSubmit={generate} loading={generateLoading} /> */}
      <button
        onClick={handleGenerateClick}
        disabled={generateLoading || statusLoading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: (generateLoading || statusLoading) ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}
      >
        {generateLoading ? 'Generating...' : 'Generate Sample Worksheet'}
      </button>

      {generateError && <p style={{ color: 'red' }}>Generation Error: {generateError}</p>}
      {pdfUrl && !generateLoading && !generateError && (
        <p>Worksheet generated! Check the new tab or download.</p>
      )}
    </div>
  );
}