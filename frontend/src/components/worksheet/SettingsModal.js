import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';

export function SettingsSection({ title, children }) {
    return (
        <fieldset className="min-w-0 border-t border-main-300 pt-md">
            <legend className="mb-sm pr-sm text-base font-semibold text-main-700">{title}</legend>
            <div className="flex min-w-0 flex-col gap-md">{children}</div>
        </fieldset>
    );
}

export default function SettingsModal({ title, description, onClose, onSubmit, actions, children, surfaceId }) {
    const titleId = useId();
    const dialogRef = useRef(null);
    useEffect(() => {
        const previousFocus = document.activeElement;
        const firstField = dialogRef.current?.querySelector('input:not(:disabled), textarea:not(:disabled), select:not(:disabled)');
        (firstField || dialogRef.current)?.focus({ preventScroll: true });
        return () => { if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true }); };
    }, []);

    const handleKeyDown = event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            onClose();
        }
        if (event.key !== 'Tab') return;
        const focusable = Array.from(dialogRef.current.querySelectorAll('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]'));
        const first = focusable[0];
        const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-md"
            onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
            <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
                data-topic-surface={surfaceId} onKeyDown={handleKeyDown}
                className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-md bg-main-100 shadow-xl">
                <form onSubmit={onSubmit} className="flex min-h-0 flex-col">
                    <header className="shrink-0 border-b border-main-300 px-lg py-md">
                        <div className="flex items-center justify-between gap-md">
                            <h2 id={titleId} className="m-0 min-w-0 text-lg font-bold text-main-700">{title}</h2>
                            <Button variant="ghost" onClick={onClose} aria-label="Close settings" title="Close"
                                className="h-9 w-9 shrink-0 rounded-sm p-0! hover:translate-y-0">
                                <X aria-hidden="true" size={20} />
                            </Button>
                        </div>
                        {description && <p className="m-0 mt-xs text-sm text-main-500">{description}</p>}
                    </header>
                    <div className="flex min-h-0 flex-col gap-lg overflow-y-auto p-lg">{children}</div>
                    <footer className="flex shrink-0 justify-end gap-sm border-t border-main-300 bg-main-100 px-lg py-md">
                        <Button variant="secondary" onClick={onClose}>Cancel</Button>
                        {actions}
                    </footer>
                </form>
            </section>
        </div>
    );
}