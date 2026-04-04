'use client';

import React from 'react';
import SelectedTopicInstance from './SelectedTopicInstance';

export default function SelectedTopicsList({
    mode,
    topicInstances,
    onTopicInstanceModifierChange,
    onAddTopicInstance,
    onRemoveTopicInstance,
}) {
    return (
        <div className="flex flex-col overflow-y-auto pr-0 scrollbar-thin 
                        max-h-[44vh] scrollbar-thumb-main-500 scrollbar-track-main-100">
            {topicInstances.map((instance) => (
                <SelectedTopicInstance key={instance.id} instance={instance} mode={mode} onModifierChange={onTopicInstanceModifierChange} onAddInstance={onAddTopicInstance} onRemove={onRemoveTopicInstance} />
            ))}
            {topicInstances.length === 0 && <p className="text-sm text-main-500 text-center p-sm">No topics selected yet.</p>}
        </div>
    );
}