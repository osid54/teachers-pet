'use client';

import WorksheetItemBar, { ItemPanel } from './WorksheetItemBar';
import UniformSettingsForm from './UniformSettingsForm';

export default function SelectedTopicInstance({
    instance,
    settings,
    expanded = false,
    onToggle,
    onEdit,
    onDuplicate,
    duplicateDisabled,
    onRemove,
    dragHandle,
    dragLabel = instance.topicName,
}) {
    const panelId = `topic-settings-${instance.id}`;

    return (
        <article data-open={expanded}
            className={`min-w-0 rounded-sm border-[1px] bg-main-100 transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none ${
                expanded ? 'border-main-500' : 'border-main-300'}`}
            >
            <WorksheetItemBar title={instance.topicName} open={expanded}
                surfaceId={`item:${instance.id}`}
                toggleLabel={`Toggle settings for ${instance.topicName}`} panelId={panelId}
                onToggle={onToggle} dragLabel={`Drag ${dragLabel}`} dragHandle={dragHandle}
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