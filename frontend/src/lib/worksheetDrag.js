import { closestCenter, pointerWithin } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { worksheetDropAction } from './worksheetStructure';

export const entryDragId = id => `entry:${id}`;
export const topicDragId = id => `topic:${id}`;

export function worksheetCollisions(args, entries, keyboardIntent) {
    const active = args.active.data.current;
    const eligible = args.droppableContainers.filter(container => {
        const target = container.data.current;
        if (!target || !worksheetDropAction(entries, active, target)) {
            return container.id === args.active.id;
        }
        if (!args.pointerCoordinates) {
            if (keyboardIntent === 'container') return target.kind === 'container';
            if (keyboardIntent === 'root' || active.kind === 'entry') return target.kind === 'entry' || target.kind === 'end';
            return target.kind !== 'container';
        }
        return true;
    });
    const scopedArgs = { ...args, droppableContainers: eligible };
    if (args.pointerCoordinates) {
        const rootRects = args.droppableContainers.filter(container => ['entry', 'end'].includes(container.data.current?.kind))
            .map(container => args.droppableRects.get(container.id)).filter(Boolean);
        if (rootRects.length && (args.pointerCoordinates.x < Math.min(...rootRects.map(rect => rect.left)) - 8 ||
            args.pointerCoordinates.x > Math.max(...rootRects.map(rect => rect.right)) + 8 ||
            args.pointerCoordinates.y < Math.min(...rootRects.map(rect => rect.top)) - 16 ||
            args.pointerCoordinates.y > Math.max(...rootRects.map(rect => rect.bottom)) + 16)) return [];
        const hits = pointerWithin(scopedArgs);
        const child = hits.find(hit => eligible.find(container => container.id === hit.id)?.data.current.kind === 'topic');
        if (child) return [child];
        const container = hits.find(hit => {
            const target = eligible.find(item => item.id === hit.id);
            const rect = args.droppableRects.get(hit.id);
            return target?.data.current.kind === 'container' && rect &&
                (target.data.current.empty || (args.pointerCoordinates.y > rect.top + 8 &&
                    args.pointerCoordinates.y < rect.bottom - 8 && args.pointerCoordinates.x > rect.left + 24));
        });
        if (container) return [container];
        const root = hits.find(hit => {
            const kind = eligible.find(item => item.id === hit.id)?.data.current.kind;
            return kind === 'entry' || kind === 'end';
        });
        if (root) return [root];
        const rootCandidates = eligible.filter(container => ['entry', 'end'].includes(container.data.current.kind));
        return closestCenter({ ...args, droppableContainers: rootCandidates });
    }
    return closestCenter(scopedArgs);
}

export function worksheetKeyboardCoordinates(event, args, entries) {
    if (event.code !== 'ArrowRight' && event.code !== 'ArrowLeft') return sortableKeyboardCoordinates(event, args);
    const active = args.context.active?.data.current;
    const activeRect = args.context.collisionRect || args.context.draggingNodeRect || args.context.active?.rect.current.initial;
    if (!active || !activeRect) return;
    const candidates = Array.from(args.context.droppableContainers.values()).filter(container => {
        const target = container.data.current;
        return !container.disabled && target && worksheetDropAction(entries, active, target) &&
            (event.code === 'ArrowRight' ? target.kind === 'container' : target.kind === 'entry' || target.kind === 'end');
    });
    const center = { x: activeRect.left + activeRect.width / 2, y: activeRect.top + activeRect.height / 2 };
    const rectangles = candidates.map(container => args.context.droppableRects.get(container.id) ||
        container.node.current?.getBoundingClientRect()).filter(Boolean);
    rectangles.sort((first, second) => Math.abs(first.top - center.y) - Math.abs(second.top - center.y));
    const target = rectangles[0];
    if (!target) return;
    event.preventDefault();
    return { x: args.currentCoordinates.x + target.left + target.width / 2 - center.x,
        y: args.currentCoordinates.y + target.top + target.height / 2 - center.y };
}