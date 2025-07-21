'use client';

import React, { useState, useEffect } from 'react';
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
            alert("Please select at least one topic before saving a template.");
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

            {/* Uniform Settings Section */}
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
                    className={styles.generateButton}
                >
                    Save Template
                </Button>
            </div>
        </aside>
    );
}