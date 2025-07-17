'use client';

import React, { useState, useEffect } from 'react';
import { useBackendStatus } from '@/hooks/useBackendStatus';
import { useGenerateWorksheet } from '@/hooks/useGenerateWorksheet';
import { curriculumData } from '@/lib/curriculum'; 

import SubjectHeader from '@/components/worksheet/SubjectHeader';
import ProblemTypeCard from '@/components/worksheet/ProblemTypeCard';
import HowToUse from '@/components/layout/HowToUse';
import { Button } from '@/components/ui';

import Sidebar from '@/components/worksheet/Sidebar';
import { v4 as uuidv4 } from 'uuid';

import styles from '@/styles/pages/_app.module.scss';

export default function HomePage() {
  const { statusMessage, isLoading: statusLoading, error: statusError } = useBackendStatus();
  const { generate, loading: generateLoading, error: generateError, pdfUrl } = useGenerateWorksheet();
  const [topicSelectionMode, setTopicSelectionMode] = useState('single');
  const [selectedTopicInstances, setSelectedTopicInstances] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [uniformSettings, setUniformSettings] = useState({
    pageCount: 1,
    problemsPerPage: 10,
    includeAnswerKey: true,
  });

  const getDefaultModifiersForTopic = (topicId) => {
    return {
      problem: {
        digits: 2,
        dec: 0,
        neg: 0, 
        frac: false,
      },
      answer: {
        round: 0,
      },
    };
  };

  const addTopicInstance = (topicToAdd) => {
    const fullTopic = curriculumData.flatMap(s => s.topics).find(t => t.id === topicToAdd.id);

    if (!fullTopic) {
      console.error("Attempted to add an invalid topic:", topicToAdd);
      return;
    }

    const newInstance = {
      id: uuidv4(),
      subject: fullTopic.subject,
      topicId: fullTopic.id,
      topicName: fullTopic.name,
      modifiers: getDefaultModifiersForTopic(fullTopic.id),
    };

    setSelectedTopicInstances((prevInstances) => {
      if (topicSelectionMode === 'single') {
        return [newInstance];
      }
      return [...prevInstances, newInstance];
    });

    setIsSidebarOpen(true);
  };

  const removeTopicInstance = (instanceIdToRemove) => {
    setSelectedTopicInstances((prevInstances) => {
      const updatedInstances = prevInstances.filter((inst) => inst.id !== instanceIdToRemove);
      if (updatedInstances.length === 0) {
        setIsSidebarOpen(false); 
      }
      return updatedInstances;
    });
  };

  const updateTopicInstanceModifiers = (instanceIdToUpdate, newModifiers) => {
    setSelectedTopicInstances((prevInstances) =>
      prevInstances.map((inst) =>
        inst.id === instanceIdToUpdate ? { ...inst, modifiers: newModifiers } : inst
      )
    );
  };

  const handleTopicCardClick = (topic) => {
    addTopicInstance(topic);
  };

  const handleGenerateButtonClick = (uniformSettings) => {
    if (selectedTopicInstances.length === 0) {
      console.warn("Please select at least one topic to generate.");
      return;
    }

    const generationRequests = selectedTopicInstances.map(instance => ({
      subject: instance.subject,
      topic: instance.topicName,
      page_count: uniformSettings.pageCount,
      include_answer_key: uniformSettings.includeAnswerKey,
      problems_per_page: uniformSettings.problemsPerPage,
      modifiers: instance.modifiers,
    }));

    console.log("Generating with requests:", generationRequests);
    generate(generationRequests);
  };

  /* const worksheetData = {
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
  }; */

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Generate Your Worksheet</h1>
        {/* Backend Status Display (consider moving to a discreet toast/notification) */}
        {isMounted && ( // Only render client-side content after mount
          <>
            {statusLoading && <p>Backend Status: Connecting...</p>}
            {statusError && <p style={{ color: 'red' }}>Backend Status Error: {statusError}</p>}
            {!statusLoading && !statusError && <p>Backend Status: {statusMessage.message}</p>} {/* Access .message */}
          </>
        )}

          {/* How to Use Section */}
          <HowToUse />

          {/* Topic Selection Mode Buttons */}
          <div className={styles.modeSelection}>
            <Button
            onClick={() => {
              setTopicSelectionMode('single');
              setSelectedTopicInstances([]);
              setIsSidebarOpen(false);
            }}
              variant={topicSelectionMode === 'single' ? 'primary' : 'secondary'}
              className={styles.modeButton}
            >
              Single Topic
            </Button>
            <Button
              onClick={() => {
                setTopicSelectionMode('multi');
                if (selectedTopicInstances.length === 1 && !isSidebarOpen) {
                  setIsSidebarOpen(true);
                }
              }}
              variant={topicSelectionMode === 'multi' ? 'primary' : 'secondary'}
              className={styles.modeButton}
            >
              Multi Topic
            </Button>
          </div>

      {/* Curriculum Grid */}
      <div className={styles.curriculumGrid}>
        {curriculumData.map(subjectData => (
          <React.Fragment key={subjectData.subject}>
            <SubjectHeader title={subjectData.subject} />
            <div className={styles.topicCardsGrid}>
              {subjectData.topics.map(topic => {
                const isCardSelected = selectedTopicInstances.some(inst => inst.topicId === topic.id);
                return (
                  <ProblemTypeCard
                    key={topic.id}
                    topic={topic}
                    onSelect={handleTopicCardClick}
                    isSelected={isCardSelected}
                  />
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Worksheet Generation Sidebar */}
      {isSidebarOpen && isMounted && ( 
        <Sidebar
          mode={topicSelectionMode}
          selectedTopicInstances={selectedTopicInstances}
          onUniformSettingChange={setUniformSettings}
          onTopicInstanceModifierChange={updateTopicInstanceModifiers}
          onAddTopicInstance={addTopicInstance}
          onRemoveTopicInstance={removeTopicInstance}
          onGenerate={handleGenerateButtonClick}
          isGenerating={generateLoading}
          generateError={generateError}
        />
      )}

      {/* Generation Status/Errors (can be integrated into sidebar or a toast) */}
      {isMounted && generateLoading && <p>Generating worksheet...</p>}
      {isMounted && generateError && <p style={{ color: 'red' }}>Generation Error: {generateError}</p>}
      {isMounted && pdfUrl && !generateLoading && !generateError && (
        <p>Worksheet generated! Check the new tab or download.</p>
      )}
    </div>
  );
}