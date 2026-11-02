import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Input } from '@/components/ui';
import TopicModifierFields, { DEFAULT_TOPIC_MODIFIERS } from './TopicModifierFields';

const eligibleSection = section => section.mode !== 'header';

export default function TopicCustomizeModal({
    topic,
    subject,
    sections,
    initialSectionId,
    customize = false,
    onConfirm,
    onClose,
}) {
    const candidates = sections.filter(section => section.mode !== 'header');
    const defaultSection = candidates.find(section => section.id === initialSectionId && eligibleSection(section)) ||
        candidates.find(eligibleSection);
    const [targetSectionId, setTargetSectionId] = useState(defaultSection?.id || '');
    const [topicName, setTopicName] = useState(topic.topicName || topic.name);
    const [description, setDescription] = useState(topic.description || '');
    const [modifiers, setModifiers] = useState(defaultSection?.shareModifiers
        ? defaultSection.sharedModifiers : (topic.modifiers || DEFAULT_TOPIC_MODIFIERS));
    const targetSection = candidates.find(section => section.id === targetSectionId);
    const targetCount = candidates.length;
    const shared = Boolean(targetSection?.shareModifiers);

    const handleTargetChange = (event) => {
        const nextId = event.target.value;
        const nextSection = candidates.find(section => section.id === nextId);
        setTargetSectionId(nextId);
        setModifiers(nextSection?.shareModifiers
            ? nextSection.sharedModifiers : (topic.modifiers || DEFAULT_TOPIC_MODIFIERS));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!targetSection || !eligibleSection(targetSection)) return;
        onConfirm({
            id: uuidv4(),
            subject,
            topicId: topic.topicId || topic.id,
            topicName: topicName.trim() || topic.name,
            description: description.trim(),
            modifiers: shared ? targetSection.sharedModifiers : modifiers,
        }, targetSection.id);
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-md"
            onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="topic-modal-title"
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md bg-main-100 p-lg shadow-xl">
                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <div className="flex items-start justify-between gap-md">
                        <h2 id="topic-modal-title" className="m-0 text-lg font-bold text-main-700">
                            {customize ? `Customize ${topic.name}` : `Add ${topic.name}`}
                        </h2>
                        <Button type="button" variant="secondary" aria-label="Close topic dialog" onClick={onClose}>×</Button>
                    </div>

                    {customize && <>
                        <Input label="Topic name" name="topicName" value={topicName}
                            onChange={event => setTopicName(event.target.value)} />
                        <label className="flex flex-col gap-xxs text-sm font-medium text-main-500">
                            Description
                            <textarea name="description" value={description}
                                onChange={event => setDescription(event.target.value)} rows={3}
                                className="w-full rounded-sm border border-main-300 bg-main-200 p-sm text-main-600" />
                        </label>
                        <TopicModifierFields topicId={topic.topicId || topic.id} modifiers={modifiers}
                            onChange={setModifiers} disabled={shared} />
                        {shared && <p className="m-0 text-sm text-main-500">
                            Modifiers are managed by the selected parent section.
                        </p>}
                    </>}

                    {targetCount > 1 && <label className="flex flex-col gap-xxs text-sm font-medium text-main-500">
                        Add to section
                        <select value={targetSectionId} onChange={handleTargetChange}
                            className="w-full rounded-sm border border-main-300 bg-main-200 p-sm text-main-600">
                            {candidates.map(section => <option key={section.id} value={section.id}
                                >
                                {section.title || (section.mode === 'single' ? 'Single topic' : 'Mixed topics')}
                            </option>)}
                        </select>
                    </label>}

                    {!defaultSection && <p role="alert" className="m-0 text-main-700">
                        Add an empty single-topic or mixed section before adding a topic.
                    </p>}

                    <div className="flex justify-end gap-sm">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={!targetSection || !eligibleSection(targetSection)}>
                            <span aria-hidden="true">+</span> Add topic
                        </Button>
                    </div>
                </form>
            </section>
        </div>
    );
}