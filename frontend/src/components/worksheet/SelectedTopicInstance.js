'use client';

import React from 'react';
import styles from '@/styles/components/worksheet/_selectedTopicInstance.module.scss';
import { Button, Input, Checkbox } from '@/components/ui';

/*
 * @param {object} props - Component props.
 * @param {object} props.instance - The selected topic instance object.
 * @param {'single' | 'multi'} props.mode - Current topic selection mode.
 * @param {function} props.onModifierChange - Callback to update modifiers for this instance.
 * @param {function} props.onAddInstance - Callback to add another instance of this topic.
 * @param {function} props.onRemove - Callback to remove this instance.
 */

export default function SelectedTopicInstance({
    instance,
    mode,
    onModifierChange,
    onAddInstance,
    onRemove,
}) {
    const handleModifierChange = (e) => {
        const { name, value, type, checked } = e.target;
        const updatedModifiers = { ...instance.modifiers };

        if (name.includes('.')) {
            const [group, key] = name.split('.');
            updatedModifiers[group] = {
                ...updatedModifiers[group],
                [key]: type === 'checkbox' ? checked : Number(value),
            };
        } else {
            updatedModifiers[name] = type === 'checkbox' ? checked : Number(value);
        }

        onModifierChange(instance.id, updatedModifiers);
    };

    return (
        <div className={styles.instanceCard}>
            <div className={styles.header}>
                <h4 className={styles.topicName}>{instance.topicName}</h4>
                <div className={styles.actions}>
                    {mode === 'multi' && (
                        <Button
                            onClick={() => onAddInstance(instance)}
                            variant="primary"
                            className={styles.actionButton}
                        >
                            +
                        </Button>
                    )}
                    <Button
                        onClick={() => onRemove(instance.id)}
                        variant="primary"
                        className={styles.actionButton}
                    >
                        x
                    </Button>
                </div>
            </div>

            <div className={styles.modifiersForm}>
                <div className={styles.modifiersRow}>
                    <Input
                        label="Digits"
                        type="number"
                        name="problem.digits"
                        value={instance.modifiers.problem.digits}
                        onChange={handleModifierChange}
                        min={1}
                        max={5}
                        maxDigits={1}
                        labelPosition='inline'
                    />
                    <Checkbox
                        label="Allow Negatives"
                        name="problem.neg"
                        checked={instance.modifiers.problem.neg === 1 || instance.modifiers.problem.neg === true}
                        onChange={handleModifierChange}
                        labelPosition='inline'
                    />
                </div>
                <div className={styles.modifiersRow}>
                    <Input
                        label="Decimals"
                        type="number"
                        name="problem.dec"
                        value={instance.modifiers.problem.dec}
                        onChange={handleModifierChange}
                        min={0}
                        max={5}
                        maxDigits={1}
                        labelPosition='inline'
                    />
                    <Input
                        label="Round Answer To"
                        type="number"
                        name="answer.round"
                        value={instance.modifiers.answer.round}
                        onChange={handleModifierChange}
                        min={0}
                        max={5}
                        maxDigits={1}
                        labelPosition='inline'
                    />
                </div>
            </div>
        </div>
    );
}