'use client';

import React from 'react';

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
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    const containerClasses = `flex cursor-pointer items-center justify-center gap-sm ${labelPosition === 'top' ? 'flex-col gap-xxs' : ''} ${className}`;
    const checkboxClasses = `appearance-none w-[28px] h-[28px] border border-main-300 rounded-sm bg-main-200 m-xs cursor-pointer relative transition-all
                             checked:after:content-['✔'] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-main-500 checked:after:text-[14px] 
                             hover:not-disabled:-translate-y-[1px] 
                             focus:outline-none focus:border-main-500 focus:ring-1 focus:ring-main-300 
                             disabled:cursor-not-allowed disabled:opacity-70`;
    const labelClasses = `text-sm text-main-500 font-medium text-center ${labelPosition === 'top' ? 'order-first w-[80%]' : 'w-1/2'}`;

    return (
        <div className={containerClasses}>
            {label && (
                <label htmlFor={checkboxId} className={labelClasses}>
                    {label}
                </label>
            )}
            <div className="w-1/2 flex items-center justify-center">
                <input
                    type="checkbox"
                    id={checkboxId}
                    checked={Boolean(checked)}
                    onChange={onChange}
                    disabled={disabled}
                    className={checkboxClasses}
                    {...rest}
                />
            </div>
        </div>
    );
}