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

import styles from '@/styles/pages/_home.module.scss';

export default function HomePage() {
  const { statusMessage, isLoading: statusLoading, error: statusError } = useBackendStatus();
  const { generate, loading: generateLoading, error: generateError, pdfUrl } = useGenerateWorksheet();
  const [topicSelectionMode, setTopicSelectionMode] = useState('single');
  const [selectedTopicInstances, setSelectedTopicInstances] = useState([]);

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

  const addTopicInstance = (topicWithSubject) => {
    const defaultModifiers = {
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

    const newInstance = {
      id: uuidv4(),
      subject: topicWithSubject.subject,
      topicId: topicWithSubject.id,
      topicName: topicWithSubject.name,
      modifiers: { ...defaultModifiers },
    };

    setSelectedTopicInstances((prevInstances) => {
      if (topicSelectionMode === 'single') {
        return [newInstance];
      }
      return [...prevInstances, newInstance];
    });
  };

  const removeTopicInstance = (instanceIdToRemove) => {
    setSelectedTopicInstances((prevInstances) => {
      const updatedInstances = prevInstances.filter((inst) => inst.id !== instanceIdToRemove);
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
    const subjectOfClickedTopic = curriculumData.find(s =>
      s.topics.some(t => t.id === topic.id)
    )?.subject;

    if (!subjectOfClickedTopic) {
      console.error("Subject not found for topic:", topic);
      return;
    }

    addTopicInstance({
      id: topic.id,
      name: topic.name,
      description: topic.description,
      subject: subjectOfClickedTopic
    });
  };

  const handleGenerateButtonClick = (uniformSettings) => {
    if (selectedTopicInstances.length === 0) {
      console.warn("Please select at least one topic to generate.");
      return;
    }

    const generationRequests = selectedTopicInstances.map(instance => ({
      subject: instance.subject,
      topic: [instance.topicId],
      page_count: uniformSettings.pageCount,
      include_answer_key: uniformSettings.includeAnswerKey,
      problems_per_page: uniformSettings.problemsPerPage,
      modifiers: instance.modifiers,
    }));

    console.log("Generating with requests:", generationRequests);
    generate(generationRequests);
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Generate Your Worksheet</h1>
        {/* How to Use Section */}
        <HowToUse />

        {/* Topic Selection Mode Buttons */}
        <div className={styles.modeSelection}>
          <Button
            onClick={() => {
              setTopicSelectionMode('single');
              setSelectedTopicInstances([]);
            }}
            variant={topicSelectionMode === 'single' ? 'primary' : 'secondary'}
            className={styles.modeButton}
          >
            Single Topic
          </Button>
          <Button
            onClick={() => {
              setTopicSelectionMode('multi');
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
      </div>
      {/* Worksheet Generation Sidebar */}
      {isMounted && (
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
    </div>
  );
}