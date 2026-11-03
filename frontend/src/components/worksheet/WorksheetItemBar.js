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
    title, count, open, onToggle, toggleLabel, panelId, dragLabel, onDragStart,
    editLabel, onEdit, duplicateLabel, onDuplicate, duplicateDisabled = false,
    removeLabel, onRemove, childrenOpen, onToggleChildren, childrenPanelId,
}) {
    const actionClass = 'h-full w-8 shrink-0 rounded-none p-0! hover:translate-y-0';
    return (
        <div className={`flex h-10 min-w-0 items-stretch ${open ? 'bg-main-200' : 'bg-main-100'}`}>
            <Button variant="ghost" draggable aria-label={dragLabel} title="Drag to move"
                onDragStart={onDragStart} className={actionClass}>
                <GripVertical aria-hidden="true" size={16} />
            </Button>
            {onToggleChildren && <Button variant="ghost" aria-label={`${childrenOpen ? 'Hide' : 'Show'} children of ${title}`}
                title={childrenOpen ? 'Hide children' : 'Show children'} aria-expanded={childrenOpen}
                aria-controls={childrenPanelId} onClick={onToggleChildren} className={actionClass}>
                <ChevronRight aria-hidden="true" size={16}
                    className={`transition-transform duration-200 motion-reduce:transition-none ${childrenOpen ? 'rotate-90' : ''}`} />
            </Button>}
            {onToggle ? <button type="button" title={title} aria-label={toggleLabel} aria-expanded={open} aria-controls={panelId}
                onClick={onToggle}
                className="flex min-w-0 flex-1 items-center gap-xs px-xs text-left text-sm text-main-700 hover:bg-main-200/40 focus-visible:outline-2 focus-visible:outline-main-600">
                <span className="truncate font-medium">{title}</span>
                {count != null && <span className="shrink-0 text-xs text-main-500">{count}</span>}
            </button> : <span title={title} className="min-w-0 flex-1 self-center truncate px-xs text-sm font-medium text-main-700">{title}</span>}
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