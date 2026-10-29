import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Input from '../ui/Input';
import SaveTemplateForm from './SaveTemplateForm';
import Sidebar from './Sidebar';

afterEach(cleanup);

describe('worksheet settings', () => {
    it('forwards field metadata and clamps the value sent to its parent on blur', () => {
        const changes = [];
        function Settings() {
            const [value, setValue] = useState(1);
            return <Input label="Pages" name="pageCount" type="number" min={1} max={50} step={1}
                value={value} onChange={event => {
                    changes.push({ name: event.target.name, value: event.target.value });
                    setValue(event.target.value);
                }} />;
        }
        render(<Settings />);
        const field = screen.getByLabelText('Pages');
        expect(field.name).toBe('pageCount');
        expect(field.step).toBe('1');
        fireEvent.change(field, { target: { value: '99' } });
        fireEvent.blur(field);
        expect(field.value).toBe('50');
        expect(changes.at(-1)).toEqual({ name: 'pageCount', value: '50' });
    });

    it('sends the truncated value to its parent and restores an empty number to its minimum', () => {
        const onChange = vi.fn(event => event.target.value);
        render(<Input label="Digits" type="number" min={1} maxDigits={1} value={2} onChange={onChange} />);
        const field = screen.getByLabelText('Digits');
        fireEvent.change(field, { target: { value: '123' } });
        expect(onChange.mock.results.at(-1).value).toBe('1');
        fireEvent.change(field, { target: { value: '' } });
        fireEvent.blur(field);
        expect(onChange.mock.results.at(-1).value).toBe('1');
    });

    it('allows text inputs without a change callback', () => {
        render(<Input label="Contact name" />);
        fireEvent.change(screen.getByLabelText('Contact name'), { target: { value: 'Teacher' } });
        expect(screen.getByLabelText('Contact name').value).toBe('Teacher');
    });
});

const topics = [{ id: 'one', subject: 'Arithmetic', topicId: 'addition', topicName: 'Addition',
    modifiers: { problem: { digits: 2, dec: 0, neg: 0 }, answer: { round: 0 } } }];
const settings = { pageCount: 1, problemsPerPage: 10, mixedProblems: false, includeAnswerKey: true };

describe('template saving', () => {
    it('includes the selection mode and current settings in the saved payload', () => {
        const onSubmit = vi.fn();
        render(<SaveTemplateForm currentSelectedTopics={topics} currentUniformSettings={settings}
            mode="multi" onSubmit={onSubmit} />);
        fireEvent.change(screen.getByLabelText('Template Name'), { target: { value: 'Practice' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Template' }));
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Practice',
            settings_json: { selectedTopicInstances: topics, uniformSettings: settings, topicSelectionMode: 'multi' } }));
    });

    it('opens the sidebar form without undefined handlers and supports cancellation', () => {
        render(<Sidebar mode="single" selectedTopicInstances={topics} uniformSettings={settings}
            onSaveTemplate={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Save template' }));
        expect(screen.getByLabelText('Template Name')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByLabelText('Template Name')).toBeNull();
    });
});