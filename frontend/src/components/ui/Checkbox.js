'use client';

import { useId } from 'react';

export default function Checkbox({
    label,
    checked,
    onChange,
    disabled = false,
    className = '',
    id,
    labelPosition = 'inline',
    ...rest
}) {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    const containerClasses = `flex items-center gap-sm ${labelPosition === 'top' ? 'flex-col items-start' : ''} ${className}`;
    const checkboxClasses = 'h-5 w-5 shrink-0 cursor-pointer rounded-sm border border-main-300 accent-main-600 focus-visible:outline-2 focus-visible:outline-main-600 disabled:cursor-not-allowed disabled:opacity-60';
    const labelClasses = `min-w-0 cursor-pointer text-sm font-medium text-main-600 ${labelPosition === 'top' ? 'order-first' : ''}`;

    return (
        <div className={containerClasses}>
            <input
                type="checkbox"
                id={checkboxId}
                checked={Boolean(checked)}
                onChange={onChange}
                disabled={disabled}
                className={checkboxClasses}
                {...rest}
            />
            {label && <label htmlFor={checkboxId} className={labelClasses}>{label}</label>}
        </div>
    );
}