import { Checkbox, Input } from '@/components/ui';

export const DEFAULT_TOPIC_MODIFIERS = {
    digits: 2,
    digit_mode: 'up_to',
    decimal_places: 0,
    negative_probability: 0,
    allow_negative_answers: false,
    division_mode: 'exact',
    answer_rounding: null,
};

export default function TopicModifierFields({ topicId, modifiers, onChange, disabled = false }) {
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        const next = { ...modifiers };
        let nextValue = type === 'checkbox' ? checked : value;
        if (type === 'number') nextValue = value === '' ? 0 : Number(value);
        if (name === 'negative_probability_percent') {
            next.negative_probability = nextValue / 100;
        } else if (name === 'answer_rounding') {
            next.answer_rounding = value === '' ? null : Number(value);
        } else if (name === 'division_mode') {
            next.division_mode = nextValue;
            if (nextValue === 'remainder') {
                next.decimal_places = 0;
                next.negative_probability = 0;
            }
        } else {
            next[name] = nextValue;
        }
        onChange(next);
    };

    return (
        <div className="grid grid-cols-1 gap-sm min-[769px]:grid-cols-2 min-[769px]:gap-md">
            <Input label="Integer-part digits" type="number" name="digits" value={modifiers.digits}
                onChange={handleChange} min={1} max={5} maxDigits={1} disabled={disabled} />
            <label className="flex flex-col gap-xxs text-sm text-main-500">Digit rule
                <select className="border border-main-300 rounded-sm bg-main-200 text-main-600 p-xs"
                    name="digit_mode" value={modifiers.digit_mode} onChange={handleChange} disabled={disabled}>
                    <option value="up_to">Up to this many</option><option value="strict">Exactly this many</option>
                </select>
            </label>
            <Input label="Decimal places" type="number" name="decimal_places" value={modifiers.decimal_places}
                onChange={handleChange} min={0} max={5} maxDigits={1} disabled={disabled} />
            <Input label="Negative chance per operand (%)" type="number" name="negative_probability_percent"
                value={Math.round(modifiers.negative_probability * 100)} onChange={handleChange}
                min={0} max={100} maxDigits={3} disabled={disabled || (topicId === 'division' && modifiers.division_mode === 'remainder')} />
            <Checkbox label="Allow negative answers" name="allow_negative_answers"
                checked={modifiers.allow_negative_answers} onChange={handleChange}
                disabled={disabled || (topicId !== 'subtraction' && topicId !== 'all')} />
            <label className="flex flex-col gap-xxs text-sm text-main-500">Division rule
                <select className="border border-main-300 rounded-sm bg-main-200 text-main-600 p-xs"
                    name="division_mode" value={modifiers.division_mode} onChange={handleChange}
                    disabled={disabled || (topicId !== 'division' && topicId !== 'all')}>
                    <option value="exact">Exact quotient</option><option value="remainder">Remainder</option><option value="decimal">Decimal quotient</option>
                </select>
            </label>
            <label className="flex flex-col gap-xxs text-sm text-main-500">Answer rounding (decimal places)
                <select className="border border-main-300 rounded-sm bg-main-200 text-main-600 p-xs"
                    name="answer_rounding" value={modifiers.answer_rounding ?? ''} onChange={handleChange} disabled={disabled}>
                    <option value="">Default</option>{[0, 1, 2, 3, 4, 5].map(value => (
                        <option key={value} value={value}>{value}</option>
                    ))}
                </select>
            </label>
        </div>
    );
}