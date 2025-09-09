'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import styles from '@/styles/components/worksheet/_sidebar.module.scss';
import { Button } from '@/components//ui';

import UniformSettingsForm from './UniformSettingsForm';
import SelectedTopicsList from './SelectedTopicsList';
import SaveTemplateForm from './SaveTemplateForm';

/*
 * @param {object} props - Component props.
 * @param {'single' | 'multi'} props.mode - Current topic selection mode.
 * @param {Array} props.selectedTopicInstances - Array of currently selected topic instances.
 * @param {function} props.onUniformSettingChange - Callback for when uniform settings change.
 * @param {function} props.onTopicInstanceModifierChange - Callback for when a topic instance's modifiers change.
 * @param {function} props.onAddTopicInstance - Callback to add another instance of a topic.
 * @param {function} props.onRemoveTopicInstance - Callback to remove a topic instance.
 * @param {function} props.onGenerate - Callback to trigger worksheet generation.
 * @param {boolean} props.isGenerating - Loading state from the generate hook.
 * @param {string | null} props.generateError - Error message from the generate hook.
 */

export default function WorksheetGenerationSidebar({
    mode,
    selectedTopicInstances,
    onUniformSettingChange,
    onTopicInstanceModifierChange,
    onAddTopicInstance,
    onRemoveTopicInstance,
    onGenerate,
    isGenerating,
    generateError,
    uniformSettings,
    onSaveTemplate,
    isSavingTemplate,
    saveTemplateError,
    currentEditingTemplate,
    shouldOpenSaveFormOnInit
    }) {
    
    const [showSaveForm, setShowSaveForm] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (shouldOpenSaveFormOnInit && !showSaveForm) {
            setShowSaveForm(true);
        }
    }, [shouldOpenSaveFormOnInit, showSaveForm]);

    useEffect(() => {
        if (isMounted) {
            onUniformSettingChange(uniformSettings);
        }
    }, [uniformSettings, onUniformSettingChange, isMounted]);

    if (!isMounted) {
        return null;
    }

    const handleUniformSettingChange = (e) => {
        const { name, value, type, checked } = e.target;

        const updatedValue = type === 'checkbox' ? checked : Number(value);

        const newUniformSettings = {
            ...uniformSettings, 
            [name]: updatedValue,
        };

        onUniformSettingChange(newUniformSettings);
    };

    const handleGenerateClick = () => {
        setShowSaveForm(false);
        onGenerate(uniformSettings);
    };

    const handleSaveTemplateClick = () => {
        if (selectedTopicInstances.length === 0) {
            toast.error("Please select at least one topic before saving a template.");
            return;
        }
        setShowSaveForm(true);
    };

    const handleSaveFormClose = () => {
        setShowSaveForm(false);
    };

    const handleSaveFormSubmit = (templateData) => {
        if (onSaveTemplate) {
            onSaveTemplate(templateData);
        }
    };

    const isGenerateButtonDisabled = selectedTopicInstances.length === 0 || isGenerating;
    const isSaveButtonDisabled = selectedTopicInstances.length === 0;

    if (!isMounted) {
        return null;
    }

    return (
        <aside className={styles.sidebar}>
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
            <h2 className={styles.sidebarTitle}>Customize Worksheet</h2>

            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>General Settings</h3>
                <UniformSettingsForm
                    settings={uniformSettings}
                    onChange={handleUniformSettingChange}
                    mode={mode}
                />
            </section>
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Selected Topic{mode === "multi" ? "s" : ""} ({mode} mode)</h3>
                {selectedTopicInstances.length === 0 ? (
                    <p className={styles.noTopicsMessage}>Select {mode === "multi" ? "topics" : "a topic"} from the grid to add {mode === "multi" ? "them" : "it"} here.</p>
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

            <div className={styles.generateButtonContainer}>
                <Button
                    onClick={handleGenerateClick}
                    disabled={isGenerateButtonDisabled}
                    isLoading={isGenerating}
                    variant="primary"
                    className={styles.generateButton}
                >
                    Generate Worksheet
                </Button>
                <Button
                    onClick={handleSaveTemplateClick}
                    disabled={isSaveButtonDisabled}
                    variant="primary"
                    className={styles.saveButton}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke="hsla(0, 23%, 97%, 1)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 6a2 2 0 0 1 2-2h8.172a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 20 9.828V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
                        ></path>
                        <path
                            stroke="hsla(0, 23%, 97%, 1)"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 4h5v3a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1zM7 15a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v5H7z"
                        ></path>
                    </svg>
                </Button>
            </div>
        </aside>
    );
}