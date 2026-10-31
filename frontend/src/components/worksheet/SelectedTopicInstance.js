'use client';

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
        let nextValue = type === 'checkbox' ? checked : value;
        if (type === 'number') nextValue = value === '' ? 0 : Number(value);
        if (name === 'negative_probability_percent') {
            updatedModifiers.negative_probability = nextValue / 100;
        } else if (name === 'division_mode') {
            updatedModifiers.division_mode = nextValue;
            if (nextValue === 'remainder') {
                updatedModifiers.decimal_places = 0;
                updatedModifiers.negative_probability = 0;
            }
        } else if (name === 'answer_rounding') {
            updatedModifiers.answer_rounding = value === '' ? null : Number(value);
        } else {
            updatedModifiers[name] = nextValue;
        }

        onModifierChange(instance.id, updatedModifiers);
    };

    return (
        <div className="bg-main-100 rounded-md p-md shadow-sm flex flex-col gap-md relative">
            <div className="flex justify-between items-center flex-wrap gap-sm">
                <h4 className="text-base text-main-500 m-0 font-semibold grow">
                    {instance.topicName}
                </h4>
                <div className="flex gap-xs">
                    {mode === 'mixed' && (
                        <Button onClick={() => onAddInstance(instance)} aria-label={`Duplicate ${instance.topicName}`} variant="primary" className="p-xs w-[30px] h-[30px] text-sm">+</Button>
                    )}
                    <Button onClick={() => onRemove(instance.id)} aria-label={`Remove ${instance.topicName}`} variant="primary" className="p-xs w-[30px] h-[30px] text-sm">x</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-sm min-[769px]:grid-cols-2 min-[769px]:gap-md">
                <Input label="Integer-part digits" type="number" name="digits" value={instance.modifiers.digits} onChange={handleModifierChange} min={1} max={5} maxDigits={1} />
                <label className="flex flex-col gap-xxs text-sm text-main-500">Digit rule
                    <select className="border border-main-300 rounded-sm bg-main-200 text-main-600 p-xs" name="digit_mode" value={instance.modifiers.digit_mode} onChange={handleModifierChange}>
                        <option value="up_to">Up to this many</option><option value="strict">Exactly this many</option>
                    </select>
                </label>
                <Input label="Decimal places" type="number" name="decimal_places" value={instance.modifiers.decimal_places} onChange={handleModifierChange} min={0} max={5} maxDigits={1} />
                <Input label="Negative chance per operand (%)" type="number" name="negative_probability_percent" value={Math.round(instance.modifiers.negative_probability * 100)} onChange={handleModifierChange} min={0} max={100} maxDigits={3} />
                {instance.topicId === 'subtraction' && <Checkbox label="Allow negative answers" name="allow_negative_answers" checked={instance.modifiers.allow_negative_answers} onChange={handleModifierChange} />}
                {instance.topicId === 'division' && <label className="flex flex-col gap-xxs text-sm text-main-500">Division rule
                    <select className="border border-main-300 rounded-sm bg-main-200 text-main-600 p-xs" name="division_mode" value={instance.modifiers.division_mode} onChange={handleModifierChange}>
                        <option value="exact">Exact quotient</option><option value="remainder">Remainder</option><option value="decimal">Decimal quotient</option>
                    </select>
                </label>}
                <label className="flex flex-col gap-xxs text-sm text-main-500">Answer rounding (decimal places)
                    <select className="border border-main-300 rounded-sm bg-main-200 text-main-600 p-xs" name="answer_rounding" value={instance.modifiers.answer_rounding ?? ''} onChange={handleModifierChange}>
                        <option value="">Default</option>{[0, 1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value}</option>)}
                    </select>
                </label>
            </div>
        </div>
    );
}