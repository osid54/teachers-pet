'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Input, Checkbox, Button } from '@/components/ui';
import TemplateTagSelector from '@/components/templates/TemplateTagSelector';
import { normalizeWorksheetSettings } from '@/lib/worksheetSettings';

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
    const titleId = useId();
    const dialogRef = useRef(null);
    const [name, setName] = useState(initialTemplateData?.name || '');
    const [description, setDescription] = useState(initialTemplateData?.description || '');
    const [isPublic, setIsPublic] = useState(initialTemplateData?.is_public || false);
    const [tags, setTags] = useState(initialTemplateData?.tags || []);

    const [error, setError] = useState(null);
    const topicSections = sections.filter(section => section.mode !== 'header');
    const topicNames = topicSections.flatMap(section => section.topics.map(topic => topic.topicName || topic.topicId));
    const pageCount = topicSections.reduce((total, section) => total + section.pageCount *
        (section.mode === 'mixed' ? 1 : section.topics.length), 0);
    const problemCount = topicSections.reduce((total, section) => total + section.pageCount * section.problemsPerPage *
        (section.mode === 'mixed' ? 1 : section.topics.length), 0);

    useEffect(() => {
        const previousFocus = document.activeElement;
        const firstField = dialogRef.current?.querySelector('input:not(:disabled), textarea:not(:disabled), select:not(:disabled)');
        (firstField || dialogRef.current)?.focus({ preventScroll: true });
        return () => { if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
    }, []);

    const handleDialogKeyDown = event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            if (!isSaving) onClose?.();
            return;
        }
        if (event.key !== 'Tab') return;
        const focusable = Array.from(dialogRef.current.querySelectorAll(
            'a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ));
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) {
            setError('Template name cannot be blank.');
            return;
        }
        const templateSettings = {
            sections,
            workflowMode,
            answerKeyMode: answerKeyMode || 'none',
        };
        try {
            normalizeWorksheetSettings(templateSettings);
        } catch (validationError) {
            setError(validationError.message);
            return;
        }

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
        <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
            onKeyDown={handleDialogKeyDown}
            className="bg-main-100 rounded-md shadow-lg w-full h-full absolute top-0 left-0 z-10 flex flex-col items-center justify-center overflow-y-auto my-lg">
            <h2 id={titleId} className="text-h2 text-main-600 mt-0 mb-sm text-center">
                {initialTemplateData ? 'Edit Template' : 'Save Template'}
            </h2>
            <form onSubmit={handleSubmit} className="w-full max-w-[300px] flex flex-col gap-lg mb-xl">
                <Input label="Template Name" name="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} labelPosition="top" />
                <Input label="Description (Optional)" name="description" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} labelPosition="top" />

                <section aria-label="Worksheet summary" className="border-y border-main-300 py-sm text-sm text-main-600">
                    <h3 className="m-0 mb-xs text-sm font-semibold text-main-700">Worksheet summary</h3>
                    <p className="m-0 mb-xs">{topicNames.length ? topicNames.join(', ') : 'No topics selected'}</p>
                    <dl className="m-0 grid grid-cols-2 gap-x-sm gap-y-xxs">
                        <dt>Sections</dt><dd className="m-0 text-right">{topicSections.length}</dd>
                        <dt>Topics</dt><dd className="m-0 text-right">{topicNames.length}</dd>
                        <dt>Pages</dt><dd className="m-0 text-right">{pageCount}</dd>
                        <dt>Problems</dt><dd className="m-0 text-right">{problemCount.toLocaleString()}</dd>
                        <dt>Answer key</dt><dd className="m-0 text-right">{{ none: 'None', inline: 'Inline', separate: 'After' }[answerKeyMode] || 'None'}</dd>
                    </dl>
                </section>

                <TemplateTagSelector label="Tags (optional)" value={tags} onChange={setTags} disabled={isSaving} />

                <fieldset className="m-0 min-w-0 border-t border-main-300 pt-sm">
                    <legend className="px-0 text-sm font-semibold text-main-700">Sharing</legend>
                    <Checkbox label="Make Public" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} disabled={isSaving} />
                    <p className="m-0 mt-xs text-xs leading-relaxed text-main-500">
                        Public templates appear in Community. Anyone can view their details and use a copy. Templates stay private unless you enable this.
                    </p>
                </fieldset>

                {(error || saveError) && <p role="alert" className="text-main-700 text-sm mb-md">{error || saveError}</p>}

                <div className="flex gap-md justify-center mt-lg">
                    <Button type="submit" isLoading={isSaving} disabled={isSaving} variant="primary">
                        {initialTemplateData ? 'Update Template' : 'Save Template'}
                    </Button>
                    <Button type="button" onClick={onClose} variant="secondary" disabled={isSaving}>Cancel</Button>
                </div>
            </form>
        </div>
    );
}