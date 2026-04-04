'use client';

import React, { useState, useEffect } from 'react';
import { Input, Checkbox } from '@/components/ui';

export default function UniformSettingsForm({ settings, onChange, mode }) {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);
    if (!isMounted) return null;

    const gridCols = mode === 'multi'
        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

    return (
        <div className={`grid ${gridCols} gap-4 items-start p-sm`}>
            <Input
                label={settings.mixedProblems ? "Page Count" : "Pages Per Subject"}
                type="number"
                name="pageCount"
                value={settings.pageCount}
                onChange={onChange}
                min={1} max={50} maxDigits={2} labelPosition="top"
            />
            <Input
                label="Problems Per Page"
                type="number"
                name="problemsPerPage"
                value={settings.problemsPerPage}
                onChange={onChange}
                min={1} max={50} maxDigits={2} labelPosition="top"
            />
            {mode === 'multi' && (
                <Checkbox
                    label="Mixed Problems"
                    name="mixedProblems"
                    checked={settings.mixedProblems}
                    onChange={onChange}
                    labelPosition="top"
                />
            )}
            <Checkbox
                label={<>Answer<br />Key</>}
                name="includeAnswerKey"
                checked={settings.includeAnswerKey}
                onChange={onChange}
                labelPosition="top"
            />
        </div>
    );
}