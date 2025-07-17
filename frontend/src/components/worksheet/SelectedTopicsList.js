'use client';

import React from 'react';
import styles from '@/styles/components/worksheet/_selectedTopicsList.module.scss';
import SelectedTopicInstance from './SelectedTopicInstance';

/*
 * @param {object} props - Component props.
 * @param {'single' | 'multi'} props.mode - Current topic selection mode.
 * @param {Array} props.topicInstances - Array of selected topic instance objects.
 * @param {function} props.onTopicInstanceModifierChange - Callback to update modifiers for an instance.
 * @param {function} props.onAddTopicInstance - Callback to add another instance of a topic.
 * @param {function} props.onRemoveTopicInstance - Callback to remove a topic instance.
 */

export default function SelectedTopicsList({
    mode,
    topicInstances,
    onTopicInstanceModifierChange,
    onAddTopicInstance,
    onRemoveTopicInstance,
}) {
    return (
        <div className={styles.listContainer}>
            {topicInstances.map((instance) => (
                <SelectedTopicInstance
                    key={instance.id}
                    instance={instance}
                    mode={mode}
                    onModifierChange={onTopicInstanceModifierChange}
                    onAddInstance={onAddTopicInstance}
                    onRemove={onRemoveTopicInstance}
                />
            ))}

            {topicInstances.length === 0 && (
                <p className={styles.emptyMessage}>No topics selected yet.</p>
            )}
        </div>
    );
}