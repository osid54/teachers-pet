import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button, Checkbox, Input } from '@/components/ui';
import TopicModifierFields, { DEFAULT_TOPIC_MODIFIERS } from './TopicModifierFields';
import Textarea from '@/components/ui/Textarea';
import SettingsModal, { SettingsSection } from './SettingsModal';

export default function SectionSettingsModal({ section, onSave, onClose }) {
    const [title, setTitle] = useState(section.title || '');
    const [instructions, setInstructions] = useState(section.instructions || '');
    const [settings, setSettings] = useState({ pageCount: section.pageCount, problemsPerPage: section.problemsPerPage });
    const [shareModifiers, setShareModifiers] = useState(Boolean(section.shareModifiers));
    const [modifiers, setModifiers] = useState(section.sharedModifiers || section.topics?.[0]?.modifiers || DEFAULT_TOPIC_MODIFIERS);
    const isHeader = section.mode === 'header';

    const submit = event => {
        event.preventDefault();
        if (isHeader && !title.trim()) return;
        onSave(section.id, isHeader ? { title: title.trim(), instructions: instructions.trim() } : {
            ...settings, instructions: instructions.trim(), shareModifiers, sharedModifiers: shareModifiers ? modifiers : null,
        });
    };

    return (
        <SettingsModal title={isHeader ? 'Edit header' : 'Mixed topic settings'} onSubmit={submit} onClose={onClose} surfaceId="section-modal"
            actions={<Button type="submit"><Save aria-hidden="true" size={18} /> Save changes</Button>}>
            <SettingsSection title="Worksheet text">
                {isHeader && <Input label="Header title" value={title} required maxLength={100} labelPosition="top"
                    onChange={event => setTitle(event.target.value)} />}
                <Textarea label="Instructions (optional)" name="instructions" value={instructions} maxLength={500} rows={2}
                    onChange={event => setInstructions(event.target.value)} />
            </SettingsSection>
            {!isHeader && <>
                <SettingsSection title="Pages and problems">
                    <div className="grid gap-md min-[520px]:grid-cols-2">
                        <Input label="Pages" name="pageCount" type="number" min={1} max={50} maxDigits={2}
                            value={settings.pageCount} labelPosition="top"
                            onChange={event => setSettings(current => ({ ...current, pageCount: Number(event.target.value) }))} />
                        <Input label="Problems per page" name="problemsPerPage" type="number" min={1} max={50} maxDigits={2}
                            value={settings.problemsPerPage} labelPosition="top"
                            onChange={event => setSettings(current => ({ ...current, problemsPerPage: Number(event.target.value) }))} />
                    </div>
                </SettingsSection>
                <SettingsSection title="Shared settings">
                    <Checkbox label="Use the same settings for every topic" checked={shareModifiers}
                        onChange={event => setShareModifiers(event.target.checked)} />
                    {shareModifiers && <TopicModifierFields topicId="all" modifiers={modifiers} onChange={setModifiers} />}
                </SettingsSection>
            </>}
        </SettingsModal>
    );
}