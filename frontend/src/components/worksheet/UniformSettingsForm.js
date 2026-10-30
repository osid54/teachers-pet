'use client';

import { Input } from '@/components/ui';

export default function UniformSettingsForm({ settings, onChange }) {
    return (
        <div className="grid grid-cols-1 min-[769px]:grid-cols-2 gap-sm min-[1025px]:gap-md items-start p-sm">
            <Input
                label="Pages in this section"
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
        </div>
    );
}