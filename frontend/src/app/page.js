'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useGenerateWorksheet } from '@/hooks/useGenerateWorksheet';
import { buildMixedWorksheet } from '@/lib/mixedWorksheet';
import { supportedCurriculumData } from '@/lib/curriculum';
import { normalizeWorksheetSettings } from '@/lib/worksheetSettings';
import { useAuth } from '@/context/AuthContext';

import SubjectHeader from '@/components/worksheet/SubjectHeader';
import ProblemTypeCard from '@/components/worksheet/ProblemTypeCard';
import HowToUse from '@/components/layout/HowToUse';
import { Button } from '@/components/ui';
import Sidebar from '@/components/worksheet/Sidebar';

function PageContent() {
  const { generate, loading: generateLoading, error: generateError, pdfUrl } = useGenerateWorksheet();
  const { authApi, isLoggedIn, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [topicSelectionMode, setTopicSelectionMode] = useState('single');
  const [selectedTopicInstances, setSelectedTopicInstances] = useState([]);

  const [uniformSettings, setUniformSettings] = useState({
    pageCount: 1,
    problemsPerPage: 10,
    includeAnswerKey: true,
    mixedProblems: false,
  });

  const [searchParams] = useSearchParams();
  const templateIdFromUrl = searchParams.get('templateId');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [saveTemplateError, setSaveTemplateError] = useState(null);
  const [loadTemplateError, setLoadTemplateError] = useState(null);

  const [currentEditingTemplate, setCurrentEditingTemplate] = useState(null);
  const [shouldOpenSaveFormAfterLoad, setShouldOpenSaveFormAfterLoad] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSaveTemplate = async (templateData) => {
    if (!isLoggedIn) {
      toast.error("You must be logged in to save templates.");
      return false;
    }
    setIsSavingTemplate(true);
    setSaveTemplateError(null);
    try {
      let response;
      if (currentEditingTemplate && currentEditingTemplate.id) {
        response = await authApi.put(`/templates/${currentEditingTemplate.id}`, templateData);
        toast.success("Template updated successfully!");
        console.log("Template updated successfully:", response.data);
      } else {
        response = await authApi.post('/templates/', templateData);
        toast.success("Template saved successfully!");
        console.log("Template saved successfully:", response.data);
      }
      setCurrentEditingTemplate(null);
      return true;
    } catch (error) {
      console.error("Failed to save template:", error.response?.data || error.message);
      const msg = error.response?.data?.detail || "Failed to save template.";
      setSaveTemplateError(msg);
      toast.error(msg);
      return false;
    } finally {
      setIsSavingTemplate(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadTemplate = async () => {
      try {
        let settingsToLoad;
        let editingTemplate = null;
        if (templateIdFromUrl) {
          if (!isLoggedIn) {
            setLoadTemplateError('Log in on the Templates page before editing a template.');
            return;
          }
          const response = await authApi.get(`/templates/${templateIdFromUrl}`);
          settingsToLoad = response.data.settings_json;
          editingTemplate = response.data;
        } else {
          const stored = localStorage.getItem('tempLoadTemplate');
          if (!stored) return;
          localStorage.removeItem('tempLoadTemplate');
          settingsToLoad = JSON.parse(stored);
        }
        const settings = normalizeWorksheetSettings(settingsToLoad);
        if (cancelled) return;
        setLoadTemplateError(null);
        setUniformSettings(settings.uniformSettings);
        setTopicSelectionMode(settings.topicSelectionMode);
        setSelectedTopicInstances(settings.selectedTopicInstances);
        setCurrentEditingTemplate(editingTemplate);
        if (editingTemplate) {
          setShouldOpenSaveFormAfterLoad(true);
          navigate('/', { replace: true });
        }
      } catch (error) {
        if (!cancelled) setLoadTemplateError(`Unable to load template. ${error instanceof SyntaxError ? 'Stored settings are not valid JSON.' : error.message}`);
      }
    };

    if (isMounted && !authLoading) loadTemplate();
    return () => { cancelled = true; };
  }, [templateIdFromUrl, isLoggedIn, isMounted, authLoading, authApi, navigate]);

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
      topicId: topicWithSubject.topicId || topicWithSubject.id,
      topicName: topicWithSubject.topicName || topicWithSubject.name,
      modifiers: structuredClone(topicWithSubject.modifiers || defaultModifiers),
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
    const subjectOfClickedTopic = supportedCurriculumData.find(s =>
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
      toast.error("Please select at least one topic to generate.");
      return;
    }
    return generate(async () => {
      const settings = normalizeWorksheetSettings({ selectedTopicInstances,
        uniformSettings: uniformSettingsFromSidebar, topicSelectionMode });
      if (settings.uniformSettings.mixedProblems) {
        return buildMixedWorksheet(settings.selectedTopicInstances, settings.uniformSettings);
      }
      return settings.selectedTopicInstances.map(instance => ({
        subject: instance.subject,
        topic: [instance.topicId],
        page_count: settings.uniformSettings.pageCount,
        include_answer_key: settings.uniformSettings.includeAnswerKey,
        problems_per_page: settings.uniformSettings.problemsPerPage,
        modifiers: instance.modifiers,
      }));
    });
  };

  return (
    <div className="flex w-full min-[769px]:flex-row min-[769px]:gap-xl flex-col gap-md">

      <div className="grow bg-main-300 min-[769px]:max-w-[calc(100%-380px)] max-w-full mr-0 rounded-lg shadow-lg p-md min-[769px]:p-xl">
        <h1 className="text-h3 min-[769px]:text-xl font-bold text-main-900 text-center ">
          Generate Your Worksheet
        </h1>

        <HowToUse />
        {loadTemplateError && <p role="alert">{loadTemplateError}</p>}

        <div className="flex justify-center gap-md ">
          <Button
            onClick={() => {
              setTopicSelectionMode('single');
              setSelectedTopicInstances([]);
              setUniformSettings(settings => ({ ...settings, mixedProblems: false }));
            }}
            variant={topicSelectionMode === 'single' ? 'primary' : 'secondary'}
            className="min-[769px]:min-w-[150px]"
          >
            Single Topic
          </Button>
          <Button
            onClick={() => setTopicSelectionMode('multi')}
            variant={topicSelectionMode === 'multi' ? 'primary' : 'secondary'}
            className="min-[769px]:min-w-[150px]"
          >
            Multi Topic
          </Button>
        </div>

        <div className="flex flex-col gap-lg">
          {supportedCurriculumData.map(subjectData => (
            <React.Fragment key={subjectData.subject}>
              <SubjectHeader title={subjectData.subject} />

              <div className="grid min-[769px]:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-md justify-items-center grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
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

      <div className='h-[30vh] min-[769px]:hidden'/>

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
          pdfUrl={pdfUrl}
          uniformSettings={uniformSettings}
          onSaveTemplate={handleSaveTemplate}
          isSavingTemplate={isSavingTemplate}
          saveTemplateError={saveTemplateError}
          currentEditingTemplate={currentEditingTemplate}
          shouldOpenSaveFormOnInit={shouldOpenSaveFormAfterLoad}
          onSaveFormOpened={() => setShouldOpenSaveFormAfterLoad(false)}
        />
      )}
    </div>
  );
}

export default function HomePage() { 
  return (
    <Suspense fallback={<div>Loading page...</div>}>
      <PageContent />
    </Suspense>
  );
}