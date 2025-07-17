'use client';

import React from 'react';
import styles from '@/styles/components/ui/_checkbox.module.scss';

/*
 * @param {object} props - Component props.
 * @param {string} props.label - The label text for the checkbox.
 * @param {boolean} props.checked - The current checked state of the checkbox.
 * @param {function} props.onChange - Callback function when the checkbox state changes.
 * @param {boolean} [props.disabled=false] - If true, the checkbox is disabled.
 * @param {string} [props.className=''] - Additional CSS classes.
 * @param {string} [props.id] - Unique ID for the checkbox and label association.
 */

export default function Checkbox({
    label,
    checked,
    onChange,
    disabled = false,
    className = '',
    id,
    ...rest
}) {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`${styles.checkboxGroup} ${className}`}>
            <input
                type="checkbox"
                id={checkboxId}
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className={styles.checkbox}
                {...rest}
            />
            {label && (
                <label htmlFor={checkboxId} className={styles.label}>
                    {label}
                </label>
            )}
        </div>
    );
}