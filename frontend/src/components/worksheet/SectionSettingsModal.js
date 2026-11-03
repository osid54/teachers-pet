import { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Button, Checkbox, Input } from '@/components/ui';
import TopicModifierFields, { DEFAULT_TOPIC_MODIFIERS } from './TopicModifierFields';
import UniformSettingsForm from './UniformSettingsForm';

export default function SectionSettingsModal({ section, onSave, onClose }) {
    const [title, setTitle] = useState(section.title || '');
    const [settings, setSettings] = useState({ pageCount: section.pageCount, problemsPerPage: section.problemsPerPage });
    const [shareModifiers, setShareModifiers] = useState(Boolean(section.shareModifiers));
    const [modifiers, setModifiers] = useState(section.sharedModifiers || section.topics?.[0]?.modifiers || DEFAULT_TOPIC_MODIFIERS);
    const isHeader = section.mode === 'header';

    const submit = event => {
        event.preventDefault();
        if (isHeader && !title.trim()) return;
        onSave(section.id, isHeader ? { title: title.trim() } : {
            ...settings, shareModifiers, sharedModifiers: shareModifiers ? modifiers : null,
        });
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-md"
            onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="section-modal-title"
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-md bg-main-100 p-lg shadow-xl">
                <form onSubmit={submit} className="flex flex-col gap-md">
                    <div className="flex items-center justify-between gap-md">
                        <h2 id="section-modal-title" className="m-0 text-lg font-bold text-main-700">
                            {isHeader ? 'Edit header' : 'Mixed topic settings'}
                        </h2>
                        <Button variant="ghost" onClick={onClose} aria-label="Close item dialog" title="Close">
                            <X aria-hidden="true" size={20} />
                        </Button>
                    </div>
                    {isHeader ? <Input label="Header title" value={title} required maxLength={100}
                        onChange={event => setTitle(event.target.value)} /> : <>
                        <UniformSettingsForm settings={settings} onChange={event => setSettings(current => ({
                            ...current, [event.target.name]: Number(event.target.value),
                        }))} />
                        <Checkbox label="Share modifiers across this section" checked={shareModifiers}
                            onChange={event => setShareModifiers(event.target.checked)} />
                        <TopicModifierFields topicId="all" modifiers={modifiers} onChange={setModifiers} disabled={!shareModifiers} />
                    </>}
                    <div className="flex justify-end gap-sm">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit"><Save aria-hidden="true" size={18} /> Save changes</Button>
                    </div>
                </form>
            </section>
        </div>
    );
}