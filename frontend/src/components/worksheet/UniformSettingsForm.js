'use client';

import React from 'react';
import { Input, Checkbox } from '@/components/ui';
import styles from '@/styles/components/worksheet/_uniformSettingsForm.module.scss';

/*
 * @param {object} props - Component props.
 * @param {object} props.settings - Current uniform settings object.
 * @param {function} props.onChange - Callback when any setting changes.
 */

export default function UniformSettingsForm({ settings, onChange }) {
    return (
        <div className={styles.form}>
            <Input
                label="Pages Per Subject"
                type="number"
                name="pageCount"
                value={settings.pageCount}
                onChange={onChange}
                min={1}
                max={50}
                step={1}
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
                labelPosition="top"
                className={styles.inputField}
            />
            <Checkbox
                label="Include Answer Key"
                name="includeAnswerKey"
                checked={settings.includeAnswerKey}
                onChange={onChange}
                labelPosition="top"
                className={styles.checkboxField}
            />
        </div>
    );
}