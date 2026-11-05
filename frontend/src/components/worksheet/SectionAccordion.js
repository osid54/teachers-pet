import { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SelectedTopicInstance from './SelectedTopicInstance';
import UniformSettingsForm from './UniformSettingsForm';
import { Button } from '@/components/ui';
import { GripVertical, Heading, Layers, Link2, Plus } from 'lucide-react';
import WorksheetItemBar, { ItemPanel } from './WorksheetItemBar';
import SortableWorksheetItem, { WorksheetDropTarget } from './SortableWorksheetItem';
import { entryDragId, topicDragId, worksheetCollisions, worksheetKeyboardCoordinates } from '@/lib/worksheetDrag';
import { worksheetDropAction } from '@/lib/worksheetStructure';

function DropPreview({ title, empty = false }) {
    return <div aria-hidden="true" data-drop-preview className={`flex w-full min-w-0 items-center gap-xs rounded-sm border-[1px] border-dashed border-main-500 bg-main-200/60 px-sm text-sm text-main-600 ${empty ? 'h-16' : 'h-10'}`}>
        <GripVertical size={16} className="shrink-0" /><span className="truncate">{title}</span>
    </div>;
}

export default function SectionAccordion({
    sections,
    openSectionId,
    onToggleSection,
    onAddSection,
    onAddHeader,
    onRemoveEntry,
    onEditEntry,
    onRenameHeader,
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
    const [openTopicId, setOpenTopicId] = useState(null);
    const previousTopics = useRef(new Map(sections.filter(section => section.mode === 'mixed')
        .map(section => [section.id, new Set(section.topics.map(topic => topic.id))])));
    useEffect(() => {
        const addedTo = sections.filter(section => section.mode === 'mixed' &&
            section.topics.some(topic => !previousTopics.current.get(section.id)?.has(topic.id))).map(section => section.id);
        previousTopics.current = new Map(sections.filter(section => section.mode === 'mixed')
            .map(section => [section.id, new Set(section.topics.map(topic => topic.id))]));
        if (addedTo.length) setHiddenChildren(current => {
            if (!addedTo.some(id => current[id])) return current;
            const next = { ...current };
            addedTo.forEach(id => { next[id] = false; });
            return next;
        });
    }, [sections]);
    const [activeDrag, setActiveDrag] = useState(null);
    const [dropAction, setDropAction] = useState(null);
    const pointer = useRef(null);
    const keyboardIntent = useRef(null);
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: (event, args) => {
            keyboardIntent.current = event.code === 'ArrowRight' ? 'container' : event.code === 'ArrowLeft' ? 'root' : null;
            return worksheetKeyboardCoordinates(event, args, sections);
        } }),
    );
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const actionFor = event => {
        if (!event.over) return null;
        const centerY = pointer.current?.y ?? ((event.active.rect.current.translated?.top ?? 0) +
            (event.active.rect.current.translated?.height ?? 0) / 2);
        const position = centerY > event.over.rect.top + event.over.rect.height / 2 ? 'after' : 'before';
        return worksheetDropAction(sections, event.active.data.current, event.over.data.current, position);
    };
    const resetDrag = () => {
        setActiveDrag(null);
        setDropAction(null);
        pointer.current = null;
        keyboardIntent.current = null;
    };
    const finishDrag = event => {
        const action = actionFor(event);
        if (action?.type === 'reorder') onReorderEntries(action.sourceId, action.targetId, action.position);
        if (action?.type === 'move') {
            onMoveTopic(action.sourceId, action.topicId, action.targetId, action.targetTopicId, action.position);
            setHiddenChildren(current => ({ ...current, [action.targetId]: false }));
        }
        if (action?.type === 'promote') onPromoteTopic?.(action.sourceId, action.topicId, action.targetId, action.position);
        resetDrag();
    };

    return (
        <DndContext sensors={sensors}
            collisionDetection={args => {
                pointer.current = args.pointerCoordinates;
                return worksheetCollisions(args, sections, keyboardIntent.current);
            }}
            onDragStart={event => setActiveDrag(event.active.data.current)}
            onDragMove={event => setDropAction(actionFor(event))}
            onDragOver={event => setDropAction(actionFor(event))}
            onDragCancel={resetDrag} onDragEnd={finishDrag}
            accessibility={{ screenReaderInstructions: {
                draggable: 'Press Space to pick up an item. Use Up and Down to sort, Right to move into a mixed item, Left to move to the root list, Space to drop, or Escape to cancel.',
            }, announcements: {
                onDragStart: ({ active }) => `Picked up ${active.data.current.title}.`,
                onDragOver: ({ over }) => over ? `Over ${over.data.current.title || 'the end of the worksheet'}.` : 'Outside the item list.',
                onDragEnd: ({ active }) => `Dropped ${active.data.current.title}.`,
                onDragCancel: () => 'Drag cancelled. The worksheet is unchanged.',
            } }}>
        <div className="flex flex-col gap-xxs" aria-label="Worksheet sections">
            <SortableContext items={sections.map(section => entryDragId(section.id))} strategy={verticalListSortingStrategy}>
            {sections.map(section => {
                const isOpen = section.id === openSectionId;
                const isHeader = section.mode === 'header';
                const isMixed = section.mode === 'mixed';
                const sectionLabel = isHeader ? section.title : isMixed ? 'Mixed topics' : section.topics?.[0]?.topicName || 'Single topic';
                const receiving = dropAction?.type === 'move' && dropAction.targetId === section.id;
                const crossMove = receiving && dropAction.sourceId !== section.id;
                const childrenOpen = !hiddenChildren[section.id] || receiving;
                const panelId = `section-content-${section.id}`;
                const childrenPanelId = `section-children-${section.id}`;
                return (
                    <Fragment key={section.id}>
                    {dropAction?.type === 'promote' && dropAction.targetId === section.id && dropAction.position === 'before' && <DropPreview title={activeDrag?.title} />}
                    <SortableWorksheetItem id={entryDragId(section.id)} data={{ kind: 'entry', sectionId: section.id, title: sectionLabel, mode: section.mode }}>
                    {dragHandle => <>
                    <WorksheetDropTarget id={`inside:${section.id}`} disabled={!isMixed}
                        data={{ kind: 'container', sectionId: section.id, title: sectionLabel, empty: section.topics?.length === 0 }}
                        highlighted={receiving}>
                    <article data-open={!isHeader && isOpen}
                        className={`rounded-sm border-[1px] bg-main-100 transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none ${
                            !isHeader && isOpen ? 'border-main-500' : 'border-main-300'}`}
                        >
                        <WorksheetItemBar title={sectionLabel} count={isMixed ? section.topics.length : null}
                            isHeader={isHeader}
                            onRenameTitle={isHeader ? title => onRenameHeader?.(section.id, title) : undefined}
                            surfaceId={section.mode === 'single' ? `item:${section.topics[0]?.id}` : `section:${section.id}`}
                            open={!isHeader && isOpen} panelId={panelId}
                            onToggle={isHeader ? undefined : () => onToggleSection(section.id)}
                            dragLabel={isHeader ? 'Drag header' : `Drag ${section.mode} section`}
                            dragHandle={dragHandle}
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
                                }}>
                                {isMixed && <label title="Share modifiers" className="relative shrink-0 cursor-pointer text-main-600">
                                    <input type="checkbox" aria-label="Share modifiers across this section"
                                        className="peer sr-only" checked={Boolean(section.shareModifiers)}
                                        onChange={event => onToggleSharedModifiers(section.id, event.target.checked)} />
                                    <span className="flex h-8 w-8 items-center justify-center rounded-sm border border-main-300 hover:bg-main-200 peer-checked:bg-main-300 peer-checked:text-main-700 peer-focus-visible:outline-2 peer-focus-visible:outline-main-600">
                                        <Link2 aria-hidden="true" size={16} />
                                    </span>
                                </label>}
                                </UniformSettingsForm>
                            </div>
                        </ItemPanel>}
                    </article>
                        {isMixed && <ItemPanel open={childrenOpen} id={childrenPanelId}>
                            <SortableContext items={section.topics.map(topic => topicDragId(topic.id))} strategy={verticalListSortingStrategy}>
                            <div className="ml-md flex flex-col gap-xxs">
                                {section.topics.length === 0 && <div data-empty-mixed
                                    className={`flex min-h-16 items-center justify-center rounded-sm text-xs text-main-500 ${
                                        crossMove ? '' : 'border-[1px] border-dashed border-main-300 px-sm'}`}>
                                    {crossMove ? <DropPreview title={activeDrag?.title} empty /> : 'No topics'}
                                </div>}
                                {section.topics.map(topic => <Fragment key={topic.id}>
                                    {crossMove && dropAction.targetTopicId === topic.id && dropAction.position === 'before' && <DropPreview title={activeDrag?.title} />}
                                    <SortableWorksheetItem id={topicDragId(topic.id)} disabled={!childrenOpen}
                                        data={{ kind: 'topic', sectionId: section.id, topicId: topic.id, title: topic.topicName }}>
                                    {topicHandle => <SelectedTopicInstance instance={topic} settings={section}
                                    expanded={openTopicId === topic.id}
                                    onToggle={() => setOpenTopicId(current => current === topic.id ? null : topic.id)}
                                    onEdit={() => onEditEntry?.(section.id, topic.id)}
                                    onDuplicate={() => onDuplicateTopic?.(section.id, topic.id)} duplicateDisabled={section.topics.length >= 4}
                                    onRemove={topicId => onRemoveTopic(section.id, topicId)}
                                    dragLabel={`${topic.topicName} from ${sectionLabel}`}
                                    dragHandle={topicHandle} />}
                                    </SortableWorksheetItem>
                                    {crossMove && dropAction.targetTopicId === topic.id && dropAction.position === 'after' && <DropPreview title={activeDrag?.title} />}
                                </Fragment>)}
                                {crossMove && section.topics.length > 0 && !dropAction.targetTopicId && <DropPreview title={activeDrag?.title} />}
                            </div>
                            </SortableContext>
                        </ItemPanel>}
                    </WorksheetDropTarget>
                    </>}
                    </SortableWorksheetItem>
                    {dropAction?.type === 'promote' && dropAction.targetId === section.id && dropAction.position === 'after' && <DropPreview title={activeDrag?.title} />}
                    </Fragment>
                );
            })}
            </SortableContext>
            <WorksheetDropTarget id="worksheet-end" data={{ kind: 'end', title: 'End of worksheet' }}>
                {activeDrag ? <div className="min-h-10">
                    {dropAction?.targetId == null && dropAction && <DropPreview title={activeDrag.title} />}
                </div> : <div className="h-1" />}
            </WorksheetDropTarget>
            <div className="grid grid-cols-2 gap-xs">
                <Button type="button" variant="secondary" aria-label="Add mixed section" title="Add mixed topics" onClick={() => onAddSection('mixed')}><Layers aria-hidden="true" size={20} /><Plus aria-hidden="true" size={14} /></Button>
                <Button type="button" variant="secondary" aria-label="Add header" title="Add header" onClick={onAddHeader}><Heading aria-hidden="true" size={20} /><Plus aria-hidden="true" size={14} /></Button>
            </div>
        </div>
        {createPortal(<DragOverlay zIndex={1100} dropAnimation={reduceMotion ? null : { duration: 200, easing: 'ease-out' }}>
            {activeDrag && <div data-drag-overlay className="pointer-events-none flex h-10 items-center gap-xs rounded-sm border border-main-600 bg-main-100 px-sm text-sm text-main-700 shadow-lg">
                <GripVertical aria-hidden="true" size={16} /><span className="truncate font-medium">{activeDrag.title}</span>
            </div>}
        </DragOverlay>, document.body)}
        </DndContext>
    );
}