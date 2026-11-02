'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useGenerateWorksheet } from '@/hooks/useGenerateWorksheet';
import { supportedCurriculumData } from '@/lib/curriculum';
import { buildWorksheetRequest, normalizeWorksheetSettings } from '@/lib/worksheetSettings';
import { moveWorksheetTopic, reorderWorksheetEntries, removeWorksheetTopic } from '@/lib/worksheetStructure';
import { useAuth } from '@/context/AuthContext';

import SubjectHeader from '@/components/worksheet/SubjectHeader';
import ProblemTypeCard from '@/components/worksheet/ProblemTypeCard';
import HowToUse from '@/components/layout/HowToUse';
import Sidebar from '@/components/worksheet/Sidebar';
import TopicCustomizeModal from '@/components/worksheet/TopicCustomizeModal';
import { DEFAULT_TOPIC_MODIFIERS } from '@/components/worksheet/TopicModifierFields';

const createSection = (mode = 'single') => ({
  id: uuidv4(), mode, topics: [], pageCount: 1, problemsPerPage: 10,
  shareModifiers: false, sharedModifiers: null,
});
const createHeader = () => ({ id: uuidv4(), mode: 'header', title: 'New header' });

function PageContent() {
  const { generate, loading: generateLoading, error: generateError, pdfUrl } = useGenerateWorksheet();
  const { authApi, isLoggedIn, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [sections, setSections] = useState(() => [createSection('single')]);
  const [openSectionId, setOpenSectionId] = useState(() => sections[0].id);
  const [lastOpenedSectionId, setLastOpenedSectionId] = useState(() => sections[0].id);
  const [topicDialog, setTopicDialog] = useState(null);
  const [answerKeyMode, setAnswerKeyMode] = useState('separate');

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

  const toggleSection = (sectionId) => {
    if (openSectionId === sectionId) {
      setOpenSectionId(null);
      return;
    }
    setOpenSectionId(sectionId);
    setLastOpenedSectionId(sectionId);
  };

  const addSection = (mode) => {
    const section = createSection(mode);
    setSections(current => [...current, section]);
    setOpenSectionId(section.id);
    setLastOpenedSectionId(section.id);
  };

  const addHeader = () => {
    const header = createHeader();
    const section = createSection('single');
    setSections(current => [...current, header, section]);
    setOpenSectionId(section.id);
    setLastOpenedSectionId(section.id);
  };

  const removeEntry = (entryId) => {
    const remaining = sections.filter(section => section.id !== entryId);
    setSections(remaining);
    if (openSectionId === entryId) setOpenSectionId(null);
    if (lastOpenedSectionId === entryId) {
      setLastOpenedSectionId(remaining.find(section => section.mode !== 'header')?.id || null);
    }
  };

  const updateSection = (sectionId, changes) => {
    setSections(current => current.map(section => section.id === sectionId ? { ...section, ...changes } : section));
  };

  const toggleSharedModifiers = (sectionId, enabled) => {
    setSections(current => current.map(section => {
      if (section.id !== sectionId) return section;
      if (enabled) {
        return { ...section, shareModifiers: true,
          sharedModifiers: section.sharedModifiers || section.topics[0]?.modifiers || { ...DEFAULT_TOPIC_MODIFIERS } };
      }
      const topics = section.topics.map(topic => ({ ...topic,
        modifiers: section.sharedModifiers || topic.modifiers }));
      return { ...section, topics, shareModifiers: false, sharedModifiers: null };
    }));
  };

  const updateSharedModifiers = (sectionId, modifiers) => {
    updateSection(sectionId, { sharedModifiers: modifiers });
  };

  const updateTopicModifiers = (sectionId, topicId, modifiers) => {
    setSections(current => current.map(section => {
      if (section.id !== sectionId) return section;
      if (section.shareModifiers) return { ...section, sharedModifiers: modifiers };
      return { ...section, topics: section.topics.map(topic => topic.id === topicId
        ? { ...topic, modifiers } : topic) };
    }));
  };

  const removeTopic = (sectionId, topicId) => {
    setSections(current => removeWorksheetTopic(current, sectionId, topicId));
  };

  const reorderEntries = (sourceId, targetId) => {
    setSections(current => reorderWorksheetEntries(current, sourceId, targetId));
  };

  const moveTopic = (sourceSectionId, topicId, targetSectionId, targetTopicId = null) => {
    setSections(current => moveWorksheetTopic(current, sourceSectionId, topicId, targetSectionId, targetTopicId));
    if (sourceSectionId !== targetSectionId) {
      setOpenSectionId(targetSectionId);
      setLastOpenedSectionId(targetSectionId);
    }
  };

  const makeTopicInstance = (topic, subject) => ({
    id: uuidv4(), subject, topicId: topic.id, topicName: topic.name,
    description: topic.description || '', modifiers: { ...DEFAULT_TOPIC_MODIFIERS },
  });

  const addTopicToSection = (instance, sectionId) => {
    const target = sections.find(section => section.id === sectionId);
    if (!target || target.mode === 'header') return;
    const newInstance = target.shareModifiers
      ? { ...instance, modifiers: target.sharedModifiers } : instance;
    setSections(current => current.map(section => section.id === sectionId
      ? { ...section, topics: [...section.topics, newInstance] } : section));
    setOpenSectionId(sectionId);
    setLastOpenedSectionId(sectionId);
    setTopicDialog(null);
  };

  const handleTopicCardAction = (topic, customize) => {
    const subject = supportedCurriculumData.find(item => item.topics.some(candidate => candidate.id === topic.id))?.subject;
    if (!subject) return;
    const topicParents = sections.filter(section => section.mode !== 'header');
    const eligible = topicParents;
    if (!customize && topicParents.length === 1 && eligible.length === 1) {
      addTopicToSection(makeTopicInstance(topic, subject), eligible[0].id);
      return;
    }
    setTopicDialog({ topic, subject, customize });
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
        const firstParent = settings.sections.find(section => section.mode !== 'header');
        setOpenSectionId(firstParent?.id || null);
        setLastOpenedSectionId(firstParent?.id || null);
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

  const handleGenerateButtonClick = async () => {
    const topicSections = sections.filter(section => section.mode !== 'header');
    if (!topicSections.length || topicSections.some(section => !section.topics.length ||
        (section.mode === 'mixed' && section.topics.length < 2)) || sections.at(-1)?.mode === 'header') {
      toast.error('Complete each topic section and place headers before a section.');
      return;
    }
    return generate(async () => {
      return buildWorksheetRequest({ sections, answerKeyMode });
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

        <div className="flex flex-col gap-lg">
          {supportedCurriculumData.map(subjectData => (
            <React.Fragment key={subjectData.subject}>
              <SubjectHeader title={subjectData.subject} />

              <div className="grid min-[769px]:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-md justify-items-center grid-cols-[repeat(auto-fit,minmax(120px,1fr))]">
                {subjectData.topics.map(topic => {
                  const isCardSelected = sections.some(section => section.mode !== 'header' &&
                    section.topics.some(instance => instance.topicId === topic.id));
                  return (
                    <ProblemTypeCard
                      key={topic.id}
                      topic={topic}
                      onQuickAdd={selectedTopic => handleTopicCardAction(selectedTopic, false)}
                      onCustomize={selectedTopic => handleTopicCardAction(selectedTopic, true)}
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
          sections={sections}
          openSectionId={openSectionId}
          onToggleSection={toggleSection}
          onAddSection={addSection}
          onAddHeader={addHeader}
          onRemoveEntry={removeEntry}
          onRenameHeader={(headerId, title) => setSections(current => current.map(section =>
            section.id === headerId ? { ...section, title } : section))}
          onUpdateSection={updateSection}
          onToggleSharedModifiers={toggleSharedModifiers}
          onSharedModifierChange={updateSharedModifiers}
          onTopicModifierChange={updateTopicModifiers}
          onRemoveTopic={removeTopic}
          onReorderEntries={reorderEntries}
          onMoveTopic={moveTopic}
          onGenerate={handleGenerateButtonClick}
          isGenerating={generateLoading}
          generateError={generateError}
          pdfUrl={pdfUrl}
          onSaveTemplate={handleSaveTemplate}
          isSavingTemplate={isSavingTemplate}
          saveTemplateError={saveTemplateError}
          currentEditingTemplate={currentEditingTemplate}
          workflowMode="accordion"
          answerKeyMode={answerKeyMode}
          onAnswerKeyModeChange={setAnswerKeyMode}
          shouldOpenSaveFormOnInit={shouldOpenSaveFormAfterLoad}
          onSaveFormOpened={() => setShouldOpenSaveFormAfterLoad(false)}
        />
      )}
      {topicDialog && <TopicCustomizeModal key={`${topicDialog.topic.id}-${topicDialog.customize}`}
        topic={topicDialog.topic} subject={topicDialog.subject} sections={sections}
        initialSectionId={openSectionId || lastOpenedSectionId} customize={topicDialog.customize}
        onConfirm={addTopicToSection} onClose={() => setTopicDialog(null)} />}
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