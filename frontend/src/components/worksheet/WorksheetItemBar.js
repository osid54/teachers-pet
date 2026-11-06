import { useState } from 'react';
import { Button } from '@/components/ui';
import { ChevronRight, Copy, GripVertical, Pencil, X } from 'lucide-react';

export function ItemPanel({ open, id, children }) {
    return (
        <div id={id} aria-hidden={!open} inert={!open}
            className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out motion-reduce:transition-none ${
                open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
            <div className="min-h-0 overflow-hidden">{children}</div>
        </div>
    );
}

export default function WorksheetItemBar({
    title, count, open, onToggle, toggleLabel, panelId, dragLabel, dragHandle,
    editLabel, onEdit, duplicateLabel, onDuplicate, duplicateDisabled = false,
    removeLabel, onRemove, childrenOpen, onToggleChildren, childrenPanelId,
    surfaceId, isHeader = false, onRenameTitle,
}) {
    const [editingTitle, setEditingTitle] = useState(false);
    const [draftTitle, setDraftTitle] = useState(title);
    const finishTitleEdit = () => {
        const nextTitle = draftTitle.trim();
        if (nextTitle && nextTitle !== title) onRenameTitle?.(nextTitle);
        setEditingTitle(false);
    };
    const actionClass = 'h-full w-8 shrink-0 rounded-none p-0! hover:translate-y-0';
    const headerTitleClass = 'h-8 min-w-0 flex-1 self-center rounded-sm border border-main-300 bg-main-100 px-xs text-sm font-medium text-main-700';
    return (
        <div data-topic-surface={surfaceId} className={`flex h-10 min-w-0 items-stretch rounded-t-sm ${
            isHeader ? 'bg-main-200' : 'bg-main-100'} ${
            open ? 'text-main-500 shadow-[inset_0.5px_0_0_currentColor,inset_-0.5px_0_0_currentColor,inset_0_0.5px_0_currentColor]' : ''}`}>
            <Button variant="ghost" {...dragHandle} aria-label={dragLabel} title="Drag to move"
                className={`${actionClass} touch-none select-none cursor-grab! active:cursor-grabbing!`}>
                <GripVertical aria-hidden="true" size={16} />
            </Button>
            {onToggleChildren ? <Button variant="ghost" aria-label={`${childrenOpen ? 'Hide' : 'Show'} children of ${title}`}
                title={childrenOpen ? 'Hide children' : 'Show children'} aria-expanded={childrenOpen}
                aria-controls={childrenPanelId} onClick={onToggleChildren} className={actionClass}>
                <ChevronRight aria-hidden="true" size={16}
                    className={`transition-transform duration-200 motion-reduce:transition-none ${childrenOpen ? 'rotate-90' : ''}`} />
            </Button> : <span aria-hidden="true" data-children-toggle-space className="w-8 shrink-0" />}
            {onToggle ? <button type="button" title={title} aria-label={toggleLabel} aria-expanded={open} aria-controls={panelId}
                onClick={onToggle}
                className="flex min-w-0 flex-1 items-center gap-xs px-xs text-left text-sm text-main-700 focus-visible:outline-2 focus-visible:outline-main-600">
                <span className="truncate font-medium">{title}</span>
                {count != null && <span className="shrink-0 text-xs text-main-500">{count}</span>}
            </button> : editingTitle ? <input autoFocus aria-label="Header title" maxLength={100}
                value={draftTitle} onChange={event => setDraftTitle(event.target.value)} onBlur={finishTitleEdit}
                onFocus={event => event.target.select()} onKeyDown={event => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        event.currentTarget.blur();
                    }
                    if (event.key === 'Escape') {
                        event.preventDefault();
                        setEditingTitle(false);
                    }
                }} className={`${headerTitleClass} focus:border-main-500 focus:outline-1 focus:outline-main-500`} /> :
                <span title={title} onClick={isHeader && onRenameTitle ? () => {
                    setDraftTitle(title);
                    setEditingTitle(true);
                } : undefined} className="min-w-0 flex-1 self-center cursor-text truncate px-xs text-sm font-medium text-main-700">
                    <span className="truncate">{title}</span>
                </span>}
            <Button variant="ghost" aria-label={editLabel} title="Edit settings" onClick={onEdit} className={actionClass}>
                <Pencil aria-hidden="true" size={16} />
            </Button>
            <Button variant="ghost" aria-label={duplicateLabel} title="Duplicate" onClick={onDuplicate}
                disabled={duplicateDisabled} className={actionClass}>
                <Copy aria-hidden="true" size={16} />
            </Button>
            <Button variant="ghost" aria-label={removeLabel} title="Delete" onClick={onRemove} className={actionClass}>
                <X aria-hidden="true" size={16} />
            </Button>
        </div>
    );
}