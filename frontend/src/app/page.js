'use client';

import React, { useState, useEffect } from 'react';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import { useGenerateWorksheet } from '@/hooks/useGenerateWorksheet';
import { curriculumData } from '@/lib/curriculum'; 

import SubjectHeader from '@/components/worksheet/SubjectHeader';
import ProblemTypeCard from '@/components/worksheet/ProblemTypeCard';

import styles from '@/styles/pages/_app.module.scss';

export default function HomePage() {
  const { statusMessage, isLoading: statusLoading, error: statusError } = useBackendStatus();
  const { generate, loading: generateLoading, error: generateError, pdfUrl } = useGenerateWorksheet();
  const [selectedTopicId, setSelectedTopicId] = useState(null);

  const handleTopicSelect = (topicId) => {
    setSelectedTopicId(topicId);
    console.log(`Selected topic: ${topicId}`);

    let selectedSubject = '';
    let selectedTopicName = '';
    curriculumData.forEach(subject => {
      subject.topics.forEach(topic => {
        if (topic.id === topicId) {
          selectedSubject = subject.subject;
          selectedTopicName = topic.name;
        }
      });
    });

    const worksheetData = {
      subject: 'Arithmetic',
      topic: ["addition", "subtraction", "multiplication"],
      page_count: 1,
      include_answer_key: true,
      modifiers: {
        "problem": {
          "digits": 2,
          "dec": 0,
          "neg": 1,
          "frac": false,
        },
        "answer": {
          "round": 0,
        },
      },
    };
    generate(worksheetData);
  };

  return (
    <div className={styles.container}>
      <h1>Generate Your Worksheet</h1>

        <>
          {/* Backend Status Display */}
          
          {/*{statusLoading && <p>Backend Status: Connecting...</p>}
          {statusError && <p style={{ color: 'red' }}>Backend Status Error: {statusError}</p>}
          {!statusLoading && !statusError && <p>Backend Status: {statusMessage}</p>}*/}

          {/* Curriculum Grid */}
          <div className={styles.curriculumGrid}>
            {curriculumData.map(subjectData => (
              <React.Fragment key={subjectData.subject}>
                <SubjectHeader title={subjectData.subject} />
                <div className={styles.topicCardsGrid}>
                  {subjectData.topics.map(topic => (
                    <ProblemTypeCard
                      key={topic.id}
                      topic={topic}
                      onSelect={handleTopicSelect}
                    />
                  ))}
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Generation Status/Errors */}
          {generateLoading && <p>Generating worksheet...</p>}
          {generateError && <p style={{ color: 'red' }}>Generation Error: {generateError}</p>}
          {pdfUrl && !generateLoading && !generateError && (
            <p>Worksheet generated! Check the new tab or download.</p>
          )}
        </>
    </div>
  );
}
