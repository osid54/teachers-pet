import { useId } from 'react';

export default function Textarea({ label, id, className = '', rows = 3, ...props }) {
    const generatedId = useId();
    const inputId = id || generatedId;
    return (
        <div className={`min-w-0 ${className}`}>
            <label htmlFor={inputId} className="mb-xxs block text-sm font-medium text-main-600">{label}</label>
            <textarea id={inputId} rows={rows}
                className="block w-full min-w-0 resize-y rounded-sm border border-main-300 bg-main-200 px-md py-sm text-base text-main-700 focus:border-main-500 focus:outline-1 focus:outline-main-500 disabled:cursor-not-allowed disabled:opacity-60"
                {...props} />
        </div>
    );
}