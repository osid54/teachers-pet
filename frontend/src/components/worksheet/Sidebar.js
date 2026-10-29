'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import UniformSettingsForm from './UniformSettingsForm';
import SelectedTopicsList from './SelectedTopicsList';
import SaveTemplateForm from './SaveTemplateForm';

export default function WorksheetGenerationSidebar({
    mode, selectedTopicInstances, onUniformSettingChange, onTopicInstanceModifierChange,
    onAddTopicInstance, onRemoveTopicInstance, onGenerate, isGenerating,
    uniformSettings, onSaveTemplate, isSavingTemplate, saveTemplateError, generateError, pdfUrl,
    currentEditingTemplate, shouldOpenSaveFormOnInit, onSaveFormOpened
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

    if (!isMounted) return null;

    const isGenerateButtonDisabled = selectedTopicInstances.length === 0 || isGenerating;
    const isSaveButtonDisabled = selectedTopicInstances.length === 0;

    return (
        <aside className="fixed left-0 right-0 bottom-0 h-[30%] w-full z-900 bg-main-100 shadow-[-4px_0_10px_rgba(0,0,0,0.1)] p-md overflow-y-auto 
                          min-[769px]:top-0 min-[769px]:bottom-0 min-[769px]:right-0 min-[769px]:left-auto min-[769px]:h-full min-[769px]:w-95 min-[769px]:p-lg min-[769px]:pt-25 min-[769px]:overflow-y-hidden">

            {showSaveForm && (
                (!currentEditingTemplate || (currentEditingTemplate && currentEditingTemplate.id)) ? (
                    <SaveTemplateForm
                        key={currentEditingTemplate?.id || 'new'}
                        currentSelectedTopics={selectedTopicInstances}
                        currentUniformSettings={uniformSettings}
                        onClose={() => setShowSaveForm(false)}
                        onSubmit={handleSaveFormSubmit}
                        mode={mode}
                        isSaving={isSavingTemplate}
                        saveError={saveTemplateError}
                        initialTemplateData={currentEditingTemplate}
                    />
                ) : (
                    <p>Loading template for edit...</p>
                )
            )}

            <h2 className="font-bold text-main-600 text-center mb-sm text-lg min-[769px]:text-h3">
                Customize Worksheet
            </h2>

            {generateError && <p role="alert">{generateError.message || 'Worksheet generation failed.'}</p>}
            {pdfUrl && <a className="block text-main-700 underline text-center" href={pdfUrl} download="worksheet.pdf">Download Worksheet</a>}

            <section className="mb-sm py-md shadow-md">
                <h3 className="text-main-500 font-semibold text-center text-lg mb-sm">General Settings</h3>
                <UniformSettingsForm settings={uniformSettings} onChange={(e) => {
                    const { name, value, type, checked } = e.target;
                    onUniformSettingChange({ ...uniformSettings, [name]: type === 'checkbox' ? checked : Number(value) });
                }} mode={mode} />
            </section>

            <section className="mb-sm py-md shadow-md">
                <h3 className="text-main-500 font-semibold text-center text-lg mb-sm">Selected Topic{mode === "multi" ? "s" : ""} ({mode} mode)</h3>
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

            <div className="flex gap-4 p-sm text-center
                            min-[769px]:gap-[5%] min-[769px]:absolute min-[769px]:bottom-0 min-[769px]:left-0 min-[769px]:right-0 min-[769px]:p-lg min-[769px]:mb-lg min-[769px]:bg-main-100 ">
                <Button
                    onClick={() => onGenerate(uniformSettings)}
                    disabled={isGenerateButtonDisabled}
                    isLoading={isGenerating}
                    className="grow text-sm min-[769px]:text-lg min-[769px]:w-[75%]"
                >
                    Generate Worksheet
                </Button>
                <Button
                    onClick={() => selectedTopicInstances.length ? setShowSaveForm(true) : toast.error("Select a topic first.")}
                    disabled={isSaveButtonDisabled}
                    aria-label="Save template"
                    className="w-[20%]"
                >
                    <svg className="w-6 h-6 min-[769px]:w-8 min-[769px]:h-8 mx-auto" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M4 6a2 2 0 0 1 2-2h8.172a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 20 9.828V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM8 4h5v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1zM7 15a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5H7z" />
                    </svg>
                </Button>
            </div>
        </aside>
    );
}