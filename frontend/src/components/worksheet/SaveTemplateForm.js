'use client';

import React, { useState, useEffect } from 'react';
import { Input, Checkbox, Button } from '@/components/ui';
import { PREDEFINED_TAGS } from '@/lib/constants';

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
            const msg = "Please select at least one topic to save a template.";
            setError(msg);
            toast.error(msg);
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
        <div className="bg-main-100 rounded-md shadow-lg w-full h-full absolute top-0 left-0 z-10 flex flex-col items-center justify-center overflow-y-auto my-lg">
            <h2 className="text-h2 text-main-600 mt-0 mb-sm text-center">
                {initialTemplateData ? 'Edit Template' : 'Save Template'}
            </h2>
            <form onSubmit={handleSubmit} className="w-full max-w-[300px] flex flex-col gap-lg mb-xl">
                <Input label="Template Name" name="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} labelPosition="top" />
                <Input label="Description (Optional)" name="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} labelPosition="top" />

                <div className="mb-md text-right w-full">
                    <label className="block mb-sm text-sm text-main-600 font-medium text-center">Tags (select all that apply)</label>
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-sm">
                        {PREDEFINED_TAGS.map(tag => (
                            <Checkbox key={tag} label={tag} checked={tags.includes(tag)} onChange={(e) => e.target.checked ? setTags([...tags, tag]) : setTags(tags.filter(t => t !== tag))} />
                        ))}
                    </div>
                </div>

                <Checkbox label="Make Public" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="text-right" />

                {(error || saveError) && <p className="text-main-400 text-sm mb-md">{error || saveError}</p>}

                <div className="flex gap-md justify-center mt-lg">
                    <Button type="submit" isLoading={isSaving} disabled={isSaving || currentSelectedTopics.length === 0} variant="primary">
                        {initialTemplateData ? 'Update Template' : 'Save Template'}
                    </Button>
                    <Button onClick={onClose} variant="secondary" disabled={isSaving}>Cancel</Button>
                </div>
            </form>
        </div>
    );
}