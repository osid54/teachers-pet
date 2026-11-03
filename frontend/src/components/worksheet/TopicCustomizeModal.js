import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Input } from '@/components/ui';
import TopicModifierFields, { DEFAULT_TOPIC_MODIFIERS } from './TopicModifierFields';
import { Plus, Save, X } from 'lucide-react';

const eligibleSection = section => section.mode === 'mixed' ? section.topics.length < 4 : section.topics.length === 0;

export default function TopicCustomizeModal({
    topic,
    subject,
    sections,
    initialSectionId,
    customize = false,
    editing = false,
    sharedModifiers = null,
    onConfirm,
    onClose,
}) {
    const candidates = sections.filter(section => section.mode !== 'header');
    const defaultSection = candidates.find(section => section.id === initialSectionId && eligibleSection(section)) ||
        candidates.find(eligibleSection);
    const [targetSectionId, setTargetSectionId] = useState(defaultSection?.id || 'new');
    const [topicName, setTopicName] = useState(topic.topicName || topic.name);
    const [description, setDescription] = useState(topic.description || '');
    const [modifiers, setModifiers] = useState(editing ? sharedModifiers || topic.modifiers : defaultSection?.shareModifiers
        ? defaultSection.sharedModifiers : (topic.modifiers || DEFAULT_TOPIC_MODIFIERS));
    const targetSection = candidates.find(section => section.id === targetSectionId);
    const targetCount = candidates.length;
    const shared = editing ? Boolean(sharedModifiers) : Boolean(targetSection?.shareModifiers);

    const handleTargetChange = (event) => {
        const nextId = event.target.value;
        const nextSection = candidates.find(section => section.id === nextId);
        setTargetSectionId(nextId);
        setModifiers(nextSection?.shareModifiers
            ? nextSection.sharedModifiers : (topic.modifiers || DEFAULT_TOPIC_MODIFIERS));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!editing && targetSectionId !== 'new' && (!targetSection || !eligibleSection(targetSection))) return;
        onConfirm({
            id: editing ? topic.id : uuidv4(),
            subject,
            topicId: topic.topicId || topic.id,
            topicName: topicName.trim() || topic.topicName || topic.name,
            description: description.trim(),
            modifiers: shared && !editing ? topic.modifiers || { ...DEFAULT_TOPIC_MODIFIERS }
                : shared ? sharedModifiers : modifiers,
        }, editing ? initialSectionId : targetSectionId);
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-md"
            onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="topic-modal-title"
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md bg-main-100 p-lg shadow-xl">
                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <div className="flex items-start justify-between gap-md">
                        <h2 id="topic-modal-title" className="m-0 text-lg font-bold text-main-700">
                            {editing ? `Edit ${topic.topicName || topic.name}` : customize ? `Customize ${topic.name}` : `Add ${topic.name}`}
                        </h2>
                        <Button type="button" variant="secondary" aria-label="Close topic dialog" title="Close" onClick={onClose}><X aria-hidden="true" size={20} /></Button>
                    </div>

                    {customize && <>
                        <Input label="Topic name" name="topicName" value={topicName} maxLength={100} required
                            onChange={event => setTopicName(event.target.value)} />
                        <label className="flex flex-col gap-xxs text-sm font-medium text-main-500">
                            Description
                            <textarea name="description" value={description} maxLength={500}
                                onChange={event => setDescription(event.target.value)} rows={3}
                                className="w-full rounded-sm border border-main-300 bg-main-200 p-sm text-main-600" />
                        </label>
                        <TopicModifierFields topicId={topic.topicId || topic.id} modifiers={modifiers}
                            onChange={setModifiers} disabled={shared} />
                        {shared && <p className="m-0 text-sm text-main-500">
                            Modifiers are managed by the selected parent section.
                        </p>}
                    </>}

                    {!editing && (targetCount > 1 || !defaultSection) && <label className="flex flex-col gap-xxs text-sm font-medium text-main-500">
                        Add to section
                        <select value={targetSectionId} onChange={handleTargetChange}
                            className="w-full rounded-sm border border-main-300 bg-main-200 p-sm text-main-600">
                            {candidates.map(section => <option key={section.id} value={section.id}
                                disabled={!eligibleSection(section)}>
                                {section.title || (section.mode === 'single' ? section.topics[0]?.topicName || 'Single topic' : 'Mixed topics')}
                            </option>)}
                            <option value="new">New single topic</option>
                        </select>
                    </label>}

                    <div className="flex justify-end gap-sm">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={!editing && targetSectionId !== 'new' && (!targetSection || !eligibleSection(targetSection))}>
                            {editing ? <Save aria-hidden="true" size={20} /> : <Plus aria-hidden="true" size={20} />}
                            {editing ? 'Save changes' : 'Add topic'}
                        </Button>
                    </div>
                </form>
            </section>
        </div>
    );
}