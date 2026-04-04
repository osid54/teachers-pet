'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import UniformSettingsForm from './UniformSettingsForm';
import SelectedTopicsList from './SelectedTopicsList';
import SaveTemplateForm from './SaveTemplateForm';

export default function WorksheetGenerationSidebar({
    mode, selectedTopicInstances, onUniformSettingChange, onTopicInstanceModifierChange,
    onAddTopicInstance, onRemoveTopicInstance, onGenerate, isGenerating,
    uniformSettings, onSaveTemplate, isSavingTemplate, saveTemplateError,
    currentEditingTemplate, shouldOpenSaveFormOnInit
}) {
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => { setIsMounted(true); }, []);

    if (!isMounted) return null;

    const isGenerateButtonDisabled = selectedTopicInstances.length === 0 || isGenerating;
    const isSaveButtonDisabled = selectedTopicInstances.length === 0;

    return (
        <aside className="fixed left-0 right-0 bottom-0 h-[30%] w-full z-900 bg-main-100 shadow-[-4px_0_10px_rgba(0,0,0,0.1)] p-md overflow-y-auto 
                          sm:top-0 sm:bottom-0 sm:right-0 sm:left-auto sm:h-full sm:w-115 sm:p-lg sm:pt-25 sm:overflow-y-hidden sm:shadow-lg">

            {showSaveForm && (
                (!currentEditingTemplate || (currentEditingTemplate && currentEditingTemplate.id)) ? (
                    <SaveTemplateForm
                        currentSelectedTopics={selectedTopicInstances}
                        currentUniformSettings={uniformSettings}
                        onClose={handleSaveFormClose}
                        onSubmit={handleSaveFormSubmit}
                        isSaving={isSavingTemplate}
                        saveError={saveTemplateError}
                        initialTemplateData={currentEditingTemplate}
                    />
                ) : (
                    <p className={styles.loadingMessage}>Loading template for edit...</p>
                )
            )}

            <h2 className="font-bold text-main-600 text-center mb-sm text-lg sm:text-h3">
                Customize Worksheet
            </h2>

            <section className="mb-sm py-md shadow-md">
                <h3 className="text-main-500 font-semibold text-center text-lg mb-sm">General Settings</h3>
                <UniformSettingsForm settings={uniformSettings} onChange={(e) => {
                    const { name, value, type, checked } = e.target;
                    onUniformSettingChange({ ...uniformSettings, [name]: type === 'checkbox' ? checked : Number(value) });
                }} mode={mode} />
            </section>

            <section className="mb-sm py-md shadow-md">
                <h3 className="text-main-500 font-semibold text-center text-lg">Selected Topic{mode === "multi" ? "s" : ""} ({mode} mode)</h3>
                {selectedTopicInstances.length === 0 ? (
                    <p className="text-main-500 text-center border border-dashed border-main-500 rounded-md text-sm py-md px-lg mx-md">
                        Select {mode === "multi" ? "topics" : "a topic"} from the grid to add {mode === "multi" ? "them" : "it"} here.
                    </p>
                ) : (
                    <SelectedTopicsList
                        mode={mode}
                        topicInstances={selectedTopicInstances}
                        onTopicInstanceModifierChange={onTopicInstanceModifierChange}
                        onAddTopicInstance={onAddTopicInstance}
                        onRemoveTopicInstance={onRemoveTopicInstance}
                    />
                )}
            </section>

            <div className="flex gap-4 p-sm  text-center
                            sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:p-lg ">
                <Button
                    onClick={() => onGenerate(uniformSettings)}
                    disabled={isGenerateButtonDisabled}
                    isLoading={isGenerating}
                    className="grow text-sm sm:text-lg sm:w-[75%]"
                >
                    Generate Worksheet
                </Button>
                <Button
                    onClick={() => selectedTopicInstances.length ? setShowSaveForm(true) : toast.error("Select a topic first.")}
                    disabled={isSaveButtonDisabled}
                    className="w-[20%]"
                >
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 mx-auto" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 6a2 2 0 0 1 2-2h8.172a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 20 9.828V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 4h5v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1zM7 15a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5H7z" />
                    </svg>
                </Button>
            </div>
        </aside>
    );
}