import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Input from '../ui/Input';
import SaveTemplateForm from './SaveTemplateForm';
import Sidebar from './Sidebar';
import TopicCustomizeModal from './TopicCustomizeModal';
import UniformSettingsForm from './UniformSettingsForm';
import SectionSettingsModal from './SectionSettingsModal';
import RadioGroup from '../ui/RadioGroup';
import Slider from '../ui/Slider';

afterEach(cleanup);

vi.mock('@/services/worksheetApi', () => ({ fetchTemplateTags: vi.fn(async () => ['Arithmetic', 'Backend-only tag']) }));

describe('worksheet settings', () => {
    it.each([2, 3])('evenly spaces %i sidebar controls while keeping icons close to their fields', count => {
        const view = render(<UniformSettingsForm settings={{ pageCount: 1, problemsPerPage: 10 }} onChange={vi.fn()}>
            {count === 3 && <button type="button">Share settings</button>}
        </UniformSettingsForm>);
        const row = view.container.firstElementChild;
        expect(row.style.gridTemplateColumns).toBe(`repeat(${count}, minmax(0, 1fr))`);
        for (const label of row.querySelectorAll('label')) {
            expect(label.className).toContain('justify-center');
            expect(label.className).toContain('gap-xxs');
            expect(label.className).not.toContain('justify-between');
        }
    });
    it('uses native radio choices and a slider with an accessible value', () => {
        const radioChange = vi.fn();
        const sliderChange = vi.fn();
        render(<>
            <RadioGroup label="Number length" options={[{ value: 'up_to', label: 'Up to' }, { value: 'strict', label: 'Exactly' }]}
                value="up_to" onChange={radioChange} />
            <Slider label="Negative numbers" value={25} valueText="25% chance for each number" onChange={sliderChange} />
        </>);
        expect(screen.getByRole('radio', { name: 'Up to' }).checked).toBe(true);
        fireEvent.click(screen.getByRole('radio', { name: 'Exactly' }));
        expect(radioChange).toHaveBeenCalledWith('strict');
        const slider = screen.getByRole('slider', { name: 'Negative numbers' });
        expect(slider.getAttribute('aria-valuetext')).toBe('25% chance for each number');
        fireEvent.change(slider, { target: { value: '50' } });
        expect(sliderChange).toHaveBeenCalledWith(50);
    });
    it('uses icons instead of visible captions while retaining accessible field names', () => {
        const view = render(<UniformSettingsForm settings={{ pageCount: 2, problemsPerPage: 10 }} onChange={vi.fn()} />);
        expect(screen.getByRole('spinbutton', { name: 'Pages in this section' }).value).toBe('2');
        expect(screen.getByRole('spinbutton', { name: 'Problems Per Page' }).value).toBe('10');
        expect(screen.queryByText('Pages')).toBeNull();
        expect(screen.queryByText('Per page')).toBeNull();
        expect(view.container.querySelectorAll('svg')).toHaveLength(2);
        expect(view.container.querySelector('label').title).toBe('Pages in this section');
    });
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
    modifiers: { digits: 2, digit_mode: 'up_to', decimal_places: 0, negative_probability: 0,
        allow_negative_answers: false, division_mode: 'exact', answer_rounding: null } }];
const section = { id: 'section-1', mode: 'single', topics, pageCount: 1, problemsPerPage: 10 };

describe('template saving', () => {
    it('keeps focus inside settings and supports Escape without saving', () => {
        const onClose = vi.fn();
        const onConfirm = vi.fn();
        render(<TopicCustomizeModal topic={topics[0]} subject="Arithmetic" sections={[section]}
            initialSectionId={section.id} customize editing onConfirm={onConfirm} onClose={onClose} />);
        expect(document.activeElement).toBe(screen.getByLabelText('Topic name'));
        const close = screen.getByRole('button', { name: 'Close settings' });
        const save = screen.getByRole('button', { name: 'Save changes' });
        close.focus();
        fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
        expect(document.activeElement).toBe(save);
        fireEvent.keyDown(save, { key: 'Tab' });
        expect(document.activeElement).toBe(close);
        fireEvent.keyDown(close, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledOnce();
        expect(onConfirm).not.toHaveBeenCalled();
    });
    it.each(['header', 'mixed'])('saves optional instructions from the %s settings modal', mode => {
        const onSave = vi.fn();
        const item = { ...section, mode, title: 'Practice' };
        render(<SectionSettingsModal section={item} onSave={onSave} onClose={vi.fn()} />);
        const instructions = screen.getByLabelText('Instructions (optional)');
        expect(instructions.value).toBe('');
        fireEvent.change(instructions, { target: { value: ' Show your work. ' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        expect(onSave).toHaveBeenCalledWith(item.id, expect.objectContaining({ instructions: 'Show your work.' }));
    });

    it('shows the fixed catalog description and replaces editable description/destination fields with instructions', () => {
        const onConfirm = vi.fn();
        render(<TopicCustomizeModal topic={{ id: 'addition', name: 'Addition', description: 'Not catalog text' }}
            subject="Arithmetic" sections={[]} customize onConfirm={onConfirm} onClose={vi.fn()} />);
        expect(screen.getByText('Basic addition problems.')).toBeTruthy();
        expect(screen.queryByLabelText('Description')).toBeNull();
        expect(screen.queryByLabelText('Add to section')).toBeNull();
        fireEvent.change(screen.getByLabelText('Instructions (optional)'), { target: { value: 'Show your work.' } });
        fireEvent.click(screen.getByRole('button', { name: 'Add topic' }));
        expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ instructions: 'Show your work.' }), 'new');
        expect(onConfirm.mock.calls[0][0]).not.toHaveProperty('description');
    });
    it('offers the three compact answer-key choices with their original request values', () => {
        const onChange = vi.fn();
        render(<Sidebar sections={[section]} answerKeyMode="none" onAnswerKeyModeChange={onChange} />);
        expect(screen.getByRole('button', { name: 'None', exact: true }).getAttribute('aria-pressed')).toBe('true');
        fireEvent.click(screen.getByRole('button', { name: 'Inline', exact: true }));
        expect(onChange).toHaveBeenLastCalledWith('inline');
        fireEvent.click(screen.getByRole('button', { name: 'After', exact: true }));
        expect(onChange).toHaveBeenLastCalledWith('separate');
    });
    it('edits an existing topic without offering a destination and respects parent-owned modifiers', () => {
        const onConfirm = vi.fn();
        render(<TopicCustomizeModal topic={topics[0]} subject="Arithmetic" sections={[section]}
            initialSectionId={section.id} customize editing sharedModifiers={topics[0].modifiers}
            onConfirm={onConfirm} onClose={vi.fn()} />);
        expect(screen.queryByLabelText('Add to section')).toBeNull();
        expect(screen.getByLabelText('Number of digits').disabled).toBe(true);
        fireEvent.change(screen.getByLabelText('Topic name'), { target: { value: 'Warm-up' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ id: topics[0].id, topicName: 'Warm-up' }), section.id);
    });
    it('does not save shared operation-specific values as a new child override', () => {
        const onConfirm = vi.fn();
        const parent = { ...section, mode: 'mixed', shareModifiers: true,
            sharedModifiers: { ...topics[0].modifiers, allow_negative_answers: true, digits: 4 } };
        render(<TopicCustomizeModal topic={{ id: 'addition', name: 'Addition' }} subject="Arithmetic"
            sections={[parent]} initialSectionId={parent.id} customize onConfirm={onConfirm} onClose={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Add topic' }));
        expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({
            modifiers: expect.objectContaining({ allow_negative_answers: false, digits: 2 }),
        }), parent.id);
    });
    it('includes sections, workflow, and answer-key mode in the saved payload', () => {
        const onSubmit = vi.fn();
        render(<SaveTemplateForm sections={[section]} workflowMode="accordion" answerKeyMode="separate" onSubmit={onSubmit} />);
        fireEvent.change(screen.getByLabelText('Template Name'), { target: { value: 'Practice' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Template' }));
        expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ name: 'Practice',
            settings_json: { sections: [section], workflowMode: 'accordion', answerKeyMode: 'separate' } }));
    });

    it('presents the save form as a dialog and restores focus after Escape', () => {
        const onClose = vi.fn();
        const onSubmit = vi.fn();
        function FormHost() {
            const [isOpen, setIsOpen] = useState(false);
            return <>
                <button type="button" onClick={() => setIsOpen(true)}>Open save form</button>
                {isOpen && <SaveTemplateForm sections={[section]} answerKeyMode="none" onSubmit={onSubmit}
                    onClose={() => { onClose(); setIsOpen(false); }} />}
            </>;
        }
        render(<FormHost />);
        const opener = screen.getByRole('button', { name: 'Open save form' });
        opener.focus();
        fireEvent.click(opener);
        const dialog = screen.getByRole('dialog', { name: 'Save Template' });
        const nameField = screen.getByLabelText('Template Name');
        const cancel = screen.getByRole('button', { name: 'Cancel' });
        expect(dialog.getAttribute('aria-modal')).toBe('true');
        expect(document.activeElement).toBe(nameField);
        cancel.focus();
        fireEvent.keyDown(cancel, { key: 'Tab' });
        expect(document.activeElement).toBe(nameField);
        fireEvent.keyDown(nameField, { key: 'Tab', shiftKey: true });
        expect(document.activeElement).toBe(cancel);
        fireEvent.keyDown(cancel, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledOnce();
        expect(onSubmit).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(opener);
    });

    it('summarizes the worksheet and explains public sharing while keeping templates private by default', () => {
        const mixedSection = { ...section, id: 'mixed', mode: 'mixed', topics: [
            topics[0], { ...topics[0], id: 'two', topicId: 'subtraction', topicName: 'Subtraction' },
        ], pageCount: 1, problemsPerPage: 5 };
        render(<SaveTemplateForm sections={[{ ...section, pageCount: 2 }, mixedSection]}
            answerKeyMode="separate" onSubmit={vi.fn()} onClose={vi.fn()} />);
        const summary = screen.getByRole('region', { name: 'Worksheet summary' });
        expect(summary.textContent).toContain('Addition, Addition, Subtraction');
        const values = Object.fromEntries([...summary.querySelectorAll('dt')]
            .map(label => [label.textContent, label.nextElementSibling.textContent]));
        expect(values).toEqual({ Sections: '2', Topics: '3', Pages: '3', Problems: '25', 'Answer key': 'After' });
        expect(screen.getByRole('checkbox', { name: 'Make Public' }).checked).toBe(false);
        expect(screen.getByText(/Anyone can view their details and use a copy/)).toBeTruthy();
    });

    it('blocks saving worksheets beyond the generation problem limit', () => {
        const onSubmit = vi.fn();
        const oversizedSections = Array.from({ length: 5 }, (_, index) => ({
            id: `section-${index}`, mode: 'single', topics: [{ ...topics[0], id: `topic-${index}` }],
            pageCount: 50, problemsPerPage: 50,
        }));
        render(<SaveTemplateForm sections={oversizedSections} answerKeyMode="none" onSubmit={onSubmit} />);
        fireEvent.change(screen.getByLabelText('Template Name'), { target: { value: 'Oversized practice' } });
        fireEvent.click(screen.getByRole('button', { name: 'Save Template' }));
        expect(screen.getByRole('alert').textContent).toContain('10,000 problems');
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('opens the sidebar form without undefined handlers and supports cancellation', () => {
        render(<Sidebar sections={[section]} openSectionId={section.id} answerKeyMode="none"
            onAnswerKeyModeChange={vi.fn()} onSaveTemplate={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Save template' }));
        expect(screen.getByLabelText('Template Name')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByLabelText('Template Name')).toBeNull();
    });
});