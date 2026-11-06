import { RotateCw, X } from 'lucide-react';
import { Button, Checkbox } from '@/components/ui';
import { useTemplateTags } from '@/hooks/useTemplateTags';

export default function TemplateTagSelector({ value, onChange, label = 'Tags', disabled = false }) {
    const catalog = useTemplateTags();
    const unavailable = catalog.status === 'ready' ? value.filter(tag => !catalog.tags.includes(tag)) : [];
    return (
        <fieldset className="min-w-0" disabled={disabled}>
            <legend className="mb-sm text-sm font-medium text-main-600">{label}</legend>
            {(catalog.status === 'idle' || catalog.status === 'loading') && <p role="status" className="m-0 text-sm text-main-500">Loading tags...</p>}
            {catalog.error && <div role="status" className="flex flex-wrap items-center gap-sm text-sm text-main-600">
                <span>{catalog.error}</span>
                <Button variant="ghost" onClick={catalog.retry} aria-label="Retry loading tags" className="h-9 text-sm text-main-600!">
                    <RotateCw aria-hidden="true" size={14} /> Retry
                </Button>
            </div>}
            {catalog.status === 'ready' && !catalog.tags.length && <p className="m-0 text-sm text-main-500">No tags available.</p>}
            {catalog.tags.length > 0 && <div className="grid grid-cols-2 gap-sm min-[520px]:grid-cols-4">
                {catalog.tags.map(tag => <Checkbox key={tag} label={tag} checked={value.includes(tag)} disabled={disabled}
                    onChange={event => onChange(event.target.checked ? [...value, tag] : value.filter(item => item !== tag))} />)}
            </div>}
            {unavailable.length > 0 && <div className="mt-sm flex flex-wrap items-center gap-xs">
                <span className="text-xs text-main-600">Unavailable tags</span>
                {unavailable.map(tag => <Button key={tag} variant="ghost" title={`Remove ${tag}`} aria-label={`Remove tag ${tag}`}
                    onClick={() => onChange(value.filter(item => item !== tag))} className="min-w-0 text-xs text-main-600!">
                    <span className="break-words">{tag}</span><X aria-hidden="true" size={13} className="shrink-0" />
                </Button>)}
            </div>}
        </fieldset>
    );
}