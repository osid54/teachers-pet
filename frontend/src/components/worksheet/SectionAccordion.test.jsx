import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SectionAccordion from './SectionAccordion';

const topic = { id: 'topic-1', topicId: 'addition', topicName: 'Addition', modifiers: {
    digits: 2, digit_mode: 'up_to', decimal_places: 0, negative_probability: 0,
    allow_negative_answers: false, division_mode: 'exact', answer_rounding: null,
} };

const makeTransfer = () => ({
    value: '', effectAllowed: '',
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
    it('reorders root entries without treating a section as a child topic', () => {
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
        expect(props.onReorderEntries).toHaveBeenCalledWith('single', 'mixed');
        expect(props.onMoveTopic).not.toHaveBeenCalled();
    });

    it('reparents a topic subsection into a mixed parent', () => {
        const props = { ...baseProps([
            { id: 'single', mode: 'single', topics: [topic], pageCount: 1, problemsPerPage: 10 },
            { id: 'mixed', mode: 'mixed', topics: [], pageCount: 1, problemsPerPage: 10 },
        ]), openSectionId: 'single' };
        render(<SectionAccordion {...props} />);
        const transfer = makeTransfer();
        fireEvent.dragStart(screen.getByRole('button', { name: 'Drag Addition from Single topic' }), { dataTransfer: transfer });
        fireEvent.drop(screen.getByRole('button', { name: /Mixed topics\s+0/ }), { dataTransfer: transfer });
        expect(props.onMoveTopic).toHaveBeenCalledWith('single', 'topic-1', 'mixed');
        expect(props.onReorderEntries).not.toHaveBeenCalled();
    });
});