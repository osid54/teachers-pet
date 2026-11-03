'use client';

import { useState } from 'react';
import WorksheetItemBar, { ItemPanel } from './WorksheetItemBar';
import UniformSettingsForm from './UniformSettingsForm';

export default function SelectedTopicInstance({
    instance,
    settings,
    onEdit,
    onDuplicate,
    duplicateDisabled,
    onRemove,
    onDragStart,
    onDrop,
    dragLabel = instance.topicName,
}) {
    const [expanded, setExpanded] = useState(false);
    const panelId = `topic-settings-${instance.id}`;

    return (
        <article data-open={expanded}
            className={`min-w-0 rounded-sm border bg-main-100 transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none ${
                expanded ? 'border-main-500 ring-2 ring-main-500 ring-inset' : 'border-main-300'}`}
            onDragOver={event => event.preventDefault()} onDrop={onDrop}>
            <WorksheetItemBar title={instance.topicName} open={expanded}
                toggleLabel={`Toggle settings for ${instance.topicName}`} panelId={panelId}
                onToggle={() => setExpanded(value => !value)} dragLabel={`Drag ${dragLabel}`} onDragStart={onDragStart}
                editLabel={`Edit ${instance.topicName}`} onEdit={onEdit}
                duplicateLabel={`Duplicate ${instance.topicName}`} onDuplicate={onDuplicate} duplicateDisabled={duplicateDisabled}
                removeLabel={`Remove ${instance.topicName}`} onRemove={() => onRemove(instance.id)} />
            <ItemPanel open={expanded} id={panelId}>
                <div className="border-t border-main-300 px-sm py-xs">
                    <UniformSettingsForm settings={settings} disabled />
                </div>
            </ItemPanel>
        </article>
    );
}