'use client';

import { Children } from 'react';
import { Files, ListOrdered } from 'lucide-react';

export default function UniformSettingsForm({ settings, onChange, disabled = false, children }) {
    const extraControls = Children.toArray(children);
    const clamp = event => {
        const numeric = Number(event.target.value);
        event.target.value = String(Math.max(1, Math.min(50, Number.isFinite(numeric) ? Math.trunc(numeric) : 1)));
        onChange?.(event);
    };
    return (
        <div className="grid min-w-0 items-center gap-xs"
            style={{ gridTemplateColumns: `repeat(${2 + extraControls.length}, minmax(0, 1fr))` }}>
            {[['pageCount', Files, 'Pages in this section'], ['problemsPerPage', ListOrdered, 'Problems Per Page']].map(([name, Icon, accessibleLabel]) => (
                <label key={name} title={accessibleLabel} className="flex min-w-0 items-center justify-center gap-xxs text-main-600">
                    <Icon aria-hidden="true" size={16} className="shrink-0" />
                    <input type="number" name={name} aria-label={accessibleLabel} min={1} max={50} step={1}
                        value={settings[name] ?? 1} disabled={disabled} onChange={onChange} onBlur={clamp}
                        className="h-8 w-14 min-w-0 rounded-sm border border-main-300 bg-main-200 px-xs text-sm text-main-700 disabled:opacity-60" />
                </label>
            ))}
            {extraControls.map(control => <div key={control.key} className="flex min-w-0 justify-center">{control}</div>)}
        </div>
    );
}