'use client';

import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams, useRouter } from 'next/navigation';

import { useBackendStatus } from '@/hooks/useBackendStatus';
import { useGenerateWorksheet } from '@/hooks/useGenerateWorksheet';
import { fetchProblemsList } from '@/services/worksheetApi';
import { curriculumData } from '@/lib/curriculum';
import { useAuth } from '@/context/AuthContext';

import SubjectHeader from '@/components/worksheet/SubjectHeader';
import ProblemTypeCard from '@/components/worksheet/ProblemTypeCard';
import HowToUse from '@/components/layout/HowToUse';
import { Button } from '@/components/ui';
import Sidebar from '@/components/worksheet/Sidebar';

import styles from '@/styles/pages/_home.module.scss';

export default function HomePage() {
  const { statusMessage, isLoading: statusLoading, error: statusError } = useBackendStatus();
  const { generate, loading: generateLoading, error: generateError, pdfUrl } = useGenerateWorksheet();
  const { authApi, isLoggedIn } = useAuth();
  const router = useRouter();

  const [topicSelectionMode, setTopicSelectionMode] = useState('single');
  const [selectedTopicInstances, setSelectedTopicInstances] = useState([]);

  const [uniformSettings, setUniformSettings] = useState({
    pageCount: 1,
    problemsPerPage: 10,
    includeAnswerKey: true,
    mixedProblems: false,
  });

  const searchParams = useSearchParams();
  const templateIdFromUrl = searchParams.get('templateId');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [saveTemplateError, setSaveTemplateError] = useState(null);

  const [currentEditingTemplate, setCurrentEditingTemplate] = useState(null);
  const [shouldOpenSaveFormAfterLoad, setShouldOpenSaveFormAfterLoad] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSaveTemplate = async (templateData) => {
    if (!isLoggedIn) {
      setSaveTemplateError("You must be logged in to save templates.");
      return;
    }
    setIsSavingTemplate(true);
    setSaveTemplateError(null);
    try {
      let response;
      if (currentEditingTemplate && currentEditingTemplate.id) {
        response = await authApi.put(`/templates/${currentEditingTemplate.id}`, templateData);
        alert("Template updated successfully!");
        console.log("Template updated successfully:", response.data);
      } else {
        response = await authApi.post('/templates/', templateData);
        alert("Template saved successfully!");
        console.log("Template saved successfully:", response.data);
        setCurrentEditingTemplate(null);
      }
    } catch (error) {
      console.error("Failed to save template:", error.response?.data || error.message);
      setSaveTemplateError(error.response?.data?.detail || "Failed to save template.");
      throw new Error("Failed to save template."); 
    } finally {
      setIsSavingTemplate(false);
    }
  };

  useEffect(() => {
    const loadTemplate = async () => {
      let settingsToLoad = null;
      let loadedFrom = '';

      if (typeof window !== 'undefined') {
        const tempLoadTemplateJson = localStorage.getItem('tempLoadTemplate');
        if (tempLoadTemplateJson) {
          settingsToLoad = JSON.parse(tempLoadTemplateJson);
          loadedFrom = 'localStorage';
          localStorage.removeItem('tempLoadTemplate');
        }
      }

      if (!settingsToLoad && templateIdFromUrl && isLoggedIn && isMounted) {
        try {
          const response = await authApi.get(`/templates/${templateIdFromUrl}`);
          settingsToLoad = response.data.settings_json;
          loadedFrom = 'api';
        } catch (error) {
          console.error("Failed to load template from API:", error.response?.data || error.message);
          alert("Failed to load template for editing. It might not exist or you don't have access.");
          router.replace('/');
          return;
        }
      }

      if (settingsToLoad) {
        console.log(`Loading template settings from ${loadedFrom}:`, settingsToLoad);

        const loadedUniformSettings = settingsToLoad.uniformSettings || {};

        setUniformSettings({
          pageCount: loadedUniformSettings.pageCount ?? 1, 
          problemsPerPage: loadedUniformSettings.problemsPerPage ?? 10,
          includeAnswerKey: loadedUniformSettings.includeAnswerKey ?? true, 
          mixedProblems: loadedUniformSettings.mixedProblems ?? false,
        });

        setTopicSelectionMode(loadedUniformSettings.mixedProblems ? 'multi' : 'single');

        const loadedInstances = (settingsToLoad.selectedTopicInstances || []).map(inst => ({
          ...inst,
          id: inst.id || uuidv4()
        }));
        setSelectedTopicInstances(loadedInstances);

        if (loadedFrom === 'api') {
          router.replace('/');
        }

        if (templateIdFromUrl) {
          setShouldOpenSaveFormAfterLoad(true);
        }
      }
    };

    if (isMounted && !generateLoading) {
      loadTemplate();
    }
  }, [templateIdFromUrl, isLoggedIn, isMounted, authApi, generateLoading]);

  useEffect(() => {
    if (shouldOpenSaveFormAfterLoad && currentEditingTemplate) {
      // Find the sidebar component and set its showSaveForm state
      // This requires a ref, or passing a function down the tree.
      // Let's pass a function down.
      // This also needs to be passed to SidebarWrapper
    }
  }, [shouldOpenSaveFormAfterLoad, currentEditingTemplate]);

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

  const handleGenerateButtonClick = async (uniformSettingsFromSidebar) => {
    if (selectedTopicInstances.length === 0) {
      console.warn("Please select at least one topic to generate.");
      return;
    }
    let finalGenerationRequest = {};

    if (uniformSettingsFromSidebar.mixedProblems) {
      let allProblemsToMix = [];
      const totalProblemsPerMixedWorksheet = uniformSettingsFromSidebar.pageCount * uniformSettingsFromSidebar.problemsPerPage;

      const problemsPerTopicInstance = Math.ceil(totalProblemsPerMixedWorksheet / selectedTopicInstances.length);


      for (const instance of selectedTopicInstances) {
        const problemRequest = {
          subject: instance.subject,
          topic: [instance.topicId],
          page_count: 1,
          problems_per_page: problemsPerTopicInstance,
          include_answer_key: false,
          modifiers: instance.modifiers,
        };

        try {
          const problemsFromInstance = await fetchProblemsList(problemRequest);
          allProblemsToMix.push(...problemsFromInstance);
        } catch (error) {
          console.error(`Failed to get problems for ${instance.topicName}:`, error);
          throw new Error(`Failed to get problems for ${instance.topicName}.`);
        }
      }

      for (let i = allProblemsToMix.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allProblemsToMix[i], allProblemsToMix[j]] = [allProblemsToMix[j], allProblemsToMix[i]];
      }

      if (allProblemsToMix.length > totalProblemsPerMixedWorksheet) {
        allProblemsToMix = allProblemsToMix.slice(0, totalProblemsPerMixedWorksheet);
      } else if (allProblemsToMix.length < totalProblemsPerMixedWorksheet) {
        console.warn(`Not enough problems generated (${allProblemsToMix.length}) for desired total (${totalProblemsPerMixedWorksheet}).`);
      }

      finalGenerationRequest = {
        subject: selectedTopicInstances[0].subject,
        topic: ["mixed"],
        page_count: uniformSettingsFromSidebar.pageCount,
        include_answer_key: uniformSettingsFromSidebar.includeAnswerKey,
        problems_per_page: uniformSettingsFromSidebar.problemsPerPage,
        mixed_problems_data: allProblemsToMix,
        modifiers: {}
      };

      generate([finalGenerationRequest]);

    } else {
      finalGenerationRequest = selectedTopicInstances.map(instance => ({
        subject: instance.subject,
        topic: [instance.topicId],
        page_count: uniformSettingsFromSidebar.pageCount,
        include_answer_key: uniformSettingsFromSidebar.includeAnswerKey,
        problems_per_page: uniformSettingsFromSidebar.problemsPerPage,
        modifiers: instance.modifiers,
      }));

      generate(finalGenerationRequest);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        <h1 className={styles.pageTitle}>Generate Your Worksheet</h1>
        <HowToUse />
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
          uniformSettings={uniformSettings}
          onSaveTemplate={handleSaveTemplate}
          isSavingTemplate={isSavingTemplate}
          saveTemplateError={saveTemplateError}
          currentEditingTemplate={currentEditingTemplate}
        />
      )}
    </div>
  );
}