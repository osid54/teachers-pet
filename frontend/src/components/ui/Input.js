'use client';

import React, { useState, useEffect } from 'react';

export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    disabled = false,
    className = '',
    id,
    min,
    max,
    step,
    labelPosition = 'inline',
    maxDigits,
    name,
    ...rest
}) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const formatValue = (val) => (val === null || val === undefined ? '' : String(val));
    const [internalValue, setInternalValue] = useState(formatValue(value));

    useEffect(() => {
        setInternalValue(formatValue(value));
    }, [value]);

    const handleInputChange = (event) => {
        let val = event.target.value;

        if (type === 'number') {
            val = val.replace(/[^0-9]/g, '');
            if (maxDigits && val.length > maxDigits) {
                val = val.slice(0, maxDigits);
            }
        }

        setInternalValue(val);

        onChange(event);
    };

    const handleInputBlur = (event) => {
        if (type === 'number') {
            let finalValue = event.target.value;
            if (finalValue === '') finalValue = String(min ?? 0);

            const numValue = parseInt(finalValue, 10);
            if (!isNaN(numValue)) {
                if (min !== undefined && numValue < min) finalValue = String(min);
                if (max !== undefined && numValue > max) finalValue = String(max);
            }

            setInternalValue(finalValue);
            onChange(event);
        }
    };

    const containerClasses = `w-full flex items-center justify-center gap-sm ${labelPosition === 'top' ? 'flex-col gap-xxs' : ''} ${className}`;
    const labelClasses = `text-sm text-main-500 font-medium text-center ${labelPosition === 'top' ? 'w-[80%] block mb-0' : 'w-1/2'} ${type === 'number' ? 'w-1/2' : ''}`;
    const inputClasses = `border border-main-300 rounded-sm text-base text-main-600 bg-main-200 p-sm transition-all pr-xs
                        focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-300 
                        disabled:bg-main-300 disabled:cursor-not-allowed disabled:opacity-80
                        placeholder:text-main-500 placeholder:opacity-70 
                        ${type === 'number' ? 'w-16' : 'w-full'}`;

    return (
        <div className={containerClasses}>
            {label && <label htmlFor={inputId} className={labelClasses}>{label}</label>}
            <div className="w-1/2 flex items-center justify-center">
                <input
                    id={inputId}
                    type={type}
                    value={internalValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={inputClasses}
                    {...rest}
                />
            </div>
        </div>
    );
}