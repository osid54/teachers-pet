import { useId } from 'react';

export default function Slider({ label, value, onChange, min = 0, max = 100, step = 1,
    disabled = false, formatValue = String, valueText, minLabel, maxLabel, name }) {
    const id = useId();
    return (
        <div className={`min-w-0 ${disabled ? 'opacity-60' : ''}`}>
            <div className="mb-xs flex items-center justify-between gap-sm">
                <label htmlFor={id} className="text-sm font-medium text-main-600">{label}</label>
                <output htmlFor={id} aria-hidden="true" className="text-sm font-semibold tabular-nums text-main-700">{formatValue(value)}</output>
            </div>
            <input id={id} type="range" name={name} min={min} max={max} step={step} value={value}
                onChange={event => onChange(Number(event.target.value))} disabled={disabled}
                aria-valuetext={valueText || formatValue(value)}
                className="block h-6 w-full cursor-pointer accent-main-600 focus-visible:outline-2 focus-visible:outline-main-600 disabled:cursor-not-allowed" />
            <div aria-hidden="true" className="mt-xxs flex justify-between text-xs text-main-500">
                <span>{minLabel ?? formatValue(min)}</span><span>{maxLabel ?? formatValue(max)}</span>
            </div>
        </div>
    );
}