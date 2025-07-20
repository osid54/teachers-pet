'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/components/ui/_input.module.scss';

/*
 * @param {object} props - Component props.
 * @param {string} props.label - The label for the input field.
 * @param {string} [props.type='text'] - The type of input ('text', 'number', 'email', 'password', etc.).
 * @param {string} props.value - The current value of the input.
 * @param {function} props.onChange - Callback function when the input value changes.
 * @param {string} [props.placeholder=''] - Placeholder text for the input.
 * @param {boolean} [props.disabled=false] - If true, the input is disabled.
 * @param {string} [props.className=''] - Additional CSS classes.
 * @param {string} [props.id] - Unique ID for the input and label association.
 * @param {number} [props.min] - Minimum value for number inputs.
 * @param {number} [props.max] - Maximum value for number inputs.
 * @param {number} [props.step] - Step value for number inputs.
 */

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

    const getInitialNumberValue = (val, minProp) => {
        if (typeof val === 'number') {
            return String(val);
        }
        if (val === null || val === undefined || val === '') {
            return String(minProp !== undefined ? minProp : 0);
        }
        return String(val);
    };

    const initialInternalValue =
        type === 'number'
            ? getInitialNumberValue(value, min)
            : String(value || '');

    const [internalValue, setInternalValue] = useState(initialInternalValue);

    useEffect(() => {
        const parentValueString =
            type === 'number'
                ? getInitialNumberValue(value, min)
                : String(value || '');

        if (parentValueString !== internalValue) {
            setInternalValue(parentValueString);
        }
    }, [value, min, type, internalValue, label]);

    const handleInputChange = (event) => {
        let rawInputValue = event.target.value;

        if (type === 'number') {
            rawInputValue = rawInputValue.replace(/[^0-9]/g, '');

            if (maxDigits !== undefined && rawInputValue.length > maxDigits) {
                rawInputValue = rawInputValue.slice(0, maxDigits);
            }
        }

        setInternalValue(rawInputValue);

        onChange({
            ...event,
            target: {
                ...event.target,
                name: event.target.name,
                value: rawInputValue,
            },
        });
    };

    const handleInputBlur = (event) => {
        if (type === 'number') {
            let finalValue = event.target.value;

            if (finalValue === '') { 
                finalValue = String(min !== undefined ? min : 0);
            }

            const numValue = parseInt(finalValue, 10);

            if (!isNaN(numValue)) {
                if (min !== undefined && numValue < min) {
                    finalValue = String(min);
                }
                if (max !== undefined && numValue > max) {
                    finalValue = String(max);
                }
            } else {
                finalValue = String(min !== undefined ? min : 0);
            }

            if (String(value || '') !== finalValue) {
                onChange({
                    ...event,
                    target: {
                        ...event.target,
                        name: event.target.name,
                        value: finalValue,
                    },
                });
            }
            setInternalValue(finalValue);
        }
    };

    return (
        <div className={`${styles.inputGroup} ${styles[labelPosition]} ${styles[type]} ${className}`}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                value={internalValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder={placeholder}
                disabled={disabled}
                className={styles.input}
                min={min}
                max={max}
                step={step}
                name={name}
                {...rest}
            />
        </div>
    );
}