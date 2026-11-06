import { Checkbox, Input } from '@/components/ui';
import RadioGroup from '@/components/ui/RadioGroup';
import Slider from '@/components/ui/Slider';

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
    const hasDivision = topicId === 'division' || topicId === 'all';
    const hasSubtraction = topicId === 'subtraction' || topicId === 'all';
    const remainder = hasDivision && modifiers.division_mode === 'remainder';
    const showRounding = topicId !== 'division' || modifiers.division_mode === 'decimal';
    const chance = Math.round(modifiers.negative_probability * 100);
    const update = changes => onChange({ ...modifiers, ...changes });
    const selectClass = 'min-h-10 w-full rounded-sm border border-main-300 bg-main-200 px-sm py-xs text-sm text-main-700 focus-visible:outline-2 focus-visible:outline-main-600 disabled:opacity-60';
    const sectionClass = 'min-w-0 border-t border-main-300 pt-md';
    const legendClass = 'mb-sm pr-sm text-base font-semibold text-main-700';

    return (
        <div className="flex min-w-0 flex-col gap-lg">
            <fieldset disabled={disabled} className={sectionClass}>
                <legend className={legendClass}>Number size</legend>
                <div className="grid gap-md min-[520px]:grid-cols-2">
                    <Input label="Number of digits" type="number" name="digits" value={modifiers.digits}
                        onChange={event => update({ digits: Number(event.target.value) })}
                        min={1} max={5} maxDigits={1} disabled={disabled} labelPosition="top" />
                    <label className="flex min-w-0 flex-col gap-xxs text-sm font-medium text-main-600">Decimal places
                        <select className={selectClass} name="decimal_places" value={modifiers.decimal_places}
                            onChange={event => update({ decimal_places: Number(event.target.value) })} disabled={disabled || remainder}>
                            <option value={0}>Whole numbers only</option>
                            {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} decimal {value === 1 ? 'place' : 'places'}</option>)}
                        </select>
                    </label>
                    <div className="min-[520px]:col-span-2">
                        <RadioGroup label="Number length" name={`digit_mode_${topicId}`} value={modifiers.digit_mode}
                            onChange={value => update({ digit_mode: value })} disabled={disabled}
                            options={[{ value: 'up_to', label: 'Up to this many digits' }, { value: 'strict', label: 'Exactly this many digits' }]} />
                    </div>
                </div>
            </fieldset>

            <fieldset disabled={disabled} className={sectionClass}>
                <legend className={legendClass}>Negative numbers</legend>
                <Slider label="Chance of a negative number" name="negative_probability_percent" value={chance}
                    onChange={value => update({ negative_probability: value / 100 })} step={25} disabled={disabled || remainder}
                    formatValue={value => `${value}%`} valueText={`${chance}% chance for each number`} minLabel="Never" maxLabel="Always" />
            </fieldset>

            <fieldset disabled={disabled} className={sectionClass}>
                <legend className={legendClass}>Answer settings</legend>
                <div className="flex flex-col gap-md">
                    {hasDivision && <RadioGroup label="Division answers" name={`division_mode_${topicId}`} value={modifiers.division_mode}
                        onChange={value => update(value === 'remainder'
                            ? { division_mode: value, decimal_places: 0, negative_probability: 0 } : { division_mode: value })}
                        disabled={disabled} options={[
                            { value: 'exact', label: 'Whole numbers' }, { value: 'remainder', label: 'With remainders' }, { value: 'decimal', label: 'Decimals' },
                        ]} />}
                    {hasSubtraction && <Checkbox label="Allow negative answers" name="allow_negative_answers"
                        checked={modifiers.allow_negative_answers} disabled={disabled}
                        onChange={event => update({ allow_negative_answers: event.target.checked })} />}
                    {showRounding && <label className="flex min-w-0 flex-col gap-xxs text-sm font-medium text-main-600">Round answers to
                        <select className={selectClass} name="answer_rounding" value={modifiers.answer_rounding ?? ''}
                            onChange={event => update({ answer_rounding: event.target.value === '' ? null : Number(event.target.value) })}
                            disabled={disabled}>
                            <option value="">Automatic</option><option value={0}>Nearest whole number</option>
                            {[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} decimal {value === 1 ? 'place' : 'places'}</option>)}
                        </select>
                    </label>}
                </div>
            </fieldset>
        </div>
    );
}