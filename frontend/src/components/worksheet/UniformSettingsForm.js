'use client';

export default function UniformSettingsForm({ settings, onChange, disabled = false }) {
    const clamp = event => {
        const numeric = Number(event.target.value);
        event.target.value = String(Math.max(1, Math.min(50, Number.isFinite(numeric) ? Math.trunc(numeric) : 1)));
        onChange?.(event);
    };
    return (
        <div className="grid grid-cols-2 gap-sm">
            {[['pageCount', 'Pages', 'Pages in this section'], ['problemsPerPage', 'Per page', 'Problems Per Page']].map(([name, label, accessibleLabel]) => (
                <label key={name} className="flex min-w-0 items-center justify-between gap-xs text-xs text-main-600">
                    <span>{label}</span>
                    <input type="number" name={name} aria-label={accessibleLabel} min={1} max={50} step={1}
                        value={settings[name] ?? 1} disabled={disabled} onChange={onChange} onBlur={clamp}
                        className="h-8 w-14 min-w-0 rounded-sm border border-main-300 bg-main-200 px-xs text-sm text-main-700 disabled:opacity-60" />
                </label>
            ))}
        </div>
    );
}