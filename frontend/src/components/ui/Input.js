'use client';

import React from 'react';
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
    ...rest
}) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`${styles.inputGroup} ${styles[labelPosition]} ${className}`}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
            )}
            <input
                id={inputId}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className={styles.input}
                min={min}
                max={max}
                step={step}
                {...rest}
            />
        </div>
    );
}