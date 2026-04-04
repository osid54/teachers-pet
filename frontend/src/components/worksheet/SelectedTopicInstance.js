'use client';

import React from 'react';
import { Button, Input, Checkbox } from '@/components/ui';

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

        let finalValueForState;

        if (type === 'checkbox') {
            finalValueForState = checked;
        } else {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                finalValueForState = 0;
            } else {
                finalValueForState = numValue;
            }
        }

        if (typeof name === 'string' && name.includes('.')) {
            const [group, key] = name.split('.');
            updatedModifiers[group] = {
                ...(updatedModifiers[group] || {}),
                [key]: finalValueForState,
            };
        } else {
            updatedModifiers[name] = finalValueForState;
        }

        onModifierChange(instance.id, updatedModifiers);
    };

    return (
        <div className="bg-main-100 rounded-md m-sm p-sm shadow-sm flex flex-col gap-md relative border border-dashed border-main-500">
            <div className="flex justify-between items-center flex-wrap gap-sm">
                <h4 className="text-base text-main-500 m-0 font-semibold grow text-center pb-xxs border-b border-main-300">
                    {instance.topicName}
                </h4>
                <div className="flex gap-xs">
                    {mode === 'multi' && (
                        <Button onClick={() => onAddInstance(instance)} variant="primary" className="p-xs w-[30px] h-[30px] text-sm">+</Button>
                    )}
                    <Button onClick={() => onRemove(instance.id)} variant="primary" className="p-xs w-[30px] h-[30px] text-sm">x</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-sm sm:grid-cols-2 sm:gap-md">
                <Input label="Digits" type="number" name="problem.digits" value={instance.modifiers.problem.digits} onChange={handleModifierChange} min={1} max={5} maxDigits={1} />
                <Checkbox label="Allow Negatives" name="problem.neg" checked={instance.modifiers.problem.neg === 1 || instance.modifiers.problem.neg === true} onChange={handleModifierChange} />
                <Input label="Decimals" type="number" name="problem.dec" value={instance.modifiers.problem.dec} onChange={handleModifierChange} min={0} max={5} maxDigits={1} />
                <Input label="Round Answer To" type="number" name="answer.round" value={instance.modifiers.answer.round} onChange={handleModifierChange} min={0} max={5} maxDigits={1} />
            </div>
        </div>
    );
}