import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button, Input } from '@/components/ui';
import TopicModifierFields, { DEFAULT_TOPIC_MODIFIERS } from './TopicModifierFields';
import { Plus, Save } from 'lucide-react';
import { supportedCurriculumData } from '@/lib/curriculum';
import Textarea from '@/components/ui/Textarea';
import SettingsModal, { SettingsSection } from './SettingsModal';

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
    const targetSection = sections.find(section => section.id === initialSectionId && section.mode === 'mixed');
    const targetSectionId = editing ? initialSectionId : targetSection?.id || 'new';
    const [topicName, setTopicName] = useState(topic.topicName || topic.name);
    const [instructions, setInstructions] = useState(topic.instructions || '');
    const catalogTopic = supportedCurriculumData.find(item => item.subject === subject)?.topics
        .find(item => item.id === (topic.topicId || topic.id));
    const description = catalogTopic?.description || topic.description || '';
    const [modifiers, setModifiers] = useState(editing ? sharedModifiers || topic.modifiers : targetSection?.shareModifiers
        ? targetSection.sharedModifiers : (topic.modifiers || DEFAULT_TOPIC_MODIFIERS));
    const shared = editing ? Boolean(sharedModifiers) : Boolean(targetSection?.shareModifiers);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!editing && targetSection && targetSection.topics.length >= 4) return;
        onConfirm({
            id: editing ? topic.id : uuidv4(),
            subject,
            topicId: topic.topicId || topic.id,
            topicName: topicName.trim() || topic.topicName || topic.name,
            instructions: instructions.trim(),
            modifiers: shared && !editing ? topic.modifiers || { ...DEFAULT_TOPIC_MODIFIERS }
                : shared ? sharedModifiers : modifiers,
        }, editing ? initialSectionId : targetSectionId);
    };

    return (
        <SettingsModal title={editing ? `Edit ${topic.topicName || topic.name}` : customize ? `Customize ${topic.name}` : `Add ${topic.name}`}
            description={description} onClose={onClose} onSubmit={handleSubmit} surfaceId="topic-modal"
            actions={<Button type="submit" disabled={!editing && targetSection?.topics.length >= 4}>
                {editing ? <Save aria-hidden="true" size={18} /> : <Plus aria-hidden="true" size={18} />}
                {editing ? 'Save changes' : 'Add topic'}
            </Button>}>
            {customize && <>
                <SettingsSection title="Worksheet text">
                    <Input label="Topic name" name="topicName" value={topicName} maxLength={100} required labelPosition="top"
                        onChange={event => setTopicName(event.target.value)} />
                    <Textarea label="Instructions (optional)" name="instructions" value={instructions} maxLength={500}
                        onChange={event => setInstructions(event.target.value)} rows={2} />
                </SettingsSection>
                {shared && <p role="status" className="m-0 text-sm text-main-500">
                    Number and answer settings are shared with the mixed topic group.
                </p>}
                <TopicModifierFields topicId={topic.topicId || topic.id} modifiers={modifiers} onChange={setModifiers} disabled={shared} />
            </>}
            {!editing && targetSection?.topics.length >= 4 && <p role="alert" className="m-0 text-sm text-main-700">
                This mixed group already has four topics.
            </p>}
        </SettingsModal>
    );
}