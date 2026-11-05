import { useId } from 'react';

export default function RadioGroup({ label, name, options, value, onChange, disabled = false }) {
    const generatedId = useId();
    return (
        <fieldset disabled={disabled} className="min-w-0 disabled:opacity-60">
            <legend className="mb-xxs text-sm font-medium text-main-600">{label}</legend>
            <div className="grid gap-xxs" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
                {options.map(option => <label key={option.value} className="relative min-w-0 cursor-pointer">
                    <input type="radio" name={name || generatedId} value={option.value} checked={value === option.value}
                        onChange={() => onChange(option.value)} disabled={disabled} className="peer sr-only" />
                    <span className="flex min-h-10 items-center justify-center rounded-sm border border-main-300 bg-main-200 px-xs py-xs text-center text-sm leading-snug text-main-600 peer-checked:border-main-500 peer-checked:bg-main-300 peer-checked:text-main-800 peer-focus-visible:outline-2 peer-focus-visible:outline-main-600 peer-disabled:cursor-not-allowed">
                        {option.label}
                    </span>
                </label>)}
            </div>
        </fieldset>
    );
}