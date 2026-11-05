import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableWorksheetItem({ id, data, disabled = false, children }) {
    const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
        id, data, disabled,
    });
    return (
        <div ref={setNodeRef} data-sortable-id={id} data-dragging={isDragging}
            className="flex min-w-0 flex-col gap-xxs motion-reduce:transition-none!"
            style={{ transform: CSS.Transform.toString(transform), transition,
                opacity: isDragging ? 0.25 : 1, position: 'relative', zIndex: isDragging ? 1 : undefined }}>
            {children({ ref: setActivatorNodeRef, ...attributes, ...listeners })}
        </div>
    );
}

export function WorksheetDropTarget({ id, data, disabled = false, highlighted = false, children }) {
    const { setNodeRef } = useDroppable({ id, data, disabled });
    return (
        <div ref={setNodeRef} data-drop-target={id}
            className={`min-w-0 rounded-sm transition-shadow motion-reduce:transition-none ${highlighted ? 'ring-2 ring-main-600' : ''}`}>
            {children}
        </div>
    );
}