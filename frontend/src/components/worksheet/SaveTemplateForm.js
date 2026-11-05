'use client';

import { useState } from 'react';
import { Input, Checkbox, Button } from '@/components/ui';
import TemplateTagSelector from '@/components/templates/TemplateTagSelector';

export default function SaveTemplateForm({
    sections,
    workflowMode = 'accordion',
    answerKeyMode,
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

    const [error, setError] = useState(null);
    const topicSections = sections.filter(section => section.mode !== 'header');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) {
            setError('Template name cannot be blank.');
            return;
        }
        if (!topicSections.length || topicSections.some(section => !section.topics.length ||
            (section.mode === 'mixed' && section.topics.length < 2)) || sections.at(-1)?.mode === 'header') {
            const msg = "Add topics to each section and keep headers before a topic section.";
            setError(msg);
            return;
        }
        if (sections.some(section => section.mode === 'header' && !section.title.trim())) {
            setError('Every header needs a title.');
            return;
        }

        const templateSettings = {
            sections,
            workflowMode,
            answerKeyMode,
        };

        const templateToSave = {
            name: name.trim(),
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

                <TemplateTagSelector label="Tags (optional)" value={tags} onChange={setTags} disabled={isSaving} />

                <Checkbox label="Make Public" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="text-right" />

                {(error || saveError) && <p role="alert" className="text-main-700 text-sm mb-md">{error || saveError}</p>}

                <div className="flex gap-md justify-center mt-lg">
                    <Button type="submit" isLoading={isSaving} disabled={isSaving || !topicSections.length ||
                        topicSections.some(section => !section.topics.length || (section.mode === 'mixed' && section.topics.length < 2)) ||
                        sections.at(-1)?.mode === 'header' || sections.some(section => section.mode === 'header' && !section.title.trim())} variant="primary">
                        {initialTemplateData ? 'Update Template' : 'Save Template'}
                    </Button>
                    <Button onClick={onClose} variant="secondary" disabled={isSaving}>Cancel</Button>
                </div>
            </form>
        </div>
    );
}