'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useGenerateWorksheet } from '@/hooks/useGenerateWorksheet';
import { supportedCurriculumData } from '@/lib/curriculum';
import { normalizeWorksheetSettings } from '@/lib/worksheetSettings';
import { useAuth } from '@/context/AuthContext';

import SubjectHeader from '@/components/worksheet/SubjectHeader';
import ProblemTypeCard from '@/components/worksheet/ProblemTypeCard';
import HowToUse from '@/components/layout/HowToUse';
import { Button } from '@/components/ui';
import Sidebar from '@/components/worksheet/Sidebar';

const createSection = (mode = 'single') => ({
  id: uuidv4(), mode, topics: [], pageCount: 1, problemsPerPage: 10,
});

function PageContent() {
  const { generate, loading: generateLoading, error: generateError, pdfUrl } = useGenerateWorksheet();
  const { authApi, isLoggedIn, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [workflowMode, setWorkflowMode] = useState('single');
  const [sections, setSections] = useState(() => [createSection('single')]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [answerKeyMode, setAnswerKeyMode] = useState('separate');
  const activeSection = sections.find(section => section.id === activeSectionId) || sections[0];
  const selectedTopicInstances = activeSection?.topics || [];
  const uniformSettings = activeSection ? {
    pageCount: activeSection.pageCount,
    problemsPerPage: activeSection.problemsPerPage,
  } : { pageCount: 1, problemsPerPage: 10 };

  const [searchParams] = useSearchParams();
  const templateIdFromUrl = searchParams.get('templateId');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [saveTemplateError, setSaveTemplateError] = useState(null);
  const [loadTemplateError, setLoadTemplateError] = useState(null);

  const [currentEditingTemplate, setCurrentEditingTemplate] = useState(null);
  const [shouldOpenSaveFormAfterLoad, setShouldOpenSaveFormAfterLoad] = useState(false);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (!activeSectionId && sections[0]) setActiveSectionId(sections[0].id);
    setIsMounted(true);
  }, [activeSectionId, sections]);

  const updateSection = (sectionId, update) => {
    setSections(current => current.map(section => section.id === sectionId ? update(section) : section));
  };

  const chooseWorkflow = (nextMode) => {
    setWorkflowMode(nextMode);
    if (nextMode === 'multi-section') {
      if (!sections.length) {
        const section = createSection('single');
        setSections([section]);
        setActiveSectionId(section.id);
      }
      return;
    }
    const section = createSection(nextMode);
    setSections([section]);
    setActiveSectionId(section.id);
  };

  const addSection = (mode) => {
    const section = createSection(mode);
    setSections(current => [...current, section]);
    setActiveSectionId(section.id);
  };

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
        setSections(settings.sections);
        setActiveSectionId(settings.sections[0].id);
        setWorkflowMode(settings.workflowMode);
        setAnswerKeyMode(settings.answerKeyMode);
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
      digits: 2,
      digit_mode: 'up_to',
      decimal_places: 0,
      negative_probability: 0,
      allow_negative_answers: false,
      division_mode: 'exact',
      answer_rounding: null,
    };

    const newInstance = {
      id: uuidv4(),
      subject: topicWithSubject.subject,
      topicId: topicWithSubject.topicId || topicWithSubject.id,
      topicName: topicWithSubject.topicName || topicWithSubject.name,
      modifiers: structuredClone(topicWithSubject.modifiers || defaultModifiers),
    };

    updateSection(activeSection.id, section => ({
      ...section,
      topics: section.mode === 'single' ? [newInstance] : [...section.topics, newInstance],
    }));
  };

  const removeTopicInstance = (instanceIdToRemove) => {
    updateSection(activeSection.id, section => ({
      ...section, topics: section.topics.filter(instance => instance.id !== instanceIdToRemove),
    }));
  };

  const updateTopicInstanceModifiers = (instanceIdToUpdate, newModifiers) => {
    updateSection(activeSection.id, section => ({
      ...section,
      topics: section.topics.map(instance => instance.id === instanceIdToUpdate
        ? { ...instance, modifiers: newModifiers } : instance),
    }));
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

  const handleGenerateButtonClick = async () => {
    if (sections.some(section => section.topics.length === 0)) {
      toast.error("Please select at least one topic to generate.");
      return;
    }
    return generate(async () => {
      const request = normalizeWorksheetSettings({ sections, workflowMode, answerKeyMode });
      return {
        answer_key_mode: request.answerKeyMode,
        sections: request.sections.map(section => ({
          mode: section.mode,
          page_count: section.pageCount,
          problems_per_page: section.problemsPerPage,
          topics: section.topics.map(topic => ({ topic_id: topic.topicId, modifiers: topic.modifiers })),
        })),
      };
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

        <div className="flex flex-wrap justify-center gap-md">
          <Button
            onClick={() => chooseWorkflow('single')}
            variant={workflowMode === 'single' ? 'primary' : 'secondary'}
            className="min-[769px]:min-w-[150px]"
          >
            Single Topic
          </Button>
          <Button
            onClick={() => chooseWorkflow('mixed')}
            variant={workflowMode === 'mixed' ? 'primary' : 'secondary'}
            className="min-[769px]:min-w-[150px]"
          >
            Mixed Topic
          </Button>
          <Button
            onClick={() => chooseWorkflow('multi-section')}
            variant={workflowMode === 'multi-section' ? 'primary' : 'secondary'}
          >
            Multi-Section
          </Button>
        </div>

        {workflowMode === 'multi-section' && <div className="flex flex-wrap justify-center gap-sm my-md">
          {sections.map((section, index) => <Button key={section.id}
            onClick={() => setActiveSectionId(section.id)}
            variant={section.id === activeSection.id ? 'primary' : 'secondary'}>
            {index + 1}. {section.mode === 'mixed' ? 'Mixed' : 'Single'} ({section.topics.length})
          </Button>)}
          <Button onClick={() => addSection('single')} variant="secondary">Add Single Section</Button>
          <Button onClick={() => addSection('mixed')} variant="secondary">Add Mixed Section</Button>
          {sections.length > 1 && <Button variant="danger" onClick={() => {
            const remaining = sections.filter(section => section.id !== activeSection.id);
            setSections(remaining);
            setActiveSectionId(remaining[0].id);
          }}>Remove Active Section</Button>}
        </div>}

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
          mode={activeSection.mode}
          selectedTopicInstances={selectedTopicInstances}
          onUniformSettingChange={changes => updateSection(activeSection.id, section => ({ ...section, ...changes }))}
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
          sections={sections}
          workflowMode={workflowMode}
          answerKeyMode={answerKeyMode}
          onAnswerKeyModeChange={setAnswerKeyMode}
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