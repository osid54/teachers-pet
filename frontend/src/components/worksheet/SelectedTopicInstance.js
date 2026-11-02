'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import TopicModifierFields from './TopicModifierFields';

export default function SelectedTopicInstance({
    instance,
    modifiers,
    sharedModifiers = false,
    onModifierChange,
    onRemove,
    onDragStart,
    onDrop,
    dragLabel = instance.topicName,
}) {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="rounded-sm border border-main-300 bg-main-100" onDragOver={event => event.preventDefault()} onDrop={onDrop}>
            <div className="flex items-center gap-xs p-xs">
                <Button type="button" variant="secondary" draggable
                    aria-label={`Drag ${dragLabel}`} title="Drag to reorder or move"
                    onDragStart={onDragStart} className="shrink-0 px-sm">⠿</Button>
                <Button type="button" variant="secondary" aria-expanded={expanded}
                    aria-label={`Toggle settings for ${instance.topicName}`}
                    onClick={() => setExpanded(value => !value)} className="min-w-0 grow justify-start text-left">
                    <span className="truncate">{instance.topicName}</span>
                    <span aria-hidden="true">{expanded ? '−' : '+'}</span>
                </Button>
                <Button type="button" variant="secondary" aria-label={`Remove ${instance.topicName}`}
                    title="Remove topic" onClick={() => onRemove(instance.id)} className="shrink-0 px-sm">×</Button>
            </div>
            {expanded && <div className="border-t border-main-300 p-sm">
                {sharedModifiers && <p className="m-0 mb-sm text-sm text-main-500">Using modifiers shared by this section.</p>}
                <TopicModifierFields topicId={instance.topicId} modifiers={modifiers}
                    onChange={value => onModifierChange(instance.id, value)} disabled={false} />
            </div>}
        </div>
    );
}