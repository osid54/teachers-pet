'use client';

import React, { useState, useEffect } from 'react';
import { Input, Checkbox } from '@/components/ui';
import styles from '@/styles/components/worksheet/_uniformSettingsForm.module.scss';

/*
 * @param {object} props - Component props.
 * @param {object} props.settings - Current uniform settings object.
 * @param {function} props.onChange - Callback when any setting changes.
 */

export default function UniformSettingsForm({ settings, onChange, mode }) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }
    
    return (
        <div className={`${styles.form} ${mode === 'multi' ? styles.multi : ''}`}>
            <Input
                label={settings.mixedProblems ? "Page Count" : "Pages Per Subject"}
                type="number"
                name="pageCount"
                value={settings.pageCount}
                onChange={onChange}
                min={1}
                max={50}
                step={1}
                maxDigits={2}
                labelPosition="top"
                className={styles.inputField}
            />
            <Input
                label="Problems Per Page"
                type="number"
                name="problemsPerPage"
                value={settings.problemsPerPage}
                onChange={onChange}
                min={1}
                max={50}
                step={1}
                maxDigits={2}
                labelPosition="top"
                className={styles.inputField}
            />
            {mode === 'multi' && (
                <Checkbox
                    label="Mixed Problems"
                    name="mixedProblems"
                    checked={settings.mixedProblems}
                    onChange={onChange}
                    labelPosition="top"
                    className={styles.checkboxField}
                />
            )}
            <Checkbox
                label={<>Answer<br/>Key</>}
                name="includeAnswerKey"
                checked={settings.includeAnswerKey}
                onChange={onChange}
                labelPosition="top"
                className={styles.checkboxField}
            />
        </div>
    );
}