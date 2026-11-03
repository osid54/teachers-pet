import { Fragment, useState } from 'react';
import SelectedTopicInstance from './SelectedTopicInstance';
import UniformSettingsForm from './UniformSettingsForm';
import { Button } from '@/components/ui';
import { Heading, Layers, Plus } from 'lucide-react';
import WorksheetItemBar, { ItemPanel } from './WorksheetItemBar';

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
    onEditEntry,
    onDuplicateEntry,
    onDuplicateTopic,
    onUpdateSection,
    onToggleSharedModifiers,
    onRemoveTopic,
    onReorderEntries,
    onMoveTopic,
    onPromoteTopic,
}) {
    const [hiddenChildren, setHiddenChildren] = useState({});
    const handleDragStart = (event, payload) => {
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', JSON.stringify(payload));
    };

    const handleRootDrop = (event, targetId) => {
        const drag = readDrag(event);
        if (drag?.kind !== 'entry') return;
        event.preventDefault();
        event.stopPropagation();
        const source = sections.find(section => section.id === drag.id);
        const target = sections.find(section => section.id === targetId);
        if (source?.mode === 'single' && source.topics.length === 1 && target?.mode === 'mixed') {
            onMoveTopic(source.id, source.topics[0].id, target.id);
            return;
        }
        if (drag.id !== targetId) onReorderEntries(drag.id, targetId);
    };

    const topicDrag = (event) => {
        const drag = readDrag(event);
        if (drag?.kind === 'topic') return drag;
        const source = drag?.kind === 'entry' && sections.find(section => section.id === drag.id);
        if (source?.mode === 'single' && source.topics.length === 1) {
            return { sectionId: source.id, topicId: source.topics[0].id };
        }
        return null;
    };

    const handleSectionDrop = (event, targetSection) => {
        const drag = topicDrag(event);
        if (!drag) return;
        event.preventDefault();
        event.stopPropagation();
        if (targetSection.mode === 'mixed') onMoveTopic(drag.sectionId, drag.topicId, targetSection.id);
        else onPromoteTopic?.(drag.sectionId, drag.topicId, targetSection.id);
    };

    const handleTopicDrop = (event, targetSectionId, targetTopicId) => {
        const drag = topicDrag(event);
        if (!drag) return;
        event.preventDefault();
        event.stopPropagation();
        onMoveTopic(drag.sectionId, drag.topicId, targetSectionId, targetTopicId);
    };

    return (
        <div className="flex flex-col gap-xxs" aria-label="Worksheet sections">
            {sections.map(section => {
                const isOpen = section.id === openSectionId;
                const isHeader = section.mode === 'header';
                const isMixed = section.mode === 'mixed';
                const sectionLabel = isHeader ? section.title : isMixed ? 'Mixed topics' : section.topics?.[0]?.topicName || 'Single topic';
                const childrenOpen = !hiddenChildren[section.id];
                const panelId = `section-content-${section.id}`;
                const childrenPanelId = `section-children-${section.id}`;
                return (
                    <Fragment key={section.id}>
                    <article data-open={!isHeader && isOpen}
                        className={`rounded-sm border bg-main-100 transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none ${
                            !isHeader && isOpen ? 'border-main-500 ring-2 ring-main-500 ring-inset' : 'border-main-300'}`}
                        onDragOver={event => {
                            if (event.dataTransfer.types?.includes('text/plain')) event.preventDefault();
                        }}
                        onDrop={event => {
                            if (readDrag(event)?.kind === 'entry') handleRootDrop(event, section.id);
                            else handleSectionDrop(event, section);
                        }}>
                        <WorksheetItemBar title={sectionLabel} count={isMixed ? section.topics.length : null}
                            open={!isHeader && isOpen} panelId={panelId}
                            onToggle={isHeader ? undefined : () => onToggleSection(section.id)}
                            dragLabel={isHeader ? 'Drag header' : `Drag ${section.mode} section`}
                            onDragStart={event => handleDragStart(event, { kind: 'entry', id: section.id })}
                            editLabel={isHeader ? 'Edit header' : isMixed ? 'Edit mixed topics' : `Edit ${sectionLabel}`}
                            onEdit={() => onEditEntry?.(section.id)}
                            duplicateLabel={`Duplicate ${sectionLabel}`} onDuplicate={() => onDuplicateEntry?.(section.id)}
                            removeLabel={isHeader ? 'Remove header' : `Remove ${section.mode} section`}
                            onRemove={() => onRemoveEntry(section.id)}
                            childrenOpen={childrenOpen} childrenPanelId={childrenPanelId}
                            onToggleChildren={isMixed ? () => setHiddenChildren(current => ({ ...current, [section.id]: !current[section.id] })) : undefined} />
                        {!isHeader && <ItemPanel open={isOpen} id={panelId}>
                            <div className="flex flex-col gap-xs border-t border-main-300 px-sm py-xs">
                                <UniformSettingsForm settings={section} onChange={event => {
                                    const { name, value } = event.target;
                                    onUpdateSection(section.id, { [name]: Number(value) });
                                }} />
                                {isMixed && <label className="flex items-center gap-xs py-xxs text-xs text-main-600">
                                    <input type="checkbox" aria-label="Share modifiers across this section"
                                        className="h-4 w-4 accent-main-600" checked={Boolean(section.shareModifiers)}
                                        onChange={event => onToggleSharedModifiers(section.id, event.target.checked)} />
                                    Share modifiers
                                </label>}
                            </div>
                        </ItemPanel>}
                    </article>
                        {isMixed && <ItemPanel open={childrenOpen} id={childrenPanelId}>
                            <div className="ml-md flex flex-col gap-xxs"
                                onDragOver={event => { if (event.dataTransfer.types?.includes('text/plain')) event.preventDefault(); }}
                                onDrop={event => handleSectionDrop(event, section)}>
                                {section.topics.length === 0 && <p className="m-0 px-sm py-xs text-xs text-main-500">Add a topic from the catalog.</p>}
                                {section.topics.map(topic => <SelectedTopicInstance key={topic.id} instance={topic} settings={section}
                                    onEdit={() => onEditEntry?.(section.id, topic.id)}
                                    onDuplicate={() => onDuplicateTopic?.(section.id, topic.id)} duplicateDisabled={section.topics.length >= 4}
                                    onRemove={topicId => onRemoveTopic(section.id, topicId)}
                                    dragLabel={`${topic.topicName} from ${sectionLabel}`}
                                    onDragStart={event => handleDragStart(event, { kind: 'topic', sectionId: section.id, topicId: topic.id })}
                                    onDrop={event => handleTopicDrop(event, section.id, topic.id)} />)}
                            </div>
                        </ItemPanel>}
                    </Fragment>
                );
            })}
            <div className="grid grid-cols-2 gap-xs">
                <Button type="button" variant="secondary" aria-label="Add mixed section" title="Add mixed topics" onClick={() => onAddSection('mixed')}><Layers aria-hidden="true" size={20} /><Plus aria-hidden="true" size={14} /></Button>
                <Button type="button" variant="secondary" aria-label="Add header" title="Add header" onClick={onAddHeader}><Heading aria-hidden="true" size={20} /><Plus aria-hidden="true" size={14} /></Button>
            </div>
        </div>
    );
}