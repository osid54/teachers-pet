import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import SectionAccordion from './SectionAccordion';

afterEach(cleanup);

const topic = { id: 'topic-1', topicId: 'addition', topicName: 'Addition', modifiers: {
    digits: 2, digit_mode: 'up_to', decimal_places: 0, negative_probability: 0,
    allow_negative_answers: false, division_mode: 'exact', answer_rounding: null,
} };

const makeTransfer = () => ({
    value: '', effectAllowed: '', types: ['text/plain'],
    setData(_type, value) { this.value = value; },
    getData() { return this.value; },
});

const baseProps = sections => ({
    sections, openSectionId: 'mixed', onToggleSection: vi.fn(), onAddSection: vi.fn(),
    onAddHeader: vi.fn(), onRemoveEntry: vi.fn(), onRenameHeader: vi.fn(),
    onUpdateSection: vi.fn(), onToggleSharedModifiers: vi.fn(), onSharedModifierChange: vi.fn(),
    onTopicModifierChange: vi.fn(), onRemoveTopic: vi.fn(), onReorderEntries: vi.fn(),
    onMoveTopic: vi.fn(),
});

describe('section accordion drag controls', () => {
    it('drags a standalone topic into a mixed parent', () => {
        const props = baseProps([
            { id: 'single', mode: 'single', topics: [topic], pageCount: 1, problemsPerPage: 10 },
            { id: 'mixed', mode: 'mixed', topics: [topic, { ...topic, id: 'topic-2' }], pageCount: 1, problemsPerPage: 10 },
        ]);
        render(<SectionAccordion {...props} />);
        const transfer = makeTransfer();
        fireEvent.dragStart(screen.getByRole('button', { name: 'Drag single section' }), { dataTransfer: transfer });
        const mixedParent = screen.getByRole('button', { name: /Mixed topics\s+2/ });
        fireEvent.dragOver(mixedParent, { dataTransfer: transfer });
        fireEvent.drop(mixedParent, { dataTransfer: transfer });
        expect(props.onMoveTopic).toHaveBeenCalledWith('single', 'topic-1', 'mixed');
        expect(props.onReorderEntries).not.toHaveBeenCalled();
    });

    it('still reorders headers as root entries', () => {
        const props = baseProps([
            { id: 'header', mode: 'header', title: 'Practice' },
            { id: 'mixed', mode: 'mixed', topics: [], pageCount: 1, problemsPerPage: 10 },
        ]);
        render(<SectionAccordion {...props} />);
        const transfer = makeTransfer();
        fireEvent.dragStart(screen.getByRole('button', { name: 'Drag header' }), { dataTransfer: transfer });
        fireEvent.drop(screen.getByRole('button', { name: /Mixed topics\s+0/ }), { dataTransfer: transfer });
        expect(props.onReorderEntries).toHaveBeenCalledWith('header', 'mixed');
        expect(props.onMoveTopic).not.toHaveBeenCalled();
    });

    it('reparents a topic subsection into a mixed parent', () => {
        const props = { ...baseProps([
            { id: 'single', mode: 'mixed', topics: [topic], pageCount: 1, problemsPerPage: 10 },
            { id: 'mixed', mode: 'mixed', topics: [], pageCount: 1, problemsPerPage: 10 },
        ]), openSectionId: 'single' };
        render(<SectionAccordion {...props} />);
        const transfer = makeTransfer();
        fireEvent.dragStart(screen.getByRole('button', { name: 'Drag Addition from Mixed topics' }), { dataTransfer: transfer });
        fireEvent.drop(screen.getByRole('button', { name: /Mixed topics\s+0/ }), { dataTransfer: transfer });
        expect(props.onMoveTopic).toHaveBeenCalledWith('single', 'topic-1', 'mixed');
        expect(props.onReorderEntries).not.toHaveBeenCalled();
    });

    it('shows a single topic as a named root with settings but no subsection', () => {
        const props = { ...baseProps([
            { id: 'single', mode: 'single', topics: [topic], pageCount: 1, problemsPerPage: 10 },
        ]), openSectionId: 'single' };
        render(<SectionAccordion {...props} />);
        expect(screen.getByRole('button', { name: 'Addition', exact: true })).toBeTruthy();
        expect(screen.getByLabelText('Pages in this section')).toBeTruthy();
        expect(screen.queryByLabelText('Integer-part digits')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Toggle settings for Addition' })).toBeNull();
        expect(screen.queryByLabelText('Share modifiers across this section')).toBeNull();
    });

    it('highlights open items and hides collapsed settings without unmounting their transition panel', () => {
        const props = { ...baseProps([
            { id: 'single', mode: 'single', topics: [topic], pageCount: 1, problemsPerPage: 10 },
        ]), openSectionId: 'single' };
        const view = render(<SectionAccordion {...props} />);
        const toggle = screen.getByRole('button', { name: 'Addition', exact: true });
        const root = toggle.closest('article');
        const panel = view.container.querySelector('#section-content-single');
        expect(root.getAttribute('data-open')).toBe('true');
        expect(root.className).toContain('ring-2');
        expect(panel.hasAttribute('inert')).toBe(false);
        view.rerender(<SectionAccordion {...props} openSectionId={null} />);
        expect(root.getAttribute('data-open')).toBe('false');
        expect(root.className).not.toContain('ring-2');
        expect(panel.getAttribute('aria-hidden')).toBe('true');
        expect(panel.hasAttribute('inert')).toBe(true);
        expect(panel.className).toContain('grid-rows-[0fr]');
        expect(screen.queryByRole('spinbutton', { name: 'Pages in this section' })).toBeNull();
    });

    it('toggles children independently and shows their inherited page values as read-only', () => {
        const props = baseProps([{ id: 'mixed', mode: 'mixed', topics: [topic], pageCount: 3, problemsPerPage: 12 }]);
        const view = render(<SectionAccordion {...props} />);
        fireEvent.click(screen.getByRole('button', { name: 'Toggle settings for Addition' }));
        const childPanel = view.container.querySelector('#topic-settings-topic-1');
        expect(childPanel.querySelector('[name="pageCount"]').disabled).toBe(true);
        expect(childPanel.querySelector('[name="pageCount"]').value).toBe('3');
        fireEvent.click(screen.getByRole('button', { name: 'Hide children of Mixed topics' }));
        expect(screen.queryByRole('button', { name: 'Toggle settings for Addition' })).toBeNull();
        expect(screen.getByRole('button', { name: /Mixed topics\s+1/ }).getAttribute('aria-expanded')).toBe('true');
        fireEvent.click(screen.getByRole('button', { name: 'Show children of Mixed topics' }));
        view.rerender(<SectionAccordion {...props} openSectionId={null} />);
        expect(screen.getByRole('button', { name: 'Toggle settings for Addition' })).toBeTruthy();
    });

    it('renders child rows outside their parent border in an indented sibling panel', () => {
        const props = baseProps([{ id: 'mixed', mode: 'mixed', topics: [topic], pageCount: 1, problemsPerPage: 10 }]);
        const view = render(<SectionAccordion {...props} />);
        const parent = screen.getByRole('button', { name: /^Mixed topics\s+1$/ }).closest('article');
        const child = screen.getByRole('button', { name: 'Toggle settings for Addition' }).closest('article');
        const childrenPanel = view.container.querySelector('#section-children-mixed');
        expect(parent.contains(child)).toBe(false);
        expect(childrenPanel.parentElement).toBe(parent.parentElement);
        expect(child.parentElement.className).toContain('ml-md');
        expect(child.className).toContain('rounded-sm border');
    });
});