import SelectedTopicInstance from './SelectedTopicInstance';
import TopicModifierFields from './TopicModifierFields';
import UniformSettingsForm from './UniformSettingsForm';
import { Button, Checkbox, Input } from '@/components/ui';

const readDrag = event => {
    try { return JSON.parse(event.dataTransfer.getData('text/plain')); } catch { return null; }
};

export default function SectionAccordion({
    sections,
    openSectionId,
    onToggleSection,
    onAddSection,
    onAddHeader,
    onRemoveEntry,
    onRenameHeader,
    onUpdateSection,
    onToggleSharedModifiers,
    onSharedModifierChange,
    onTopicModifierChange,
    onRemoveTopic,
    onReorderEntries,
    onMoveTopic,
}) {
    const handleDragStart = (event, payload) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', JSON.stringify(payload));
    };

    const handleRootDrop = (event, targetId) => {
        const drag = readDrag(event);
        if (drag?.kind !== 'entry') return;
        event.preventDefault();
        event.stopPropagation();
        if (drag.id !== targetId) onReorderEntries(drag.id, targetId);
    };

    const handleSectionDrop = (event, targetSection) => {
        const drag = readDrag(event);
        if (drag?.kind !== 'topic' || targetSection.mode === 'header') return;
        event.preventDefault();
        event.stopPropagation();
        onMoveTopic(drag.sectionId, drag.topicId, targetSection.id);
    };

    const handleTopicDrop = (event, targetSectionId, targetTopicId) => {
        const drag = readDrag(event);
        if (drag?.kind !== 'topic') return;
        event.preventDefault();
        event.stopPropagation();
        onMoveTopic(drag.sectionId, drag.topicId, targetSectionId, targetTopicId);
    };

    return (
        <div className="flex flex-col gap-sm" aria-label="Worksheet sections">
            {sections.map(section => {
                const isOpen = section.id === openSectionId;
                const isHeader = section.mode === 'header';
                const sectionLabel = section.mode === 'mixed' ? 'Mixed topics' :
                    (section.topics?.length || 0) > 1 ? 'Separate topics' : 'Single topic';
                return (
                    <article key={section.id} className="rounded-sm border border-main-300 bg-main-100"
                        onDragOver={event => {
                            const drag = readDrag(event);
                            if (drag?.kind === 'entry' || (drag?.kind === 'topic' && !isHeader)) event.preventDefault();
                        }}
                        onDrop={event => {
                            if (readDrag(event)?.kind === 'entry') handleRootDrop(event, section.id);
                            else handleSectionDrop(event, section);
                        }}>
                        {isHeader ? (
                            <div className="flex items-center gap-xs p-sm">
                                <Button type="button" variant="secondary" draggable aria-label="Drag header"
                                    title="Drag to reorder" onDragStart={event => handleDragStart(event, { kind: 'entry', id: section.id })}
                                    className="shrink-0 px-sm">⠿</Button>
                                <Input label="Header title" value={section.title} onChange={event => onRenameHeader(section.id, event.target.value)} />
                                <Button type="button" variant="secondary" aria-label="Remove header"
                                    onClick={() => onRemoveEntry(section.id)} className="shrink-0 px-sm">×</Button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-xs p-sm">
                                    <Button type="button" variant="secondary" draggable aria-label={`Drag ${section.mode} section`}
                                        title="Drag to reorder" onDragStart={event => handleDragStart(event, { kind: 'entry', id: section.id })}
                                        className="shrink-0 px-sm">⠿</Button>
                                    <button type="button" aria-expanded={isOpen} aria-controls={`section-content-${section.id}`}
                                        onClick={() => onToggleSection(section.id)}
                                        className="flex min-w-0 grow items-center gap-sm bg-transparent p-xs text-left text-main-700">
                                        <span aria-hidden="true">{isOpen ? '⌄' : '›'}</span>
                                        <span className="truncate font-semibold">{sectionLabel}</span>
                                        <span className="ml-auto shrink-0 text-sm text-main-500">{section.topics.length}</span>
                                    </button>
                                    <Button type="button" variant="secondary" aria-label={`Remove ${section.mode} section`}
                                        onClick={() => onRemoveEntry(section.id)} className="shrink-0 px-sm">×</Button>
                                </div>
                                {isOpen && <div id={`section-content-${section.id}`} className="flex flex-col gap-md border-t border-main-300 p-md">
                                    <Checkbox label="Mix topics on each page" checked={section.mode === 'mixed'}
                                        onChange={event => onUpdateSection(section.id, { mode: event.target.checked ? 'mixed' : 'single' })} />
                                    <UniformSettingsForm settings={section} onChange={event => {
                                        const { name, value } = event.target;
                                        onUpdateSection(section.id, { [name]: Number(value) });
                                    }} />
                                    <Checkbox label="Share modifiers across this section" checked={Boolean(section.shareModifiers)}
                                        onChange={event => onToggleSharedModifiers(section.id, event.target.checked)} />
                                    {section.shareModifiers && <div className="rounded-sm border border-main-300 p-sm">
                                        <h4 className="m-0 mb-sm text-sm font-semibold text-main-600">Shared modifiers</h4>
                                        <TopicModifierFields topicId="all" modifiers={section.sharedModifiers}
                                            onChange={value => onSharedModifierChange(section.id, value)} />
                                    </div>}
                                    <div className="flex flex-col gap-xs"
                                        onDragOver={event => { if (readDrag(event)?.kind === 'topic') event.preventDefault(); }}
                                        onDrop={event => handleSectionDrop(event, section)}>
                                        {section.topics.length === 0 && <p className="m-0 text-sm text-main-500">Add a topic from the catalog.</p>}
                                        {section.topics.map(topic => <SelectedTopicInstance key={topic.id} instance={topic}
                                            modifiers={section.shareModifiers ? section.sharedModifiers : topic.modifiers}
                                            sharedModifiers={section.shareModifiers}
                                            onModifierChange={(topicId, value) => onTopicModifierChange(section.id, topicId, value)}
                                            onRemove={topicId => onRemoveTopic(section.id, topicId)}
                                            dragLabel={`${topic.topicName} from ${sectionLabel}`}
                                            onDragStart={event => handleDragStart(event, { kind: 'topic', sectionId: section.id, topicId: topic.id })}
                                            onDrop={event => handleTopicDrop(event, section.id, topic.id)} />)}
                                    </div>
                                </div>}
                            </>
                        )}
                    </article>
                );
            })}
            <div className="grid grid-cols-2 gap-xs">
                <Button type="button" variant="secondary" onClick={() => onAddSection('single')}>Add single-topic section</Button>
                <Button type="button" variant="secondary" onClick={() => onAddSection('mixed')}>Add mixed section</Button>
                <Button type="button" variant="secondary" onClick={onAddHeader}>Add header</Button>
            </div>
        </div>
    );
}