'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/components/worksheet/_sidebar.module.scss';
import { Button } from '@/components//ui';

import UniformSettingsForm from './UniformSettingsForm';
import SelectedTopicsList from './SelectedTopicsList';

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

export default function Sidebar({
    mode,
    selectedTopicInstances,
    onUniformSettingChange,
    onTopicInstanceModifierChange,
    onAddTopicInstance,
    onRemoveTopicInstance,
    onGenerate,
    isGenerating,
    generateError,
}) {
    const [uniformSettings, setUniformSettings] = useState({
        pageCount: 1,
        problemsPerPage: 10,
        includeAnswerKey: true,
    });

    useEffect(() => {
        onUniformSettingChange(uniformSettings);
    }, [uniformSettings, onUniformSettingChange]);

    const handleUniformSettingChange = (e) => {
        const { name, value, type, checked } = e.target;
        setUniformSettings((prevSettings) => ({
            ...prevSettings,
            [name]: type === 'checkbox' ? checked : Number(value),
        }));
    };

    const handleGenerateClick = () => {
        onGenerate(uniformSettings);
    };

    const isGenerateButtonDisabled = selectedTopicInstances.length === 0 || isGenerating;

    return (
        <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Customize Worksheet</h2>

            {/* Uniform Settings Section */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>General Settings</h3>
                <UniformSettingsForm
                    settings={uniformSettings}
                    onChange={handleUniformSettingChange}
                />
            </section>

            {/* Selected Topics List Section */}
            <section className={styles.section}>
                <h3 className={styles.sectionTitle}>Selected Topics ({mode} mode)</h3>
                {selectedTopicInstances.length === 0 ? (
                    <p className={styles.noTopicsMessage}>Select topics from the grid to add them here.</p>
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

            {/* Generation Status/Errors (can also be a toast/modal) */}
            {generateError && (
                <div className={styles.errorMessage}>
                    Error: {generateError}
                </div>
            )}

            {/* Generate Button (fixed at bottom of sidebar) */}
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
            </div>
        </aside>
    );
}