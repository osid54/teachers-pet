'use client';

import React from 'react';
import styles from '@/styles/components/ui/_button.module.scss';

/*
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The content inside the button (e.g., text, icon).
 * @param {string} [props.variant='primary'] - Visual style of the button ('primary', 'secondary', 'danger', 'accent').
 * @param {boolean} [props.disabled=false] - If true, the button is disabled.
 * @param {boolean} [props.isLoading=false] - If true, shows a loading state (e.g., spinner, or just disabled).
 * @param {string} [props.className=''] - Additional CSS classes for custom styling.
 * @param {function} props.onClick - Function to call when the button is clicked.
 * @param {string} [props.type='button'] - Button type ('button', 'submit', 'reset').
 */

export default function Button({
    children,
    variant = 'primary',
    disabled = false,
    isLoading = false,
    className = '',
    onClick,
    type = 'button',
    ...rest
}) {
    const buttonClasses = `${styles.button} ${styles[variant]} ${className} ${isLoading ? styles.loading : ''
        }`;

    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading ? 'Loading...' : children}
        </button>
    );
}