'use client';

import React, { useState, useEffect } from 'react';
import { Input, Checkbox, Button } from '@/components/ui';
import styles from '@/styles/components/worksheet/_saveTemplateForm.module.scss';
import { PREDEFINED_TAGS } from '@/lib/constants';

/*
 * @param {object} props - Component props.
 * @param {Array} props.currentSelectedTopics - The selectedTopicInstances from HomePage.
 * @param {object} props.currentUniformSettings - The current uniformSettings from HomePage.
 * @param {function} props.onSubmit - Callback when form is submitted (makes API call in parent).
 * @param {function} props.onClose - Callback to close the form.
 * @param {object} [props.initialTemplateData] - Optional: Template data for editing existing template.
 * @param {boolean} [props.isSaving] - Loading state from parent's save operation.
 * @param {string} [props.saveError] - Error message from parent's save operation.
 */
export default function SaveTemplateForm({
    currentSelectedTopics,
    currentUniformSettings,
    onSubmit,
    onClose,
    initialTemplateData,
    isSaving = false,
    saveError = null,
}) {
    const [name, setName] = useState(initialTemplateData?.name || '');
    const [description, setDescription] = useState(initialTemplateData?.description || '');
    const [isPublic, setIsPublic] = useState(initialTemplateData?.is_public || false);
    const [tags, setTags] = useState(initialTemplateData?.tags || []);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (initialTemplateData) { 
            setName(initialTemplateData.name || '');
            setDescription(initialTemplateData.description || '');
            setIsPublic(initialTemplateData.is_public || false);
            setTags(initialTemplateData.tags || []);
            setError(null);
        } else {
            setName('');
            setDescription('');
            setIsPublic(false);
            setTags([]);
        }
    }, [initialTemplateData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (currentSelectedTopics.length === 0) {
            setError("Please select at least one topic to save a template.");
            return;
        }

        const templateSettings = {
            selectedTopicInstances: currentSelectedTopics,
            uniformSettings: currentUniformSettings,
        };

        const templateToSave = {
            name,
            description: description || null,
            settings_json: templateSettings,
            is_public: isPublic,
            tags,
        };

        onSubmit(templateToSave);
    };

    return (
        <div className={styles.saveFormContainer}>
            <h2 className={styles.title}>{initialTemplateData ? 'Edit Template' : 'Save Template'}</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                    label="Template Name"
                    type="text"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={100}
                    labelPosition="top"
                    className={styles.inputField}
                />
                <Input
                    label="Description (Optional)"
                    type="text"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    labelPosition="top"
                    className={styles.inputField}
                />

                <div className={styles.tagsSection}>
                    <label className={styles.tagsLabel}>Tags (select all that apply)</label>
                    <div className={styles.tagCheckboxes}>
                        {PREDEFINED_TAGS.map(tag => (
                            <Checkbox
                                key={tag}
                                label={tag}
                                checked={tags.includes(tag)}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setTags([...tags, tag]);
                                    } else {
                                        setTags(tags.filter(t => t !== tag));
                                    }
                                }}
                                labelPosition="inline"
                            />
                        ))}
                    </div>
                </div>

                <Checkbox
                    label="Make Public"
                    name="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    labelPosition="inline"
                    className={styles.inputField}
                />

                {(error || saveError) && <p className={styles.errorMessage}>{error || saveError}</p>}

                <div className={styles.formActions}>
                    <Button type="submit" isLoading={isSaving} disabled={isSaving || currentSelectedTopics.length === 0} variant="accent">
                        {initialTemplateData ? 'Update Template' : 'Save Template'}
                    </Button>
                    <Button type="button" onClick={onClose} variant="secondary" disabled={isSaving}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}