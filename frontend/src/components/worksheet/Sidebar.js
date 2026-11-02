'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui';
import SectionAccordion from './SectionAccordion';
import SaveTemplateForm from './SaveTemplateForm';

export default function WorksheetGenerationSidebar({
    sections, openSectionId, onToggleSection, onAddSection, onAddHeader,
    onRemoveEntry, onRenameHeader, onUpdateSection, onToggleSharedModifiers,
    onSharedModifierChange, onTopicModifierChange, onRemoveTopic,
    onReorderEntries, onMoveTopic, onGenerate, isGenerating,
    onSaveTemplate, isSavingTemplate, saveTemplateError, generateError, pdfUrl,
    currentEditingTemplate, shouldOpenSaveFormOnInit, onSaveFormOpened,
    answerKeyMode, onAnswerKeyModeChange, workflowMode = 'accordion',
}) {
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    useEffect(() => {
        if (shouldOpenSaveFormOnInit) {
            setShowSaveForm(true);
            onSaveFormOpened?.();
        }
    }, [shouldOpenSaveFormOnInit, onSaveFormOpened]);

    const handleSaveFormSubmit = async (data) => {
        if (await onSaveTemplate(data)) setShowSaveForm(false);
    };

    const topicSections = sections.filter(section => section.mode !== 'header');
    const isGenerateButtonDisabled = isGenerating || !topicSections.length ||
        sections.at(-1)?.mode === 'header' ||
        topicSections.some(section => !section.topics.length || (section.mode === 'mixed' && section.topics.length < 2));
    const isSaveButtonDisabled = !topicSections.length ||
        topicSections.some(section => !section.topics.length || (section.mode === 'mixed' && section.topics.length < 2)) ||
        sections.at(-1)?.mode === 'header';

    if (!isMounted) return null;

    return (
        <aside className="fixed left-0 right-0 bottom-0 flex h-[30%] w-full flex-col overflow-hidden z-900 bg-main-100 shadow-[-4px_0_10px_rgba(0,0,0,0.1)] p-md pb-0
              min-[769px]:top-0 min-[769px]:bottom-0 min-[769px]:right-0 min-[769px]:left-auto min-[769px]:h-full min-[769px]:w-95 min-[769px]:p-lg min-[769px]:pt-25 min-[769px]:pb-0">

            {showSaveForm && (
                (!currentEditingTemplate || (currentEditingTemplate && currentEditingTemplate.id)) ? (
                    <SaveTemplateForm
                        key={currentEditingTemplate?.id || 'new'}
                        sections={sections}
                        workflowMode={workflowMode}
                        answerKeyMode={answerKeyMode}
                        onClose={() => setShowSaveForm(false)}
                        onSubmit={handleSaveFormSubmit}
                        isSaving={isSavingTemplate}
                        saveError={saveTemplateError}
                        initialTemplateData={currentEditingTemplate}
                    />
                ) : (
                    <p>Loading template for edit...</p>
                )
            )}

            <h2 className="shrink-0 font-bold text-main-600 text-center mb-sm text-lg min-[769px]:text-h3">
                Customize Worksheet
            </h2>

            <div className="min-h-0 flex-1 overflow-y-auto">
                {generateError && <p role="alert">{generateError.message || 'Worksheet generation failed.'}</p>}
                {pdfUrl && <a className="block text-main-700 underline text-center" href={pdfUrl} download="worksheet.pdf">Download Worksheet</a>}

                <section className="mb-sm border-b border-main-300 pb-md">
                    <fieldset className="p-sm">
                        <legend className="text-main-500 font-semibold">Answer key</legend>
                        <div className="flex flex-wrap gap-xs" role="group" aria-label="Answer key format">
                            {[['none', 'No key'], ['separate', 'Separate pages'], ['inline', 'Inline answers']].map(([value, label]) => (
                                <Button key={value} type="button" variant={answerKeyMode === value ? 'primary' : 'secondary'}
                                    aria-pressed={answerKeyMode === value} onClick={() => onAnswerKeyModeChange(value)}>
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </fieldset>
                </section>

                <SectionAccordion sections={sections} openSectionId={openSectionId}
                    onToggleSection={onToggleSection} onAddSection={onAddSection} onAddHeader={onAddHeader}
                    onRemoveEntry={onRemoveEntry} onRenameHeader={onRenameHeader} onUpdateSection={onUpdateSection}
                    onToggleSharedModifiers={onToggleSharedModifiers} onSharedModifierChange={onSharedModifierChange}
                    onTopicModifierChange={onTopicModifierChange} onRemoveTopic={onRemoveTopic}
                    onReorderEntries={onReorderEntries} onMoveTopic={onMoveTopic} />
            </div>

            <div className="flex shrink-0 items-center gap-md border-t border-main-300 bg-main-100 px-sm pt-sm pb-sm
                min-[769px]:px-md min-[769px]:pt-md min-[769px]:pb-sm">
                <Button onClick={onGenerate} disabled={isGenerateButtonDisabled} isLoading={isGenerating}
                    className="min-w-0 grow text-sm min-[769px]:text-lg">
                    Generate Worksheet
                </Button>
                <Button onClick={() => setShowSaveForm(true)} disabled={isSaveButtonDisabled}
                    aria-label="Save template" title="Save template" className="aspect-square w-12 shrink-0 p-sm">
                    <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                            d="M4 6a2 2 0 0 1 2-2h8.172a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 20 9.828V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 4h5v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1zM7 15a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5H7z" />
                    </svg>
                </Button>
            </div>
        </aside>
    );
}